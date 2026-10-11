const db = require('./db');

// MySQL only runs db/mysql_schema.sql on a brand-new volume. If an earlier
// seed stopped partway through, fill the missing demo rows without deleting
// or replacing anything the operator has already entered.
async function ensureDemoData() {
  const [{ count: incidentCount }] = (await db.query(
    'SELECT COUNT(*) AS count FROM incidents'
  )).rows;

  if (Number(incidentCount) === 0) {
    await db.query(`
      INSERT INTO incidents
        (segment_id, incident_type, severity, location, description, status, reported_at)
      SELECT rs.segment_id, seed.incident_type, seed.severity,
             ST_GeomFromText(seed.location_wkt, 4326, 'axis-order=long-lat'),
             seed.description, seed.status, DATE_SUB(NOW(), INTERVAL seed.hours_ago HOUR)
      FROM (
        SELECT 'Times Square Connector (demo)' AS segment_name, 'roadwork' AS incident_type, 2 AS severity,
               'POINT(-73.985343 40.762110)' AS location_wkt,
               'Demo lane closure near Times Square' AS description, 'responding' AS status, 3 AS hours_ago
        UNION ALL SELECT 'Midtown West Corridor (demo)', 'breakdown', 2,
               'POINT(-73.984183 40.759210)', 'Stranded commercial vehicle on left shoulder', 'verified', 1
        UNION ALL SELECT 'Hudson River Parkway Feeder (demo)', 'accident', 4,
               'POINT(-74.002151 40.765810)', 'Multi-vehicle collision near expressway ramp', 'reported', 0
        UNION ALL SELECT 'East Midtown Arterial (demo)', 'weather', 3,
               'POINT(-73.970853 40.745410)', 'Waterlogging on outer airport feeder lane', 'verified', 5
      ) AS seed
      JOIN road_segments rs ON rs.name = seed.segment_name
    `);
  }

  const [{ count: readingCount }] = (await db.query(
    'SELECT COUNT(*) AS count FROM traffic_readings'
  )).rows;

  if (Number(readingCount) === 0) {
    await db.query(`
      INSERT INTO traffic_readings
        (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
      SELECT s.sensor_id, seed.segment_id, NOW(), seed.vehicle_count,
             seed.avg_speed_kmh, seed.occupancy_pct, seed.congestion_lvl
      FROM (
        SELECT 1 AS segment_id, 210 AS vehicle_count, 42.5 AS avg_speed_kmh, 34.0 AS occupancy_pct, 1 AS congestion_lvl
        UNION ALL SELECT 2, 95, 26.0, 68.0, 3
        UNION ALL SELECT 3, 340, 48.0, 42.0, 1
        UNION ALL SELECT 4, 160, 33.5, 38.0, 1
        UNION ALL SELECT 5, 520, 64.0, 52.0, 2
        UNION ALL SELECT 6, 280, 38.0, 48.0, 2
        UNION ALL SELECT 7, 640, 74.5, 58.0, 2
        UNION ALL SELECT 8, 110, 29.0, 72.0, 4
      ) AS seed
      JOIN sensors s ON s.segment_id = seed.segment_id
      WHERE s.sensor_id = (
        SELECT MIN(s2.sensor_id) FROM sensors s2 WHERE s2.segment_id = seed.segment_id
      )
    `);
  }
}

module.exports = ensureDemoData;
