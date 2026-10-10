const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT activity_id, resource_type, resource_id, action, details, occurred_at
      FROM activity_log
      ORDER BY occurred_at DESC, activity_id DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

module.exports = router;
