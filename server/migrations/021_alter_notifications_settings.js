/**
 * MIGRATION 021 — alter notifications + update system_settings
 *
 * Changes from v1 → v2:
 *  • notifications: expand type ENUM to include procurement,
 *    reallocation, and audit notification types
 *  • system_settings: add new keys for QR base URL, asset prefix,
 *    and self-approve default limit
 */
exports.up = async (knex) => {

  // ── notifications: expand type CHECK ────────────────────
  await knex.schema.raw(`
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
      CHECK (type IN (
        'low_stock',
        'warranty_expiry',
        'maintenance_due',
        'overdue_return',
        'assignment_request',
        'assignment_approved',
        'assignment_rejected',
        'reallocation_request',
        'reallocation_approved',
        'reallocation_rejected',
        'procurement_submitted',
        'procurement_approved',
        'procurement_rejected',
        'procurement_ordered',
        'procurement_received',
        'audit_scheduled',
        'system'
      ));
  `);

  // ── system_settings: insert new keys ────────────────────
  const newSettings = [
    {
      key:         'public_qr_base_url',
      value:       'https://inventory.company.local/public/asset',
      type:        'string',
      description: 'Base URL for QR code public asset links',
      is_secret:   false,
    },
    {
      key:         'asset_number_prefix',
      value:       'ITS',
      type:        'string',
      description: 'Prefix for sequential asset numbers (e.g. ITS-000001)',
      is_secret:   false,
    },
    {
      key:         'self_approve_default_limit',
      value:       '5000',
      type:        'number',
      description: 'Default self-approval threshold in INR for new engineers',
      is_secret:   false,
    },
    {
      key:         'procurement_currency',
      value:       'INR',
      type:        'string',
      description: 'Default currency for procurement requests',
      is_secret:   false,
    },
    {
      key:         'reallocation_requires_pm_approval',
      value:       'true',
      type:        'boolean',
      description: 'Whether reallocation always requires project manager approval',
      is_secret:   false,
    },
  ];

  for (const s of newSettings) {
    await knex('system_settings')
      .insert(s)
      .onConflict('key').ignore();
  }
};

exports.down = async (knex) => {
  // Revert notifications type to v1 values
  await knex.schema.raw(`
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
      CHECK (type IN (
        'low_stock', 'warranty_expiry', 'maintenance_due', 'overdue_return',
        'checkout_request', 'checkout_approved', 'checkout_rejected', 'system'
      ));
  `);

  // Remove new settings keys
  await knex('system_settings').whereIn('key', [
    'public_qr_base_url',
    'asset_number_prefix',
    'self_approve_default_limit',
    'procurement_currency',
    'reallocation_requires_pm_approval',
  ]).delete();
};
