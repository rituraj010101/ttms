const express = require('express');
const router = express.Router();
const db = require('../db');
const recordActivity = require('../activity');

function parseGeoJSON(val) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

// GET /api/signals - all traffic signals with their intersection location
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.signal_id, s.intersection_id, s.mode, s.status, s.controller_model,
             i.name AS intersection_name,
             ST_AsGeoJSON(i.location) AS location
      FROM traffic_signals s
      JOIN intersections i ON i.intersection_id = s.intersection_id
      ORDER BY s.signal_id
    `);
    const rows = result.rows.map((row) => ({
      ...row,
      location: parseGeoJSON(row.location),
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

// PATCH /api/signals/:id - change mode (fixed/adaptive/flash/manual/off)
router.patch('/:id', async (req, res) => {
  const { mode } = req.body;
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid signal ID' });
  }
  const valid = ['fixed', 'adaptive', 'flash', 'manual', 'off'];
  if (!valid.includes(mode)) return res.status(400).json({ error: 'Invalid mode' });

  try {
    const updateResult = await db.query(
      'UPDATE traffic_signals SET mode = ? WHERE signal_id = ?',
      [mode, id]
    );

    if (updateResult.rows.affectedRows === 0) {
      return res.status(404).json({ error: 'Signal not found' });
    }

    const fetchResult = await db.query(
      `SELECT s.signal_id, s.intersection_id, s.mode, s.status, s.controller_model,
              i.name AS intersection_name, ST_AsGeoJSON(i.location) AS location
       FROM traffic_signals s
       JOIN intersections i ON i.intersection_id = s.intersection_id
       WHERE s.signal_id = ?`,
      [id]
    );

    const updated = {
      ...fetchResult.rows[0],
      location: parseGeoJSON(fetchResult.rows[0].location),
    };

    await recordActivity(
      'signal',
      updated.signal_id,
      'mode_changed',
      `Signal mode set to ${mode} for signal ${updated.signal_id}`
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update signal' });
  }
});

module.exports = router;
