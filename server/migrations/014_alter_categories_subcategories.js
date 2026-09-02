/**
 * MIGRATION 014 — alter categories (sub-categories via parent_id)
 *
 * Changes from v1 → v2:
 *  • Add parent_id  (self-referencing FK — NULL means root category)
 *  • Add sort_order (for ordered display in UI)
 *  • Make type nullable (only root categories need a type; children inherit)
 *  • Change UNIQUE constraint from (name, type) → (name, parent_id)
 */
exports.up = async (knex) => {
  await knex.schema.alterTable('categories', (t) => {
    t.uuid('parent_id').nullable()
      .references('id').inTable('categories').onDelete('RESTRICT')
      .after('id');
    t.integer('sort_order').notNullable().defaultTo(0).after('description');
  });

  // Ensure `type` column exists (some v1 schemas used it; be tolerant)
  await knex.schema.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'type'
      ) THEN
        ALTER TABLE categories ADD COLUMN type TEXT;
      END IF;
    END$$;
  `);

  // Drop old unique constraint on (name, type) and add new one on (name, parent_id)
  await knex.schema.raw(`
    ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_type_unique;
    ALTER TABLE categories ADD CONSTRAINT categories_name_parent_unique
      UNIQUE (name, parent_id);

    -- Allow type to be null (children don't need it)
    ALTER TABLE categories ALTER COLUMN type DROP NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
  `);

  // Seed sub-categories
  const hw  = await knex('categories').where({ name: 'Hardware',    parent_id: null }).first();
  const sw  = await knex('categories').where({ name: 'Software',    parent_id: null }).first();
  const cs  = await knex('categories').where({ name: 'Consumables', parent_id: null }).first()
           || await knex('categories').where({ name: 'Other',        type: 'consumable' }).first();

  if (hw) {
    const hwSubs = [
      { name: 'Laptops',              sort_order: 1 },
      { name: 'Desktops',             sort_order: 2 },
      { name: 'Monitors & Displays',  sort_order: 3 },
      { name: 'Peripherals',          sort_order: 4 },
      { name: 'Networking Equipment', sort_order: 5 },
      { name: 'Servers',              sort_order: 6 },
      { name: 'Mobile Devices',       sort_order: 7 },
      { name: 'Other Hardware',       sort_order: 8 },
    ];
    for (const sub of hwSubs) {
      await knex('categories')
        .insert({ ...sub, parent_id: hw.id })
        .onConflict(['name', 'parent_id']).ignore();
    }

    // Laptops sub-sub-categories
    const laptops = await knex('categories').where({ name: 'Laptops', parent_id: hw.id }).first();
    if (laptops) {
      for (const sub of [
        { name: 'Windows Laptops', sort_order: 1 },
        { name: 'MacBooks',        sort_order: 2 },
        { name: 'Linux Laptops',   sort_order: 3 },
      ]) {
        await knex('categories')
          .insert({ ...sub, parent_id: laptops.id })
          .onConflict(['name', 'parent_id']).ignore();
      }
    }
  }

  if (sw) {
    const swSubs = [
      { name: 'Operating Systems',    sort_order: 1 },
      { name: 'Productivity Suite',   sort_order: 2 },
      { name: 'Security & Antivirus', sort_order: 3 },
      { name: 'Development Tools',    sort_order: 4 },
      { name: 'Design Tools',         sort_order: 5 },
    ];
    for (const sub of swSubs) {
      await knex('categories')
        .insert({ ...sub, parent_id: sw.id })
        .onConflict(['name', 'parent_id']).ignore();
    }
  }
};

exports.down = async (knex) => {
  // Remove seeded sub-categories (those with a parent_id)
  await knex('categories').whereNotNull('parent_id').delete();

  await knex.schema.raw(`
    DROP INDEX IF EXISTS idx_categories_parent;
    ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_parent_unique;
    ALTER TABLE categories ADD CONSTRAINT categories_name_type_unique UNIQUE (name, type);
    ALTER TABLE categories ALTER COLUMN type SET NOT NULL;
  `);

  await knex.schema.alterTable('categories', (t) => {
    t.dropColumn('sort_order');
    t.dropColumn('parent_id');
  });
};
