/**
 * MIGRATION 013 — assets.project_name
 * Adds a column to record which project/engagement an asset is allocated
 * against. Used by the "Asset & Assignment Details" section of the
 * Add/Edit Item form, which now covers the full allocation workflow
 * (engineer, project, allocation date, expected return) in one place.
 */
exports.up = (knex) =>
  knex.schema.alterTable('assets', (t) => {
    t.string('project_name', 255).nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable('assets', (t) => {
    t.dropColumn('project_name');
  });
