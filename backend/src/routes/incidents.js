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

// GET /api/incidents - optionally filter by status
router.get('/', async (req, res) => {
  const { status } = req.query;
  try {
    const result = status
      ? await db.query(
          `SELECT incident_id, segment_id, incident_type, severity, description, status,
                  ST_AsGeoJSON(location) AS location, reported_at, cleared_at
           FROM incidents WHERE status = ? ORDER BY reported_at DESC`,
          [status]
        )
      : await db.query(
          `SELECT incident_id, segment_id, incident_type, severity, description, status,
                  ST_AsGeoJSON(location) AS location, reported_at, cleared_at
           FROM incidents ORDER BY reported_at DESC`
        );
    const rows = result.rows.map((row) => ({
      ...row,
      location: parseGeoJSON(row.location),
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// POST /api/incidents - report a new incident
router.post('/', async (req, res) => {
  const { segment_id, incident_type, severity, description, lat, lng } = req.body;
  if (!incident_type || !severity) {
    return res.status(400).json({ error: 'incident_type and severity are required' });
  }

  const numLat = Number(lat);
  const numLng = Number(lng);
  const hasCoordinates = Number.isFinite(numLat) && Number.isFinite(numLng);

  try {
    let insertQuery;
    let params;

    if (hasCoordinates) {
      insertQuery = `
        INSERT INTO incidents (segment_id, incident_type, severity, location, description, status, reported_at)
        VALUES (?, ?, ?, ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')'), 4326, 'axis-order=long-lat'), ?, 'reported', NOW())
      `;
      params = [segment_id || null, incident_type, severity, numLng, numLat, description || null];
    } else {
      insertQuery = `
        INSERT INTO incidents (segment_id, incident_type, severity, location, description, status, reported_at)
        VALUES (?, ?, ?, NULL, ?, 'reported', NOW())
      `;
      params = [segment_id || null, incident_type, severity, description || null];
    }

    const insertResult = await db.query(insertQuery, params);
    const newId = insertResult.rows.insertId;

    const fetchResult = await db.query(
      `SELECT incident_id, segment_id, incident_type, severity, description, status,
              ST_AsGeoJSON(location) AS location, reported_at
       FROM incidents WHERE incident_id = ?`,
      [newId]
    );

    const incident = {
      ...fetchResult.rows[0],
      location: parseGeoJSON(fetchResult.rows[0].location),
    };

    await recordActivity(
      'incident',
      incident.incident_id,
      'created',
      `Reported ${incident.incident_type} incident on road segment ${incident.segment_id || 'unknown'}`
    );

    res.status(201).json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// PATCH /api/incidents/:id - update status (reported/verified/responding/cleared)
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid incident ID' });
  }
  const valid = ['reported', 'verified', 'responding', 'cleared'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const updateResult = await db.query(
      `UPDATE incidents
       SET status = ?,
           cleared_at = CASE WHEN ? = 'cleared' THEN NOW() ELSE NULL END
       WHERE incident_id = ?`,
      [status, status, id]
    );

    if (updateResult.rows.affectedRows === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const fetchResult = await db.query(
      `SELECT incident_id, segment_id, incident_type, severity, description, status,
              ST_AsGeoJSON(location) AS location, reported_at, cleared_at
       FROM incidents WHERE incident_id = ?`,
      [id]
    );

    const updated = {
      ...fetchResult.rows[0],
      location: parseGeoJSON(fetchResult.rows[0].location),
    };

    await recordActivity(
      'incident',
      updated.incident_id,
      'status_changed',
      `Incident status set to ${status}`
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

module.exports = router;
