/**
 * MIGRATION 015 — rebuild locations as 3-level hierarchy
 *
 * v1: locations(building, room)  — 2 columns, flat
 * v2: locations(name, parent_id, level, code) — self-referencing tree
 *     Level 1 = City, Level 2 = Department, Level 3 = Project
 *
 * Strategy:
 *  1. Add new columns (parent_id, level, code, address)
 *  2. Migrate existing rows: treat building as City (L1), room as Project (L3)
 *     Create intermediate Department rows as needed
 *  3. Drop old unique(building,room) constraint; add new unique(name, parent_id)
 */
exports.up = async (knex) => {
  // Ensure `name` column exists (some legacy schemas use `region`)
  await knex.schema.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'name'
      ) THEN
        ALTER TABLE locations ADD COLUMN name TEXT;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'region'
        ) THEN
          UPDATE locations SET name = region;
        END IF;
      END IF;
    END$$;
  `);

  // Step 1: Add new columns
  await knex.schema.alterTable('locations', (t) => {
    t.uuid('parent_id').nullable()
      .references('id').inTable('locations').onDelete('RESTRICT')
      .after('id');
    t.smallint('level').nullable().after('parent_id'); // we'll set NOT NULL after migration
    t.string('code', 30).nullable().after('level');
    t.text('address').nullable().after('notes');
  });

  // Step 2: Migrate existing rows
  const existing = await knex('locations').select('*');

  if (existing.length > 0) {
    const hasBuilding = Object.prototype.hasOwnProperty.call(existing[0], 'building');

    if (hasBuilding) {
      // Make legacy `region` nullable so we can insert new rows without providing it
      await knex.schema.raw(`ALTER TABLE locations ALTER COLUMN region DROP NOT NULL;`);
      // Collect unique buildings → become City (Level 1)
      const buildings = [...new Set(existing.map(r => r.building).filter(b => b != null))];
      const cityMap   = {};

      for (const building of buildings) {
        // Check if a city row already exists (idempotent)
        let city = await knex('locations').where({ name: building, level: 1 }).first();
        if (!city) {
          [city] = await knex('locations').insert({
            name:  building,
            level: 1,
            code:  building.slice(0, 3).toUpperCase(),
          }).returning('*');
        }
        cityMap[building] = city.id;
      }

      // Each original row: building=City, room=Project (skip intermediate dept for existing data)
      // We'll put them directly under city at level 3 with a synthetic level-2 "General" dept
      const deptMap = {};

      for (const row of existing) {
        if (!row.building) continue; // skip malformed rows
        const cityId  = cityMap[row.building];
        const deptKey = `${row.building}_General`;

        if (!deptMap[deptKey]) {
          let dept = await knex('locations').where({ name: 'General', parent_id: cityId }).first();
          if (!dept) {
            [dept] = await knex('locations').insert({
              name:      'General',
              parent_id: cityId,
              level:     2,
              code:      `GEN-${row.building.slice(0, 3).toUpperCase()}`,
            }).returning('*');
          }
          deptMap[deptKey] = dept.id;
        }

        // Update the original row to be a Level 3 project under the dept
        await knex('locations').where({ id: row.id }).update({
          name:      row.room,
          parent_id: deptMap[deptKey],
          level:     3,
        });
      }
    } else {
      // Make legacy `region` nullable so we can insert new rows without providing it
      await knex.schema.raw(`ALTER TABLE locations ALTER COLUMN region DROP NOT NULL;`);
      // Legacy schema uses `region` — treat each region as a City (level 1)
      const regions = [...new Set(existing.map(r => r.region).filter(b => b != null))];
      for (const region of regions) {
        let city = await knex('locations').where({ name: region, level: 1 }).first();
        if (!city) {
          [city] = await knex('locations').insert({ name: region, level: 1, code: region.slice(0,3).toUpperCase() }).returning('*');
        }
      }

      // Ensure rows have level set
      await knex('locations').whereNull('level').whereNotNull('name').update({ level: 1, parent_id: null });
    }
  }

  // Step 3: Set level NOT NULL, fix constraints
  // Ensure any NULL levels are filled (treat as level 3) before making NOT NULL
  await knex.schema.raw(`
    UPDATE locations SET level = 3 WHERE level IS NULL;
  `);

  await knex.schema.raw(`
    ALTER TABLE locations ALTER COLUMN level SET NOT NULL;
    ALTER TABLE locations ALTER COLUMN level SET DEFAULT 3;

    ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_building_room_unique;
    ALTER TABLE locations ADD CONSTRAINT locations_name_parent_unique
      UNIQUE (name, parent_id);

    -- Drop old columns
    ALTER TABLE locations DROP COLUMN IF EXISTS building;
    ALTER TABLE locations DROP COLUMN IF EXISTS room;

    CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);
    CREATE INDEX IF NOT EXISTS idx_locations_level  ON locations(level);

    -- Recursive view for full path (City › Dept › Project)
    CREATE OR REPLACE VIEW location_full_path AS
    WITH RECURSIVE loc_tree AS (
        SELECT id, name, parent_id, level, code,
               name::TEXT AS full_path
        FROM   locations WHERE parent_id IS NULL
        UNION ALL
        SELECT l.id, l.name, l.parent_id, l.level, l.code,
               lt.full_path || ' › ' || l.name
        FROM   locations l
        JOIN   loc_tree lt ON l.parent_id = lt.id
    )
    SELECT id, name, level, code, full_path FROM loc_tree;
  `);

  // Seed Bangalore and Pune if not already present
  const blrExists = await knex('locations').where({ name: 'Bangalore', level: 1 }).first();
  if (!blrExists) {
    const [blr] = await knex('locations').insert({ name: 'Bangalore', level: 1, code: 'BLR' }).returning('*');
    const depts = ['Engineering','Finance','HR','Operations','Administration'];
    for (const d of depts) {
      await knex('locations').insert({ name: d, parent_id: blr.id, level: 2 });
    }
    const eng = await knex('locations').where({ name: 'Engineering', parent_id: blr.id }).first();
    if (eng) {
      for (const p of ['Project Alpha','Project Beta','Common Area']) {
        await knex('locations').insert({ name: p, parent_id: eng.id, level: 3 });
      }
    }
  }

  const pneExists = await knex('locations').where({ name: 'Pune', level: 1 }).first();
  if (!pneExists) {
    const [pne] = await knex('locations').insert({ name: 'Pune', level: 1, code: 'PNE' }).returning('*');
    const depts = ['Engineering','Finance','HR'];
    for (const d of depts) {
      await knex('locations').insert({ name: d, parent_id: pne.id, level: 2 });
    }
  }
};

exports.down = async (knex) => {
  await knex.schema.raw(`
    DROP VIEW IF EXISTS location_full_path;
    DROP INDEX IF EXISTS idx_locations_parent;
    DROP INDEX IF EXISTS idx_locations_level;
    ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_name_parent_unique;
  `);

  // Restore flat structure (best-effort — data shape changed)
  await knex.schema.alterTable('locations', (t) => {
    t.string('building', 100).nullable();
    t.string('room', 100).nullable();
  });

  // Copy level-3 rows back to building/room
  const leaves = await knex('locations').where({ level: 3 }).select('*');
  for (const leaf of leaves) {
    const parent = await knex('locations').where({ id: leaf.parent_id }).first();
    const city   = parent
      ? await knex('locations').where({ id: parent.parent_id }).first()
      : null;
    await knex('locations').where({ id: leaf.id }).update({
      building: city?.name || 'Unknown',
      room:     leaf.name,
    });
  }

  // Remove non-leaf rows
  await knex('locations').whereIn('level', [1, 2]).delete();

  await knex.schema.raw(`
    ALTER TABLE locations DROP COLUMN IF EXISTS parent_id;
    ALTER TABLE locations DROP COLUMN IF EXISTS level;
    ALTER TABLE locations DROP COLUMN IF EXISTS code;
    ALTER TABLE locations DROP COLUMN IF EXISTS address;
    ALTER TABLE locations ADD CONSTRAINT locations_building_room_unique UNIQUE (building, room);
    ALTER TABLE locations ALTER COLUMN building SET NOT NULL;
    ALTER TABLE locations ALTER COLUMN room SET NOT NULL;
  `);
};
