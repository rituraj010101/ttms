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

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', engine: 'mysql' }));

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
app.listen(PORT, () => {
  console.log(`TTMS API listening on port ${PORT} (MySQL Enterprise mode)`);
});
