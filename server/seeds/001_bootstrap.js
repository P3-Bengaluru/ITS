/**
 * SEED 001 — Bootstrap data
 * Run once after migrations to get a working system on first deploy.
 * Safe to re-run (uses onConflict ignore).
 */
const bcrypt = require('bcryptjs');

exports.seed = async (knex) => {
  const upsertUser = async ({ name, email, password, role, department }) => {
    const password_hash = await bcrypt.hash(password, 12);

    await knex('users')
      .insert({
        id: knex.fn.uuid(),
        name,
        email,
        password_hash,
        role,
        department,
        is_active: true,
        failed_login_attempts: 0,
        locked_until: null,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })
      .onConflict('email')
      .merge({
        name,
        password_hash,
        role,
        department,
        is_active: true,
        failed_login_attempts: 0,
        locked_until: null,
        updated_at: knex.fn.now(),
      });
  };

  // ── 1. Default admin user ────────────────────────────────────
  await upsertUser({
    name: 'System Admin',
    email: 'admin@office.local',
    password: 'Admin@1234',
    role: 'admin',
    department: 'IT',
  });

  await upsertUser({
    name: 'Arjun Mehta',
    email: 'admin@p3acclivis.com',
    password: 'admin123',
    role: 'admin',
    department: 'IT',
  });

  await upsertUser({
    name: 'Priya Nair',
    email: 'manager@p3acclivis.com',
    password: 'manager123',
    role: 'inventory manager',
    department: 'IT',
  });

  await upsertUser({
    name: 'Roshan Desai',
    email: 'engineer@p3acclivis.com',
    password: 'eng123',
    role: 'engineer',
    department: 'IT',
  });

  await upsertUser({
    name: 'Sneha Pillai',
    email: 'readonly@p3acclivis.com',
    password: 'read123',
    role: 'readonly',
    department: 'IT',
  });

  // ── 1b. Bangalore team roster (imported from Team_Bengaluru-_2025_and_2026.xlsx) ──
  // Default password pattern: Welcome@<EmpID> — force a password reset on first login.
  await upsertUser({
    name: 'Nagappa Sunadholi',
    email: 'nagappa.sunadholi@p3acclivis.com',
    password: 'Welcome@250',
    role: 'inventory manager',
    department: 'Business Development',
  });

  await upsertUser({
    name: 'Shaik Imdad',
    email: 'shaik.imdad@p3acclivis.com',
    password: 'Welcome@267',
    role: 'engineer',
    department: 'Engineering',
  });

  await upsertUser({
    name: 'Karthik Rao',
    email: 'karthik.rao@p3acclivis.com',
    password: 'Welcome@274',
    role: 'readonly',
    department: 'Business Operations',
  });

  await upsertUser({
    name: 'Sushmita Koti',
    email: 'sushmita.koti@p3acclivis.com',
    password: 'Welcome@277',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'Sahana S',
    email: 'sahana.s@p3acclivis.com',
    password: 'Welcome@281',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'Harikrishna Sagarkar',
    email: 'harikrishna.sagarkar@p3acclivis.com',
    password: 'Welcome@284',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'Pavan Kumar Ghante',
    email: 'pavan.kumar.ghante@p3acclivis.com',
    password: 'Welcome@285',
    role: 'engineer',
    department: 'Engineering',
  });

  await upsertUser({
    name: 'Sumit Kumar Pujeri',
    email: 'sumit.kumar.pujeri@p3acclivis.com',
    password: 'Welcome@286',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'Cundaneswara Reddy',
    email: 'cundaneswara.reddy@p3acclivis.com',
    password: 'Welcome@287',
    role: 'engineer',
    department: 'Engineering',
  });

  await upsertUser({
    name: 'Hima Varshini Sundur',
    email: 'hima.varshini.sundur@p3acclivis.com',
    password: 'Welcome@289',
    role: 'engineer',
    department: 'DevOps',
  });

  await upsertUser({
    name: 'Mynashree B',
    email: 'mynashree.b@p3acclivis.com',
    password: 'Welcome@290',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'Ramaraddi G Maraddi',
    email: 'ramaraddi.g.maraddi@p3acclivis.com',
    password: 'Welcome@291',
    role: 'engineer',
    department: 'Engineering',
  });

  await upsertUser({
    name: 'Sanjana V U',
    email: 'sanjana.v.u@p3acclivis.com',
    password: 'Welcome@292',
    role: 'engineer',
    department: 'Engineering',
  });

  await upsertUser({
    name: 'Chethan T M',
    email: 'chethan.t.m@p3acclivis.com',
    password: 'Welcome@293',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'D Niranjanpal',
    email: 'd.niranjanpal@p3acclivis.com',
    password: 'Welcome@294',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'Pankaj Kumar Singh',
    email: 'pankaj.kumar.singh@p3acclivis.com',
    password: 'Welcome@295',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'Ajith T',
    email: 'ajith.t@p3acclivis.com',
    password: 'Welcome@297',
    role: 'engineer',
    department: 'QA',
  });

  await upsertUser({
    name: 'Rashmitha Fernandes',
    email: 'rashmitha.fernandes@p3acclivis.com',
    password: 'Welcome@299',
    role: 'readonly',
    department: 'HR',
  });

  await upsertUser({
    name: 'Raghvendra Myageri',
    email: 'raghvendra.myageri@p3acclivis.com',
    password: 'Welcome@305',
    role: 'engineer',
    department: 'Engineering',
  });

  await upsertUser({
    name: 'Arun Uppada',
    email: 'arun.uppada@p3acclivis.com',
    password: 'Welcome@244',
    role: 'engineer',
    department: 'QA',
  });

  // ── 2. Categories ────────────────────────────────────────────
  const assetCats = [
    'Computers & Laptops', 'Monitors & Displays', 'Peripherals',
    'Networking Equipment', 'Furniture', 'Office Equipment', 'Vehicles', 'Other'
  ];
  const consumableCats = [
    'Stationery', 'Printer Supplies', 'Pantry & Beverages',
    'Cleaning Supplies', 'Electrical & Batteries', 'Packaging', 'Other'
  ];

  for (const name of assetCats) {
    await knex('categories').insert({ id: knex.fn.uuid(), name })
      .onConflict(['name']).ignore();
  }
  for (const name of consumableCats) {
    await knex('categories').insert({ id: knex.fn.uuid(), name })
      .onConflict(['name']).ignore();
  }

  // ── 3. Locations ─────────────────────────────────────────────
  const locations = [
    { region: 'Bangalore' },
    { region: 'Pune' },
  ];
  for (const loc of locations) {
    await knex('locations').insert({ id: knex.fn.uuid(), ...loc })
      .onConflict(['region']).ignore();
  }

  // ── 4. System settings defaults ──────────────────────────────
  const settings = [
    { key: 'company_name',              value: 'My Office',          type: 'string' },
    { key: 'low_stock_email_enabled',   value: 'false',              type: 'boolean' },
    { key: 'warranty_alert_days',       value: '30',                 type: 'number' },
    { key: 'maintenance_alert_days',    value: '7',                  type: 'number' },
    { key: 'session_timeout_minutes',   value: '60',                 type: 'number' },
    { key: 'smtp_host',                 value: '',                   type: 'string', is_secret: true },
    { key: 'smtp_port',                 value: '587',                type: 'number', is_secret: true },
    { key: 'smtp_user',                 value: '',                   type: 'string', is_secret: true },
    { key: 'smtp_pass',                 value: '',                   type: 'string', is_secret: true },
    { key: 'smtp_from',                 value: 'inventory@office.local', type: 'string' },
    { key: 'notification_recipients',   value: 'admin@office.local', type: 'string' },
  ];
  for (const s of settings) {
    await knex('system_settings')
      .insert({ description: null, is_secret: false, ...s })
      .onConflict('key').ignore();
  }

  // ── 5. Lookup helpers ────────────────────────────────────────
  const categoryId = async (name) => {
    const row = await knex('categories').select('id').where({ name }).first();
    return row ? row.id : null;
  };
  const locationId = async (region) => {
    const row = await knex('locations').select('id').where({ region }).first();
    return row ? row.id : null;
  };
  const userId = async (email) => {
    const row = await knex('users').select('id').where({ email }).first();
    return row ? row.id : null;
  };

  // ── 6. Sample assets ─────────────────────────────────────────
  const upsertAsset = async ({
    name, asset_tag, serial_number, brand, model, category, region,
    purchase_date, purchase_price, invoice_number, warranty_expiry,
    status, assigned_to_email, assigned_since, next_maintenance_date,
    maintenance_interval_days, notes,
  }) => {
    await knex('assets')
      .insert({
        id: knex.fn.uuid(),
        name,
        asset_tag,
        serial_number,
        brand,
        model,
        category_id: await categoryId(category),
        location_id: await locationId(region),
        supplier_id: null,
        purchase_date,
        purchase_price,
        invoice_number,
        warranty_expiry,
        status,
        assigned_to: assigned_to_email ? await userId(assigned_to_email) : null,
        assigned_since: assigned_since || null,
        next_maintenance_date: next_maintenance_date || null,
        maintenance_interval_days: maintenance_interval_days || null,
        photo_url: null,
        notes: notes || null,
        is_active: true,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })
      .onConflict('asset_tag')
      .merge({
        name,
        serial_number,
        brand,
        model,
        category_id: await categoryId(category),
        location_id: await locationId(region),
        purchase_date,
        purchase_price,
        invoice_number,
        warranty_expiry,
        status,
        assigned_to: assigned_to_email ? await userId(assigned_to_email) : null,
        assigned_since: assigned_since || null,
        next_maintenance_date: next_maintenance_date || null,
        maintenance_interval_days: maintenance_interval_days || null,
        notes: notes || null,
        is_active: true,
        updated_at: knex.fn.now(),
      });
  };

  await upsertAsset({
    name: 'Dell Latitude 5440',
    asset_tag: 'AST-0001',
    serial_number: 'DL5440-SN-0001',
    brand: 'Dell',
    model: 'Latitude 5440',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2024-06-01',
    purchase_price: 78000.0,
    invoice_number: 'INV-2024-0601',
    warranty_expiry: '2027-06-01',
    status: 'assigned',
    assigned_to_email: 'engineer@p3acclivis.com',
    assigned_since: '2024-06-05',
    next_maintenance_date: '2026-12-01',
    maintenance_interval_days: 180,
    notes: 'Primary engineering laptop.',
  });

  await upsertAsset({
    name: 'Dell UltraSharp U2422H',
    asset_tag: 'AST-0002',
    serial_number: 'DU2422H-SN-0002',
    brand: 'Dell',
    model: 'UltraSharp U2422H',
    category: 'Monitors & Displays',
    region: 'Bangalore',
    purchase_date: '2024-06-01',
    purchase_price: 15500.0,
    invoice_number: 'INV-2024-0601',
    warranty_expiry: '2027-06-01',
    status: 'assigned',
    assigned_to_email: 'engineer@p3acclivis.com',
    assigned_since: '2024-06-05',
    notes: null,
  });

  await upsertAsset({
    name: 'HP LaserJet Pro M404dn',
    asset_tag: 'AST-0003',
    serial_number: 'HPLJ-SN-0003',
    brand: 'HP',
    model: 'LaserJet Pro M404dn',
    category: 'Office Equipment',
    region: 'Bangalore',
    purchase_date: '2023-11-15',
    purchase_price: 32000.0,
    invoice_number: 'INV-2023-1115',
    warranty_expiry: '2025-11-15',
    status: 'available',
    maintenance_interval_days: 90,
    next_maintenance_date: '2026-09-15',
    notes: 'Shared printer, 2nd floor.',
  });

  await upsertAsset({
    name: 'Lenovo ThinkPad T14',
    asset_tag: 'AST-0004',
    serial_number: 'LNVT14-SN-0004',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Computers & Laptops',
    region: 'Pune',
    purchase_date: '2025-01-10',
    purchase_price: 82000.0,
    invoice_number: 'INV-2025-0110',
    warranty_expiry: '2028-01-10',
    status: 'available',
  });

  await upsertAsset({
    name: 'Office Desk 4ft',
    asset_tag: 'AST-0005',
    serial_number: null,
    brand: 'Featherlite',
    model: 'Classic 4ft',
    category: 'Furniture',
    region: 'Pune',
    purchase_date: '2023-03-20',
    purchase_price: 9500.0,
    invoice_number: 'INV-2023-0320',
    warranty_expiry: null,
    status: 'available',
  });

  await upsertAsset({
    name: 'Cisco Catalyst 2960 Switch',
    asset_tag: 'AST-0006',
    serial_number: 'CSCO2960-SN-0006',
    brand: 'Cisco',
    model: 'Catalyst 2960',
    category: 'Networking Equipment',
    region: 'Bangalore',
    purchase_date: '2022-09-01',
    purchase_price: 45000.0,
    invoice_number: 'INV-2022-0901',
    warranty_expiry: '2025-09-01',
    status: 'in_repair',
    notes: 'Port 12 flapping, sent for RMA check.',
  });

  // ── 6b. Onboarding laptops for Bangalore team roster ─────────
  await upsertAsset({
    name: 'Dell Latitude 5440',
    asset_tag: 'AST-0007',
    serial_number: 'DE5440-SN-0007',
    brand: 'Dell',
    model: 'Latitude 5440',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2025-09-08',
    purchase_price: 78000.0,
    invoice_number: 'INV-20250908-0007',
    warranty_expiry: '2028-09-15',
    status: 'assigned',
    assigned_to_email: 'nagappa.sunadholi@p3acclivis.com',
    assigned_since: '2025-09-15',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Nagappa Sunadholi (Program Manager & Director Business Development ( Automotive)).',
  });

  await upsertAsset({
    name: 'Lenovo ThinkPad T14',
    asset_tag: 'AST-0008',
    serial_number: 'LET14-SN-0008',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-02-02',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260202-0008',
    warranty_expiry: '2029-02-09',
    status: 'assigned',
    assigned_to_email: 'shaik.imdad@p3acclivis.com',
    assigned_since: '2026-02-09',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Shaik Imdad (Software Developer).',
  });

  await upsertAsset({
    name: 'HP ProBook 450 G10',
    asset_tag: 'AST-0009',
    serial_number: 'HPG10-SN-0009',
    brand: 'HP',
    model: 'ProBook 450 G10',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-03-02',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260302-0009',
    warranty_expiry: '2029-03-09',
    status: 'assigned',
    assigned_to_email: 'karthik.rao@p3acclivis.com',
    assigned_since: '2026-03-09',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Karthik Rao (Business Operations & Account Support Executive).',
  });

  await upsertAsset({
    name: 'Dell Latitude 5440',
    asset_tag: 'AST-0010',
    serial_number: 'DE5440-SN-0010',
    brand: 'Dell',
    model: 'Latitude 5440',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-03-25',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260325-0010',
    warranty_expiry: '2029-04-01',
    status: 'assigned',
    assigned_to_email: 'sushmita.koti@p3acclivis.com',
    assigned_since: '2026-04-01',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Sushmita Koti (Sr. Android Auto 3PL Testing Engg).',
  });

  await upsertAsset({
    name: 'Lenovo ThinkPad T14',
    asset_tag: 'AST-0011',
    serial_number: 'LET14-SN-0011',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-05-04',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260504-0011',
    warranty_expiry: '2029-05-11',
    status: 'assigned',
    assigned_to_email: 'sahana.s@p3acclivis.com',
    assigned_since: '2026-05-11',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Sahana S (Tech Lead- Android Auto 3PL Testing Engg).',
  });

  await upsertAsset({
    name: 'HP ProBook 450 G10',
    asset_tag: 'AST-0012',
    serial_number: 'HPG10-SN-0012',
    brand: 'HP',
    model: 'ProBook 450 G10',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-05-27',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260527-0012',
    warranty_expiry: '2029-06-03',
    status: 'assigned',
    assigned_to_email: 'harikrishna.sagarkar@p3acclivis.com',
    assigned_since: '2026-06-03',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Harikrishna Sagarkar (Tech Lead- Test Engineer).',
  });

  await upsertAsset({
    name: 'Dell Latitude 5440',
    asset_tag: 'AST-0013',
    serial_number: 'DE5440-SN-0013',
    brand: 'Dell',
    model: 'Latitude 5440',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-05-28',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260528-0013',
    warranty_expiry: '2029-06-04',
    status: 'assigned',
    assigned_to_email: 'pavan.kumar.ghante@p3acclivis.com',
    assigned_since: '2026-06-04',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Pavan Kumar Ghante (Tech Lead - Android Automotive Developer).',
  });

  await upsertAsset({
    name: 'Lenovo ThinkPad T14',
    asset_tag: 'AST-0014',
    serial_number: 'LET14-SN-0014',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-01',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260601-0014',
    warranty_expiry: '2029-06-08',
    status: 'assigned',
    assigned_to_email: 'sumit.kumar.pujeri@p3acclivis.com',
    assigned_since: '2026-06-08',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Sumit Kumar Pujeri (Sr. Android Auto 3PL Testing Engg).',
  });

  await upsertAsset({
    name: 'HP ProBook 450 G10',
    asset_tag: 'AST-0015',
    serial_number: 'HPG10-SN-0015',
    brand: 'HP',
    model: 'ProBook 450 G10',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-01',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260601-0015',
    warranty_expiry: '2029-06-08',
    status: 'assigned',
    assigned_to_email: 'cundaneswara.reddy@p3acclivis.com',
    assigned_since: '2026-06-08',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Cundaneswara Reddy (Software Developer).',
  });

  await upsertAsset({
    name: 'Dell Latitude 5440',
    asset_tag: 'AST-0016',
    serial_number: 'DE5440-SN-0016',
    brand: 'Dell',
    model: 'Latitude 5440',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-01',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260601-0016',
    warranty_expiry: '2029-06-08',
    status: 'assigned',
    assigned_to_email: 'hima.varshini.sundur@p3acclivis.com',
    assigned_since: '2026-06-08',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Hima Varshini Sundur (Trainee- CI/CD , DevOps).',
  });

  await upsertAsset({
    name: 'Lenovo ThinkPad T14',
    asset_tag: 'AST-0017',
    serial_number: 'LET14-SN-0017',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-01',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260601-0017',
    warranty_expiry: '2029-06-08',
    status: 'assigned',
    assigned_to_email: 'mynashree.b@p3acclivis.com',
    assigned_since: '2026-06-08',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Mynashree B (Trainne- 3PL Testing).',
  });

  await upsertAsset({
    name: 'HP ProBook 450 G10',
    asset_tag: 'AST-0018',
    serial_number: 'HPG10-SN-0018',
    brand: 'HP',
    model: 'ProBook 450 G10',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-01',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260601-0018',
    warranty_expiry: '2029-06-08',
    status: 'assigned',
    assigned_to_email: 'ramaraddi.g.maraddi@p3acclivis.com',
    assigned_since: '2026-06-08',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Ramaraddi G Maraddi (Trainee- AAOS Developer).',
  });

  await upsertAsset({
    name: 'Dell Latitude 5440',
    asset_tag: 'AST-0019',
    serial_number: 'DE5440-SN-0019',
    brand: 'Dell',
    model: 'Latitude 5440',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-01',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260601-0019',
    warranty_expiry: '2029-06-08',
    status: 'assigned',
    assigned_to_email: 'sanjana.v.u@p3acclivis.com',
    assigned_since: '2026-06-08',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Sanjana V U (Trainee- AAOS Developer).',
  });

  await upsertAsset({
    name: 'Lenovo ThinkPad T14',
    asset_tag: 'AST-0020',
    serial_number: 'LET14-SN-0020',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-01',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260601-0020',
    warranty_expiry: '2029-06-08',
    status: 'assigned',
    assigned_to_email: 'chethan.t.m@p3acclivis.com',
    assigned_since: '2026-06-08',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Chethan T M (Trainee-3PL Testing).',
  });

  await upsertAsset({
    name: 'HP ProBook 450 G10',
    asset_tag: 'AST-0021',
    serial_number: 'HPG10-SN-0021',
    brand: 'HP',
    model: 'ProBook 450 G10',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-03',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260603-0021',
    warranty_expiry: '2029-06-10',
    status: 'assigned',
    assigned_to_email: 'd.niranjanpal@p3acclivis.com',
    assigned_since: '2026-06-10',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for D Niranjanpal (Sr. Android Auto 3PL Testing Engg).',
  });

  await upsertAsset({
    name: 'Dell Latitude 5440',
    asset_tag: 'AST-0022',
    serial_number: 'DE5440-SN-0022',
    brand: 'Dell',
    model: 'Latitude 5440',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-04',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260604-0022',
    warranty_expiry: '2029-06-11',
    status: 'assigned',
    assigned_to_email: 'pankaj.kumar.singh@p3acclivis.com',
    assigned_since: '2026-06-11',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Pankaj Kumar Singh (Sr. Android Auto 3PL Testing Engg).',
  });

  await upsertAsset({
    name: 'Lenovo ThinkPad T14',
    asset_tag: 'AST-0023',
    serial_number: 'LET14-SN-0023',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-08',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260608-0023',
    warranty_expiry: '2029-06-15',
    status: 'assigned',
    assigned_to_email: 'ajith.t@p3acclivis.com',
    assigned_since: '2026-06-15',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Ajith T (Sr. Android Auto 3PL Testing Engg).',
  });

  await upsertAsset({
    name: 'HP ProBook 450 G10',
    asset_tag: 'AST-0024',
    serial_number: 'HPG10-SN-0024',
    brand: 'HP',
    model: 'ProBook 450 G10',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-06-11',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260611-0024',
    warranty_expiry: '2029-06-18',
    status: 'assigned',
    assigned_to_email: 'rashmitha.fernandes@p3acclivis.com',
    assigned_since: '2026-06-18',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Rashmitha Fernandes (HR Generalist).',
  });

  await upsertAsset({
    name: 'Dell Latitude 5440',
    asset_tag: 'AST-0025',
    serial_number: 'DE5440-SN-0025',
    brand: 'Dell',
    model: 'Latitude 5440',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2026-05-25',
    purchase_price: 78000.0,
    invoice_number: 'INV-20260525-0025',
    warranty_expiry: '2029-06-01',
    status: 'assigned',
    assigned_to_email: 'raghvendra.myageri@p3acclivis.com',
    assigned_since: '2026-06-01',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Raghvendra Myageri (Trainee Engg- AAOS Developer).',
  });

  await upsertAsset({
    name: 'Lenovo ThinkPad T14',
    asset_tag: 'AST-0026',
    serial_number: 'LET14-SN-0026',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Computers & Laptops',
    region: 'Bangalore',
    purchase_date: '2025-08-06',
    purchase_price: 78000.0,
    invoice_number: 'INV-20250806-0026',
    warranty_expiry: '2028-08-13',
    status: 'assigned',
    assigned_to_email: 'arun.uppada@p3acclivis.com',
    assigned_since: '2025-08-13',
    maintenance_interval_days: 180,
    notes: 'Onboarding issue for Arun Uppada (QA Test Engineer).',
  });

  // ── 7. Sample assignments ────────────────────────────────────
  const upsertAssignment = async ({
    asset_tag, user_email, status, requested_at, approved_at, rejected_at,
    checked_out_at, expected_return, returned_at, approved_by_email,
    request_reason, rejection_reason, return_notes, return_condition,
  }) => {
    const asset = await knex('assets').select('id').where({ asset_tag }).first();
    if (!asset) return;
    const user_id = await userId(user_email);

    const existing = await knex('assignments')
      .select('id')
      .where({ asset_id: asset.id, user_id, status })
      .first();
    if (existing) return; // idempotent: skip if this exact assignment record already exists

    await knex('assignments').insert({
      id: knex.fn.uuid(),
      asset_id: asset.id,
      user_id,
      status,
      requested_at: requested_at || null,
      approved_at: approved_at || null,
      rejected_at: rejected_at || null,
      checked_out_at: checked_out_at || null,
      expected_return: expected_return || null,
      returned_at: returned_at || null,
      approved_by: approved_by_email ? await userId(approved_by_email) : null,
      request_reason: request_reason || null,
      rejection_reason: rejection_reason || null,
      return_notes: return_notes || null,
      return_condition: return_condition || null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  };

  await upsertAssignment({
    asset_tag: 'AST-0001',
    user_email: 'engineer@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2024-06-03T09:00:00Z',
    approved_at: '2024-06-04T10:00:00Z',
    checked_out_at: '2024-06-05T09:30:00Z',
    expected_return: '2026-12-31',
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'New hire laptop for engineering role.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0002',
    user_email: 'engineer@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2024-06-03T09:00:00Z',
    approved_at: '2024-06-04T10:00:00Z',
    checked_out_at: '2024-06-05T09:30:00Z',
    expected_return: '2026-12-31',
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Second monitor for engineering workstation.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0004',
    user_email: 'readonly@p3acclivis.com',
    status: 'pending',
    requested_at: '2026-08-10T14:00:00Z',
    request_reason: 'Requesting a backup laptop for travel.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0005',
    user_email: 'readonly@p3acclivis.com',
    status: 'returned',
    requested_at: '2023-04-01T09:00:00Z',
    approved_at: '2023-04-02T09:00:00Z',
    checked_out_at: '2023-04-03T09:00:00Z',
    expected_return: '2024-04-03',
    returned_at: '2024-03-20T11:00:00Z',
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Temporary desk for onboarding.',
    return_notes: 'Returned in good condition, no damage.',
    return_condition: 'good',
  });

  // ── 7b. Onboarding assignment records for Bangalore team roster ──
  await upsertAssignment({
    asset_tag: 'AST-0007',
    user_email: 'nagappa.sunadholi@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2025-09-13T09:00:00Z',
    approved_at: '2025-09-14T10:00:00Z',
    checked_out_at: '2025-09-15T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0008',
    user_email: 'shaik.imdad@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-02-07T09:00:00Z',
    approved_at: '2026-02-08T10:00:00Z',
    checked_out_at: '2026-02-09T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0009',
    user_email: 'karthik.rao@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-03-07T09:00:00Z',
    approved_at: '2026-03-08T10:00:00Z',
    checked_out_at: '2026-03-09T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0010',
    user_email: 'sushmita.koti@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-03-30T09:00:00Z',
    approved_at: '2026-03-31T10:00:00Z',
    checked_out_at: '2026-04-01T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0011',
    user_email: 'sahana.s@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-05-09T09:00:00Z',
    approved_at: '2026-05-10T10:00:00Z',
    checked_out_at: '2026-05-11T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0012',
    user_email: 'harikrishna.sagarkar@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-01T09:00:00Z',
    approved_at: '2026-06-02T10:00:00Z',
    checked_out_at: '2026-06-03T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0013',
    user_email: 'pavan.kumar.ghante@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-02T09:00:00Z',
    approved_at: '2026-06-03T10:00:00Z',
    checked_out_at: '2026-06-04T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0014',
    user_email: 'sumit.kumar.pujeri@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-06T09:00:00Z',
    approved_at: '2026-06-07T10:00:00Z',
    checked_out_at: '2026-06-08T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0015',
    user_email: 'cundaneswara.reddy@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-06T09:00:00Z',
    approved_at: '2026-06-07T10:00:00Z',
    checked_out_at: '2026-06-08T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0016',
    user_email: 'hima.varshini.sundur@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-06T09:00:00Z',
    approved_at: '2026-06-07T10:00:00Z',
    checked_out_at: '2026-06-08T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0017',
    user_email: 'mynashree.b@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-06T09:00:00Z',
    approved_at: '2026-06-07T10:00:00Z',
    checked_out_at: '2026-06-08T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0018',
    user_email: 'ramaraddi.g.maraddi@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-06T09:00:00Z',
    approved_at: '2026-06-07T10:00:00Z',
    checked_out_at: '2026-06-08T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0019',
    user_email: 'sanjana.v.u@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-06T09:00:00Z',
    approved_at: '2026-06-07T10:00:00Z',
    checked_out_at: '2026-06-08T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0020',
    user_email: 'chethan.t.m@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-06T09:00:00Z',
    approved_at: '2026-06-07T10:00:00Z',
    checked_out_at: '2026-06-08T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0021',
    user_email: 'd.niranjanpal@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-08T09:00:00Z',
    approved_at: '2026-06-09T10:00:00Z',
    checked_out_at: '2026-06-10T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0022',
    user_email: 'pankaj.kumar.singh@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-09T09:00:00Z',
    approved_at: '2026-06-10T10:00:00Z',
    checked_out_at: '2026-06-11T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0023',
    user_email: 'ajith.t@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-13T09:00:00Z',
    approved_at: '2026-06-14T10:00:00Z',
    checked_out_at: '2026-06-15T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0024',
    user_email: 'rashmitha.fernandes@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-06-16T09:00:00Z',
    approved_at: '2026-06-17T10:00:00Z',
    checked_out_at: '2026-06-18T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0025',
    user_email: 'raghvendra.myageri@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2026-05-30T09:00:00Z',
    approved_at: '2026-05-31T10:00:00Z',
    checked_out_at: '2026-06-01T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  await upsertAssignment({
    asset_tag: 'AST-0026',
    user_email: 'arun.uppada@p3acclivis.com',
    status: 'checked_out',
    requested_at: '2025-08-11T09:00:00Z',
    approved_at: '2025-08-12T10:00:00Z',
    checked_out_at: '2025-08-13T09:30:00Z',
    expected_return: null,
    approved_by_email: 'manager@p3acclivis.com',
    request_reason: 'Onboarding equipment issuance.',
  });

  console.log('✅ Seed complete. Login: admin@office.local / Admin@1234');
};