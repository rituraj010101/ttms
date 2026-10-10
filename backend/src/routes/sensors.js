const express = require('express');
const router = express.Router();
const db = require('../db');

function parseGeoJSON(val) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

// GET /api/sensors - all sensors
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT sensor_id, segment_id, sensor_type, status,
             ST_AsGeoJSON(location) AS location
      FROM sensors
      ORDER BY sensor_id
    `);
    const rows = result.rows.map((row) => ({
      ...row,
      location: parseGeoJSON(row.location),
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// GET /api/sensors/readings/latest - most recent reading per segment
router.get('/readings/latest', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT tr.segment_id, tr.sensor_id, tr.recorded_at,
             tr.vehicle_count, tr.avg_speed_kmh, tr.occupancy_pct, tr.congestion_lvl
      FROM traffic_readings tr
      INNER JOIN (
        SELECT segment_id, MAX(recorded_at) AS max_recorded_at
        FROM traffic_readings
        GROUP BY segment_id
      ) latest ON tr.segment_id = latest.segment_id AND tr.recorded_at = latest.max_recorded_at
      ORDER BY tr.segment_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// GET /api/sensors/readings/history?hours=12|24 - hourly traffic history
router.get('/readings/history', async (req, res) => {
  const hours = Number(req.query.hours || 12);
  if (![12, 24].includes(hours)) {
    return res.status(400).json({ error: 'hours must be 12 or 24' });
  }
  try {
    const result = await db.query(`
      SELECT segment_id,
             DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00') AS hour,
             ROUND(AVG(avg_speed_kmh), 1) AS avg_speed_kmh,
             ROUND(AVG(vehicle_count)) AS vehicle_count
      FROM traffic_readings
      WHERE recorded_at >= NOW() - INTERVAL ? HOUR
        AND avg_speed_kmh IS NOT NULL
      GROUP BY segment_id, DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00')
      ORDER BY hour, segment_id
    `, [hours]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch traffic history' });
  }
});

// POST /api/sensors/readings - ingest a new reading (called by sensor feeds)
router.post('/readings', async (req, res) => {
  const { sensor_id, segment_id, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl } = req.body;
  if (!sensor_id || !segment_id) {
    return res.status(400).json({ error: 'sensor_id and segment_id are required' });
  }
  try {
    const insertResult = await db.query(
      `INSERT INTO traffic_readings
         (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
       VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
      [sensor_id, segment_id, vehicle_count ?? null, avg_speed_kmh ?? null, occupancy_pct ?? null, congestion_lvl ?? null]
    );
    const readingId = insertResult.rows.insertId;
    const fetchResult = await db.query(
      'SELECT * FROM traffic_readings WHERE reading_id = ?',
      [readingId]
    );
    res.status(201).json(fetchResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record reading' });
  }
});

module.exports = router;
