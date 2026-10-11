const express = require('express');
const cors = require('cors');
require('dotenv').config();

const segmentsRouter = require('./routes/segments');
const sensorsRouter = require('./routes/sensors');
const incidentsRouter = require('./routes/incidents');
const signalsRouter = require('./routes/signals');
const activityRouter = require('./routes/activity');
const analyticsRouter = require('./routes/analytics');
const violationsRouter = require('./routes/violations');
const workordersRouter = require('./routes/workorders');
const vmsRouter = require('./routes/vms');
const db = require('./db');
const ensureDemoData = require('./demo-data');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1 AS ok');
    res.json({ status: 'ok', engine: 'mysql' });
  } catch (err) {
    console.error('Database health check failed:', err.message);
    res.status(503).json({ status: 'error', engine: 'mysql', error: 'Database unavailable' });
  }
});

app.use('/api/segments', segmentsRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/signals', signalsRouter);
app.use('/api/activity', activityRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/violations', violationsRouter);
app.use('/api/workorders', workordersRouter);
app.use('/api/vms', vmsRouter);

const PORT = process.env.PORT || 4000;
ensureDemoData()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TTMS API listening on port ${PORT} (MySQL Enterprise mode)`);
    });
  })
  .catch((err) => {
    console.error('Could not initialize the local MySQL demo data:', err);
    process.exit(1);
  });
