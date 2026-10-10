const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/analytics/congestion - Corridors with current speed and congestion index
router.get('/congestion', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        rs.segment_id,
        rs.name AS segment_name,
        rs.road_class,
        rs.speed_limit_kmh,
        rs.status AS road_status,
        COALESCE(latest.avg_speed_kmh, rs.speed_limit_kmh) AS current_speed,
        COALESCE(latest.vehicle_count, 0) AS vehicle_count,
        COALESCE(latest.congestion_lvl, 1) AS congestion_lvl,
        COALESCE(latest.occupancy_pct, 20.0) AS occupancy_pct,
        ROUND(GREATEST(0, (rs.speed_limit_kmh - COALESCE(latest.avg_speed_kmh, rs.speed_limit_kmh)) / rs.speed_limit_kmh * 100), 1) AS speed_deficit_pct
      FROM road_segments rs
      LEFT JOIN (
        SELECT tr1.segment_id, tr1.avg_speed_kmh, tr1.vehicle_count, tr1.congestion_lvl, tr1.occupancy_pct
        FROM traffic_readings tr1
        INNER JOIN (
          SELECT segment_id, MAX(recorded_at) AS max_time
          FROM traffic_readings
          GROUP BY segment_id
        ) tr2 ON tr1.segment_id = tr2.segment_id AND tr1.recorded_at = tr2.max_time
      ) latest ON rs.segment_id = latest.segment_id
      ORDER BY congestion_lvl DESC, speed_deficit_pct DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch congestion metrics' });
  }
});

// GET /api/analytics/sensors-breakdown - Sensor distribution by type and status
router.get('/sensors-breakdown', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT sensor_type, status, COUNT(*) AS count
      FROM sensors
      GROUP BY sensor_type, status
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sensor breakdown' });
  }
});

// GET /api/analytics/incidents-summary - Incidents count by severity and type
router.get('/incidents-summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        incident_type,
        severity,
        COUNT(*) AS count,
        SUM(CASE WHEN status != 'cleared' THEN 1 ELSE 0 END) AS active_count
      FROM incidents
      GROUP BY incident_type, severity
      ORDER BY severity DESC, count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incident analytics' });
  }
});

// GET /api/analytics/violations-summary - Violation types, tickets, and revenue
router.get('/violations-summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        violation_type,
        COUNT(*) AS total_tickets,
        SUM(fine_amount) AS total_fines,
        SUM(CASE WHEN status = 'paid' THEN fine_amount ELSE 0 END) AS collected_revenue,
        SUM(CASE WHEN status = 'pending' THEN fine_amount ELSE 0 END) AS pending_revenue
      FROM violations
      GROUP BY violation_type
      ORDER BY total_fines DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch violations summary' });
  }
});

// GET /api/analytics/hourly-volume - 24-hour network aggregate volume
router.get('/hourly-volume', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        DATE_FORMAT(recorded_at, '%H:00') AS hour_label,
        ROUND(AVG(avg_speed_kmh), 1) AS avg_speed,
        SUM(vehicle_count) AS total_vehicles
      FROM traffic_readings
      WHERE recorded_at >= NOW() - INTERVAL 24 HOUR
      GROUP BY DATE_FORMAT(recorded_at, '%H:00')
      ORDER BY hour_label ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hourly volume' });
  }
});

module.exports = router;
