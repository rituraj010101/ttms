const db = require('./db');

async function recordActivity(resourceType, resourceId, action, details) {
  try {
    await db.query(
      `INSERT INTO activity_log (resource_type, resource_id, action, details, occurred_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [resourceType, resourceId, action, details]
    );
  } catch (err) {
    // Keep the primary operation successful if activity logging is unavailable.
    console.error('Failed to record activity:', err.message);
  }
}

module.exports = recordActivity;
