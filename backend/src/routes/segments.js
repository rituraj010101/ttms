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

// GET /api/segments - all road segments with geometry as GeoJSON
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT segment_id, name, road_class, length_m, lanes,
             speed_limit_kmh, status,
             ST_AsGeoJSON(geometry) AS geometry
      FROM road_segments
      ORDER BY segment_id
    `);
    const rows = result.rows.map((row) => ({
      ...row,
      geometry: parseGeoJSON(row.geometry),
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch segments' });
  }
});

// PATCH /api/segments/:id - update status (open/restricted/closed)
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid segment ID' });
  }
  if (!['open', 'restricted', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const updateResult = await db.query(
      'UPDATE road_segments SET status = ? WHERE segment_id = ?',
      [status, id]
    );
    if (updateResult.rows.affectedRows === 0) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    const fetchResult = await db.query(
      'SELECT segment_id, name, road_class, length_m, lanes, speed_limit_kmh, status, ST_AsGeoJSON(geometry) AS geometry FROM road_segments WHERE segment_id = ?',
      [id]
    );
    if (!fetchResult.rows || fetchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    const updated = {
      ...fetchResult.rows[0],
      geometry: parseGeoJSON(fetchResult.rows[0].geometry),
    };
    await recordActivity(
      'road_segment',
      updated.segment_id,
      'status_changed',
      `Road status set to ${status} for ${updated.name}`
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update segment' });
  }
});

module.exports = router;
