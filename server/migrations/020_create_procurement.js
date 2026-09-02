/**
 * MIGRATION 020 — approval_rules + procurement_requests + procurement_approvals
 *
 * New tables for the full procurement workflow:
 *  • approval_rules        — budget-tier configuration (who approves what amount)
 *  • procurement_requests  — full procurement lifecycle per request
 *  • procurement_approvals — multi-level approval chain per request
 */
exports.up = async (knex) => {

  // ── approval_rules ───────────────────────────────────────
  await knex.schema.createTable('approval_rules', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('name', 100).notNullable();
    t.decimal('min_amount', 12, 2).notNullable().defaultTo(0);
    t.decimal('max_amount', 12, 2).nullable();       // NULL = no upper limit
    t.string('approver_role', 30).notNullable();     // role that must approve at this tier
    t.smallint('approver_level').notNullable();       // 1 = first, 2 = second ...
    t.text('description').nullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // Seed default approval tiers
  await knex('approval_rules').insert([
    {
      name: 'Self Approve',
      min_amount: 0, max_amount: 5000,
      approver_role: 'engineer', approver_level: 1,
      description: 'Engineer can self-approve below ₹5,000'
    },
    {
      name: 'Manager Approval L1',
      min_amount: 5001, max_amount: 25000,
      approver_role: 'manager', approver_level: 1,
      description: 'Manager approves ₹5,001 – ₹25,000'
    },
    {
      name: 'Inventory Manager Approval',
      min_amount: 25001, max_amount: 100000,
      approver_role: 'inventory_manager', approver_level: 1,
      description: 'Inventory manager approves ₹25,001 – ₹1,00,000'
    },
    {
      name: 'Manager Co-Approval',
      min_amount: 25001, max_amount: 100000,
      approver_role: 'manager', approver_level: 2,
      description: 'Manager co-approves above ₹25,000'
    },
    {
      name: 'Admin Final Approval',
      min_amount: 100001, max_amount: null,
      approver_role: 'admin', approver_level: 1,
      description: 'Admin approves anything above ₹1,00,000'
    },
  ]);

  // ── procurement_requests ─────────────────────────────────
  await knex.schema.createTable('procurement_requests', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());

    // Requester context
    t.uuid('requested_by').notNullable()
      .references('id').inTable('users').onDelete('RESTRICT');
    t.string('department', 100).nullable();
    t.string('project', 150).nullable();
    t.uuid('location_id').nullable()
      .references('id').inTable('locations').onDelete('SET NULL');

    // What they need
    t.string('request_type', 20).notNullable()
      .checkIn(['existing_asset', 'new_purchase'], 'proc_req_type_check');
    t.string('item_name', 150).notNullable();
    t.uuid('category_id').nullable()
      .references('id').inTable('categories').onDelete('SET NULL');
    t.jsonb('specifications').nullable();    // { "ram":"16GB", "os":"Windows 11" }
    t.integer('quantity').notNullable().defaultTo(1);
    t.text('justification').notNullable();

    // Pricing
    t.decimal('estimated_cost', 12, 2).nullable();
    t.decimal('quoted_cost', 12, 2).nullable();
    t.string('currency', 5).notNullable().defaultTo('INR');

    // Inventory match result (filled by system / inventory manager)
    t.uuid('matched_asset_id').nullable()
      .references('id').inTable('assets').onDelete('SET NULL');
    t.text('matched_notes').nullable();

    // Workflow status
    t.string('status', 30).notNullable().defaultTo('draft')
      .checkIn([
        'draft', 'submitted', 'inventory_check',
        'pending_approval', 'self_approved', 'approved',
        'rejected', 'ordered', 'received', 'cancelled'
      ], 'proc_req_status_check');

    t.string('priority', 10).notNullable().defaultTo('normal')
      .checkIn(['low','normal','high','critical'], 'proc_req_priority_check');

    // Supplier & PO (for new_purchase)
    t.uuid('supplier_id').nullable()
      .references('id').inTable('suppliers').onDelete('SET NULL');
    t.string('supplier_quote_url', 500).nullable();
    t.string('po_number', 100).nullable();
    t.date('expected_delivery').nullable();
    t.date('actual_delivery').nullable();

    // Asset created on receipt
    t.uuid('asset_id_created').nullable()
      .references('id').inTable('assets').onDelete('SET NULL');

    t.text('notes').nullable();
    t.text('rejection_reason').nullable();

    // Lifecycle timestamps
    t.timestamp('submitted_at').nullable();
    t.timestamp('approved_at').nullable();
    t.timestamp('ordered_at').nullable();
    t.timestamp('received_at').nullable();

    t.timestamps(true, true);
  });

  await knex.schema.raw(`
    CREATE INDEX idx_proc_requested_by  ON procurement_requests(requested_by);
    CREATE INDEX idx_proc_status        ON procurement_requests(status);
    CREATE INDEX idx_proc_category      ON procurement_requests(category_id);
    CREATE INDEX idx_proc_matched_asset ON procurement_requests(matched_asset_id);
    CREATE INDEX idx_proc_created       ON procurement_requests(created_at DESC);
  `);

  // ── procurement_approvals ────────────────────────────────
  await knex.schema.createTable('procurement_approvals', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());

    t.uuid('procurement_id').notNullable()
      .references('id').inTable('procurement_requests').onDelete('CASCADE');
    t.uuid('approver_id').notNullable()
      .references('id').inTable('users').onDelete('RESTRICT');
    t.string('approver_role', 30).notNullable();   // snapshot at time of routing
    t.smallint('level').notNullable();              // 1 = first approver, 2 = second ...

    t.string('status', 20).notNullable().defaultTo('pending')
      .checkIn(['pending','approved','rejected','skipped'], 'proc_appr_status_check');

    t.text('comments').nullable();
    t.timestamp('actioned_at').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw(`
    CREATE INDEX idx_proc_appr_procurement ON procurement_approvals(procurement_id);
    CREATE INDEX idx_proc_appr_approver    ON procurement_approvals(approver_id);
    CREATE INDEX idx_proc_appr_status      ON procurement_approvals(status);
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw(`
    DROP INDEX IF EXISTS idx_proc_appr_procurement;
    DROP INDEX IF EXISTS idx_proc_appr_approver;
    DROP INDEX IF EXISTS idx_proc_appr_status;
  `);
  await knex.schema.dropTableIfExists('procurement_approvals');

  await knex.schema.raw(`
    DROP INDEX IF EXISTS idx_proc_requested_by;
    DROP INDEX IF EXISTS idx_proc_status;
    DROP INDEX IF EXISTS idx_proc_category;
    DROP INDEX IF EXISTS idx_proc_matched_asset;
    DROP INDEX IF EXISTS idx_proc_created;
  `);
  await knex.schema.dropTableIfExists('procurement_requests');
  await knex.schema.dropTableIfExists('approval_rules');
};
