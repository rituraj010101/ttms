const express = require('express');
const router = express.Router();
const db = require('../db');
const recordActivity = require('../activity');

// GET /api/workorders - List maintenance work orders
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        wo.work_order_id,
        wo.asset_type,
        wo.asset_id,
        wo.priority,
        wo.description,
        wo.status,
        wo.created_at,
        wo.completed_at,
        u.full_name AS assigned_to_name
      FROM work_orders wo
      LEFT JOIN users u ON wo.assigned_to = u.user_id
      ORDER BY wo.priority ASC, wo.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// PATCH /api/workorders/:id - Update status
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const id = Number(req.params.id);
  const valid = ['open', 'in_progress', 'done', 'cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updateResult = await db.query(
      `UPDATE work_orders 
       SET status = ?, 
           completed_at = CASE WHEN ? = 'done' THEN NOW() ELSE NULL END
       WHERE work_order_id = ?`,
      [status, status, id]
    );

    if (updateResult.rows.affectedRows === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    const fetchResult = await db.query(
      'SELECT * FROM work_orders WHERE work_order_id = ?',
      [id]
    );

    await recordActivity(
      'work_order',
      id,
      'status_changed',
      `Work order #${id} set to ${status}`
    );

    res.json(fetchResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

module.exports = router;
