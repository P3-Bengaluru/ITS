/**
 * MIGRATION 016 — alter assets
 *
 * Changes from v1 → v2:
 *  • Add asset_number  (sequential: ITS-000001)
 *  • Add specifications JSONB  (flexible hardware specs)
 *  • Add qr_token  (public read-only link token)
 *  • Add return_required (default FALSE — return is optional)
 *  • Add warranty_terms TEXT
 *  • Status: rename 'approved' value not needed; add 'in_transit'
 *  • Update FTS index to include asset_number
 */
exports.up = async (knex) => {

  // Create the sequence first
  await knex.schema.raw(`
    CREATE SEQUENCE IF NOT EXISTS asset_number_seq START 1 INCREMENT 1 NO CYCLE;
  `);

  await knex.schema.alterTable('assets', (t) => {
    // Sequential human-readable number
    t.string('asset_number', 20).nullable().unique().after('id');  // nullable until we backfill

    // Flexible specs storage
    t.jsonb('specifications').nullable().after('model');

    // Public QR token
    t.string('qr_token', 64).nullable().unique().after('notes');

    // Return behaviour
    t.boolean('return_required').notNullable().defaultTo(false).after('assigned_since');

    // Extended warranty info
    t.text('warranty_terms').nullable().after('warranty_expiry');
  });

  // Backfill asset_number for existing rows
  await knex.schema.raw(`
    UPDATE assets
    SET asset_number = 'ITS-' || LPAD(nextval('asset_number_seq')::TEXT, 6, '0')
    WHERE asset_number IS NULL;

    -- Now make it NOT NULL + set as default for future inserts
    ALTER TABLE assets ALTER COLUMN asset_number SET NOT NULL;
    ALTER TABLE assets ALTER COLUMN asset_number
      SET DEFAULT ('ITS-' || LPAD(nextval('asset_number_seq')::TEXT, 6, '0'));
  `);

  // Backfill qr_token for existing rows
  // Ensure pgcrypto extension is available for gen_random_bytes
  await knex.schema.raw(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `);

  await knex.schema.raw(`
    UPDATE assets
    SET qr_token = encode(gen_random_bytes(32), 'hex')
    WHERE qr_token IS NULL;

    ALTER TABLE assets ALTER COLUMN qr_token SET NOT NULL;
    ALTER TABLE assets ALTER COLUMN qr_token
      SET DEFAULT encode(gen_random_bytes(32), 'hex');
  `);

  // Expand status CHECK to include 'in_transit'
  await knex.schema.raw(`
    ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;
    ALTER TABLE assets ADD CONSTRAINT assets_status_check
      CHECK (status IN ('available','assigned','maintenance','retired','lost','disposed','in_transit'));
  `);

  // Drop old FTS index and recreate with asset_number
  await knex.schema.raw(`
    DROP INDEX IF EXISTS idx_assets_fts;
    CREATE INDEX idx_assets_fts ON assets
      USING GIN (to_tsvector('english',
        name || ' ' ||
        COALESCE(serial_number,'') || ' ' ||
        COALESCE(asset_tag,'') || ' ' ||
        asset_number));

    CREATE INDEX IF NOT EXISTS idx_assets_qr_token ON assets(qr_token);
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw(`
    DROP INDEX IF EXISTS idx_assets_qr_token;
    DROP INDEX IF EXISTS idx_assets_fts;
    CREATE INDEX idx_assets_fts ON assets
      USING GIN (to_tsvector('english',
        name || ' ' || COALESCE(serial_number,'') || ' ' || COALESCE(asset_tag,'')));

    ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;
    ALTER TABLE assets ADD CONSTRAINT assets_status_check
      CHECK (status IN ('available','assigned','maintenance','retired','lost','disposed'));

    DROP SEQUENCE IF EXISTS asset_number_seq;
  `);

  await knex.schema.alterTable('assets', (t) => {
    t.dropColumn('asset_number');
    t.dropColumn('specifications');
    t.dropColumn('qr_token');
    t.dropColumn('return_required');
    t.dropColumn('warranty_terms');
  });
};
