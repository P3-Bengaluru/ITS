/**
 * MIGRATION 013 — assets.expected_return
 * Adds a column to store the expected return date when an asset is
 * allocated to a user. Needed so the Allocate/Return workflow in the
 * client can be persisted server-side instead of only living in
 * browser state.
 */
exports.up = (knex) =>
  knex.schema.alterTable('assets', (t) => {
    t.date('expected_return').nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable('assets', (t) => {
    t.dropColumn('expected_return');
  });