/**
 * MIGRATION 017 — alter consumables (stock counters + summary view)
 *
 * Changes from v1 → v2:
 *  • Add consumed_total  — lifetime total issued/disposed
 *  • Add total_received  — lifetime total received (add + return)
 *  • Backfill both from existing stock_transactions
 *  • Create consumable_stock_summary view
 */
exports.up = async (knex) => {

  await knex.schema.alterTable('consumables', (t) => {
    t.integer('consumed_total').notNullable().defaultTo(0).after('quantity');
    t.integer('total_received').notNullable().defaultTo(0).after('consumed_total');
  });

  // Backfill from existing stock_transactions
  await knex.schema.raw(`
    UPDATE consumables c
    SET consumed_total = COALESCE((
          SELECT SUM(ABS(quantity))
          FROM   stock_transactions
          WHERE  consumable_id = c.id
          AND    type IN ('issue','disposal')
        ), 0),
        total_received = COALESCE((
          SELECT SUM(ABS(quantity))
          FROM   stock_transactions
          WHERE  consumable_id = c.id
          AND    type IN ('add','return')
        ), 0);
  `);

  // Also add recipient_user_id to stock_transactions if not already present
  const hasFk = await knex.schema.hasColumn('stock_transactions', 'recipient_user_id');
  if (!hasFk) {
    await knex.schema.alterTable('stock_transactions', (t) => {
      t.uuid('recipient_user_id').nullable()
        .references('id').inTable('users').onDelete('SET NULL')
        .after('recipient');
    });
  }

  // Create the summary view
  await knex.schema.raw(`
    CREATE OR REPLACE VIEW consumable_stock_summary AS
    SELECT
        c.id,
        c.sku,
        c.name,
        c.unit,
        c.quantity            AS in_stock,
        c.consumed_total      AS total_consumed,
        c.total_received,
        c.min_threshold,
        CASE WHEN c.quantity <= c.min_threshold THEN TRUE ELSE FALSE END AS is_low_stock,
        cat.name  AS category_name,
        l.full_path AS location
    FROM consumables c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN location_full_path l ON c.location_id = l.id
    WHERE c.is_active = TRUE;
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw('DROP VIEW IF EXISTS consumable_stock_summary;');

  const hasFk = await knex.schema.hasColumn('stock_transactions', 'recipient_user_id');
  if (hasFk) {
    await knex.schema.alterTable('stock_transactions', (t) => {
      t.dropColumn('recipient_user_id');
    });
  }

  await knex.schema.alterTable('consumables', (t) => {
    t.dropColumn('consumed_total');
    t.dropColumn('total_received');
  });
};
