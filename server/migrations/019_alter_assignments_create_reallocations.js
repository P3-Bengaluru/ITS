/**
 * MIGRATION 019 — alter assignments + create reallocations
 *
 * Changes from v1 → v2:
 *  • assignments: rename status 'approved' → 'assigned', add return_required
 *  • Create reallocations table (asset transfer with PM approval)
 */
exports.up = async (knex) => {

  // ── Alter assignments ────────────────────────────────────
  // Drop old status CHECK, update data, add new CHECK
  await knex.schema.raw(`
    ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_status_check;
  `);

  // Rename 'approved' → 'assigned' in existing data
  await knex('assignments').where({ status: 'approved' }).update({ status: 'assigned' });

  await knex.schema.raw(`
    ALTER TABLE assignments ADD CONSTRAINT assignments_status_check
      CHECK (status IN ('pending','assigned','rejected','returned','overdue'));
  `);

  // ── Create reallocations ─────────────────────────────────
  await knex.schema.createTable('reallocations', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());

    t.uuid('asset_id').notNullable()
      .references('id').inTable('assets').onDelete('RESTRICT');
    t.uuid('from_user_id').notNullable()
      .references('id').inTable('users').onDelete('RESTRICT');
    t.uuid('to_user_id').notNullable()
      .references('id').inTable('users').onDelete('RESTRICT');

    t.string('status', 20).notNullable().defaultTo('pending')
      .checkIn(['pending','approved','rejected','completed'], 'reallocations_status_check');

    t.uuid('requested_by').notNullable()
      .references('id').inTable('users').onDelete('RESTRICT');
    t.uuid('approved_by').nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    t.string('approver_role', 20).nullable();

    t.text('reason').nullable();
    t.text('rejection_reason').nullable();
    t.text('notes').nullable();

    t.timestamp('requested_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('approved_at').nullable();
    t.timestamp('completed_at').nullable();

    t.timestamps(true, true);
  });

  await knex.schema.raw(`
    CREATE INDEX idx_reallocations_asset  ON reallocations(asset_id);
    CREATE INDEX idx_reallocations_from   ON reallocations(from_user_id);
    CREATE INDEX idx_reallocations_to     ON reallocations(to_user_id);
    CREATE INDEX idx_reallocations_status ON reallocations(status);
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw(`
    DROP INDEX IF EXISTS idx_reallocations_asset;
    DROP INDEX IF EXISTS idx_reallocations_from;
    DROP INDEX IF EXISTS idx_reallocations_to;
    DROP INDEX IF EXISTS idx_reallocations_status;
  `);
  await knex.schema.dropTableIfExists('reallocations');

  // Revert assignments status
  await knex('assignments').where({ status: 'assigned' }).update({ status: 'approved' });
  await knex.schema.raw(`
    ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_status_check;
    ALTER TABLE assignments ADD CONSTRAINT assignments_status_check
      CHECK (status IN ('pending','approved','rejected','returned','overdue'));
  `);
};
