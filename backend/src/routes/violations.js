const express = require('express');
const router = express.Router();
const db = require('../db');
const recordActivity = require('../activity');

// GET /api/violations - List all traffic violations joined with vehicle info
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        v.violation_id,
        v.violation_type,
        v.recorded_speed,
        v.fine_amount,
        v.status,
        v.occurred_at,
        vh.plate_number,
        vh.vehicle_type,
        vh.make,
        vh.model,
        vh.owner_name,
        s.sensor_type,
        rs.name AS segment_name
      FROM violations v
      JOIN vehicles vh ON v.vehicle_id = vh.vehicle_id
      LEFT JOIN sensors s ON v.sensor_id = s.sensor_id
      LEFT JOIN road_segments rs ON s.segment_id = rs.segment_id
      ORDER BY v.occurred_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
});

// PATCH /api/violations/:id - Update fine payment or dispute status
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const id = Number(req.params.id);
  const valid = ['pending', 'issued', 'paid', 'disputed', 'dismissed'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updateResult = await db.query(
      'UPDATE violations SET status = ? WHERE violation_id = ?',
      [status, id]
    );

    if (updateResult.rows.affectedRows === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }

    const fetchResult = await db.query(
      'SELECT * FROM violations WHERE violation_id = ?',
      [id]
    );

    await recordActivity(
      'violation',
      id,
      'status_changed',
      `Violation #${id} status changed to ${status}`
    );

    res.json(fetchResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update violation' });
  }
});

module.exports = router;
