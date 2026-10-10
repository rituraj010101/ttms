const express = require('express');
const router = express.Router();
const db = require('../db');
const recordActivity = require('../activity');

// GET /api/vms - List Variable Message Signs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        v.vms_id,
        v.segment_id,
        v.current_text,
        v.updated_at,
        rs.name AS segment_name,
        ST_AsGeoJSON(v.location) AS location
      FROM variable_message_signs v
      LEFT JOIN road_segments rs ON v.segment_id = rs.segment_id
      ORDER BY v.vms_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch VMS boards' });
  }
});

// PATCH /api/vms/:id - Update sign text
router.patch('/:id', async (req, res) => {
  const { current_text } = req.body;
  const id = Number(req.params.id);
  if (!current_text || typeof current_text !== 'string') {
    return res.status(400).json({ error: 'Text message is required' });
  }

  try {
    const updateResult = await db.query(
      'UPDATE variable_message_signs SET current_text = ?, updated_at = NOW() WHERE vms_id = ?',
      [current_text.trim(), id]
    );

    if (updateResult.rows.affectedRows === 0) {
      return res.status(404).json({ error: 'VMS board not found' });
    }

    const fetchResult = await db.query(
      'SELECT * FROM variable_message_signs WHERE vms_id = ?',
      [id]
    );

    await recordActivity(
      'vms',
      id,
      'text_updated',
      `VMS Sign #${id} message set to: "${current_text.trim()}"`
    );

    res.json(fetchResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update VMS message' });
  }
});

module.exports = router;
