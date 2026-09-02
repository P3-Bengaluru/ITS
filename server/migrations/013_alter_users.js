/**
 * MIGRATION 013 — alter users
 *
 * Changes from v1 → v2:
 *  • Add employee_id (company HR ID, unique, NOT NULL with temp default)
 *  • Add manager_id  (self-referencing FK for approval hierarchy)
 *  • Add designation
 *  • Add self_approve_limit, budget_limit  (procurement authority)
 *  • Expand role ENUM to include engineer, inventory_manager, project_manager
 *
 * NOTE: employee_id is added as nullable first, then you populate it
 *       from your HR export, then we add the NOT NULL constraint in 013b.
 *       This avoids locking existing rows.
 */
exports.up = async (knex) => {

  await knex.schema.alterTable('users', (t) => {
    // Company HR employee ID — added nullable first (see note above)
    t.string('employee_id', 50).nullable().unique().after('id');

    // Reporting manager (self-referencing)
    t.uuid('manager_id').nullable()
      .references('id').inTable('users').onDelete('SET NULL')
      .after('employee_id');

    t.string('designation', 100).nullable().after('department');

    // Procurement authority thresholds
    t.decimal('self_approve_limit', 12, 2).notNullable().defaultTo(0).after('designation');
    t.decimal('budget_limit',       12, 2).notNullable().defaultTo(0).after('self_approve_limit');
  });

  // Expand role CHECK constraint to include new roles
  // Knex doesn't support altering CHECK directly — drop and recreate
  await knex.schema.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN (
        'admin',
        'inventory_manager',
        'project_manager',
        'manager',
        'engineer',
        'auditor',
        'inventory manager',
        'readonly'
      ));
  `);

  // Update existing rows: map old role 'staff' → 'engineer' (closest equivalent)
  await knex('users').where('role', 'staff').update({ role: 'engineer' });

  // Indexes
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
    CREATE INDEX IF NOT EXISTS idx_users_manager     ON users(manager_id);
    CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role);
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw(`
    DROP INDEX IF EXISTS idx_users_employee_id;
    DROP INDEX IF EXISTS idx_users_manager;
    DROP INDEX IF EXISTS idx_users_role;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin','staff','auditor','inventory manager','readonly'));
  `);

  await knex('users').where('role', 'engineer').update({ role: 'staff' });

  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('employee_id');
    t.dropColumn('manager_id');
    t.dropColumn('designation');
    t.dropColumn('self_approve_limit');
    t.dropColumn('budget_limit');
  });
};
