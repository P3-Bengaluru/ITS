/**
 * MIGRATION 018 — create activity_logs (merged maintenance + audit)
 *
 * Creates the unified activity_logs table and migrates data from
 * both maintenance_logs and audit_logs into it.
 * Creates convenience views that recreate the original tables.
 * Does NOT drop the old tables (kept for safety; drop in 019 after verification).
 */
exports.up = async (knex) => {

  // Create unified table
  await knex.schema.createTable('activity_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());

    t.string('log_type', 20).notNullable()
      .checkIn(['audit','maintenance','system','data'], 'activity_logs_log_type_check');

    t.string('audit_type', 30).nullable();
    t.string('maintenance_type', 30).nullable();
    t.string('maintenance_status', 20).nullable();
    t.string('action', 40).nullable();

    // Who
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.string('user_email', 150).nullable();
    t.string('user_role', 20).nullable();

    // What
    t.string('entity_type', 50).nullable();
    t.uuid('entity_id').nullable();

    // Maintenance-specific
    t.date('scheduled_date').nullable();
    t.date('completed_date').nullable();
    t.string('performed_by', 150).nullable();
    t.uuid('vendor_id').nullable().references('id').inTable('suppliers').onDelete('SET NULL');

    // Change diff
    t.jsonb('before_value').nullable();
    t.jsonb('after_value').nullable();

    // Cost & scheduling
    t.decimal('cost', 10, 2).nullable();
    t.string('invoice_number', 100).nullable();
    t.date('next_maintenance_date').nullable();

    // Description
    t.string('title', 255).nullable();
    t.text('description').nullable();
    t.text('findings').nullable();

    // Context
    t.string('ip_address', 45).nullable();
    t.text('user_agent').nullable();
    t.text('notes').nullable();

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    // No updated_at — append only
  });

  // Indexes
  await knex.schema.raw(`
    CREATE INDEX idx_actlog_log_type    ON activity_logs(log_type);
    CREATE INDEX idx_actlog_audit_type  ON activity_logs(audit_type);
    CREATE INDEX idx_actlog_action      ON activity_logs(action);
    CREATE INDEX idx_actlog_entity      ON activity_logs(entity_type, entity_id);
    CREATE INDEX idx_actlog_user        ON activity_logs(user_id);
    CREATE INDEX idx_actlog_created     ON activity_logs(created_at DESC);
    CREATE INDEX idx_actlog_maint_sched ON activity_logs(scheduled_date)
      WHERE log_type = 'maintenance';
  `);

  // Migrate existing maintenance_logs rows
  const maintTableExists = await knex.schema.hasTable('maintenance_logs');
  if (maintTableExists) {
    const rows = await knex('maintenance_logs').select('*');
    for (const r of rows) {
      await knex('activity_logs').insert({
        id:                   r.id,
        log_type:             'maintenance',
        maintenance_type:     r.type,
        maintenance_status:   r.status,
        action:               null,
        user_id:              r.logged_by,
        entity_type:          'asset',
        entity_id:            r.asset_id,
        scheduled_date:       r.scheduled_date,
        completed_date:       r.completed_date,
        performed_by:         r.performed_by,
        vendor_id:            r.vendor_id,
        cost:                 r.cost,
        invoice_number:       r.invoice_number,
        next_maintenance_date:r.next_maintenance_date,
        description:          r.description,
        findings:             r.findings,
        notes:                r.notes,
        created_at:           r.created_at,
      });
    }
    console.log(`[018] Migrated ${rows.length} maintenance_logs rows`);
  }

  // Migrate existing audit_logs rows
  const auditTableExists = await knex.schema.hasTable('audit_logs');
  if (auditTableExists) {
    const rows = await knex('audit_logs').select('*');
    for (const r of rows) {
      await knex('activity_logs').insert({
        id:           r.id,
        log_type:     'data',
        action:       r.action,
        user_id:      r.user_id,
        user_email:   r.user_email,
        user_role:    r.user_role,
        entity_type:  r.entity_type,
        entity_id:    r.entity_id,
        before_value: r.before_value,
        after_value:  r.after_value,
        ip_address:   r.ip_address,
        user_agent:   r.user_agent,
        notes:        r.notes,
        created_at:   r.created_at,
      });
    }
    console.log(`[018] Migrated ${rows.length} audit_logs rows`);
  }

  // Create convenience views
  await knex.schema.raw(`
    CREATE OR REPLACE VIEW maintenance_log AS
      SELECT * FROM activity_logs WHERE log_type = 'maintenance';

    CREATE OR REPLACE VIEW audit_log AS
      SELECT * FROM activity_logs WHERE log_type IN ('audit','data','system');
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw(`
    DROP VIEW IF EXISTS maintenance_log;
    DROP VIEW IF EXISTS audit_log;
    DROP INDEX IF EXISTS idx_actlog_log_type;
    DROP INDEX IF EXISTS idx_actlog_audit_type;
    DROP INDEX IF EXISTS idx_actlog_action;
    DROP INDEX IF EXISTS idx_actlog_entity;
    DROP INDEX IF EXISTS idx_actlog_user;
    DROP INDEX IF EXISTS idx_actlog_created;
    DROP INDEX IF EXISTS idx_actlog_maint_sched;
  `);
  await knex.schema.dropTableIfExists('activity_logs');
};
