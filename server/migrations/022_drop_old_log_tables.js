/**
 * MIGRATION 022 — drop maintenance_logs and audit_logs
 *
 * Run ONLY after verifying that migration 018 successfully migrated
 * all rows into activity_logs. This is intentionally a separate
 * migration so you can run 013-021 and verify data before committing
 * to dropping the old tables.
 *
 * VERIFY BEFORE RUNNING:
 *   SELECT COUNT(*) FROM maintenance_logs;
 *   SELECT COUNT(*) FROM activity_logs WHERE log_type = 'maintenance';
 *   -- Both counts should match.
 *
 *   SELECT COUNT(*) FROM audit_logs;
 *   SELECT COUNT(*) FROM activity_logs WHERE log_type = 'data';
 *   -- Both counts should match.
 */
exports.up = async (knex) => {
  // Safety check: ensure activity_logs exists and has data before dropping source tables
  const hasActivityTable = await knex.schema.hasTable('activity_logs');
  if (!hasActivityTable) {
    console.log('[022] Skipping drop: activity_logs table does not exist. Run migration 018 first.');
    return;
  }

  const [{ count: actCount }] = await knex('activity_logs').count('* as count');
  if (parseInt(actCount, 10) === 0) {
    console.log('[022] Skipping drop: activity_logs is empty. Run migration 018 first and verify data before dropping source tables.');
    return;
  }

  // Drop old tables (views were already renamed in 018, so no conflict)
  await knex.schema.dropTableIfExists('maintenance_logs');
  await knex.schema.dropTableIfExists('audit_logs');

  console.log('[022] Dropped maintenance_logs and audit_logs. activity_logs is now the single source of truth.');
};

exports.down = async (knex) => {
  // Recreate maintenance_logs
  await knex.schema.createTable('maintenance_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('asset_id').notNullable().references('id').inTable('assets').onDelete('RESTRICT');
    t.string('type', 20).notNullable().defaultTo('repair');
    t.string('status', 20).notNullable().defaultTo('scheduled');
    t.date('scheduled_date').nullable();
    t.date('completed_date').nullable();
    t.string('performed_by', 150).nullable();
    t.uuid('vendor_id').nullable().references('id').inTable('suppliers').onDelete('SET NULL');
    t.text('description').nullable();
    t.text('findings').nullable();
    t.decimal('cost', 10, 2).nullable();
    t.string('invoice_number', 100).nullable();
    t.date('next_maintenance_date').nullable();
    t.uuid('logged_by').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.timestamps(true, true);
  });

  // Recreate audit_logs
  await knex.schema.createTable('audit_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.string('user_email', 150).nullable();
    t.string('user_role', 50).nullable();
    t.string('action', 40).notNullable();
    t.string('entity_type', 50).notNullable();
    t.uuid('entity_id').nullable();
    t.jsonb('before_value').nullable();
    t.jsonb('after_value').nullable();
    t.string('ip_address', 45).nullable();
    t.text('user_agent').nullable();
    t.text('notes').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // Restore data from activity_logs
  const maintRows = await knex('activity_logs').where({ log_type: 'maintenance' }).select('*');
  for (const r of maintRows) {
    await knex('maintenance_logs').insert({
      id:                   r.id,
      asset_id:             r.entity_id,
      type:                 r.maintenance_type || 'repair',
      status:               r.maintenance_status || 'completed',
      scheduled_date:       r.scheduled_date,
      completed_date:       r.completed_date,
      performed_by:         r.performed_by,
      vendor_id:            r.vendor_id,
      description:          r.description,
      findings:             r.findings,
      cost:                 r.cost,
      invoice_number:       r.invoice_number,
      next_maintenance_date:r.next_maintenance_date,
      logged_by:            r.user_id,
      notes:                r.notes,
      created_at:           r.created_at,
      updated_at:           r.created_at,
    }).onConflict('id').ignore();
  }

  const auditRows = await knex('activity_logs').whereIn('log_type', ['data','system','audit']).select('*');
  for (const r of auditRows) {
    await knex('audit_logs').insert({
      id:           r.id,
      user_id:      r.user_id,
      user_email:   r.user_email,
      user_role:    r.user_role,
      action:       r.action || 'UPDATE',
      entity_type:  r.entity_type || 'unknown',
      entity_id:    r.entity_id,
      before_value: r.before_value,
      after_value:  r.after_value,
      ip_address:   r.ip_address,
      user_agent:   r.user_agent,
      notes:        r.notes,
      created_at:   r.created_at,
    }).onConflict('id').ignore();
  }
};
