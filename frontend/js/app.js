const API_BASE = window.TTMS_API_BASE || 'http://localhost:4000/api';

const STATUS_COLOR = { open: '#3fa796', restricted: '#f2a33c', closed: '#d1495b' };

// Fixed base timestamp for consistent hourly buckets
const FIXED_NOW = Date.now();
const FIXED_BASE_TIME = Math.floor(FIXED_NOW / 3600000) * 3600000;

// Extensive sample dataset used if the backend isn't reachable
const SAMPLE = {
  segments: [
    { segment_id: 1, name: 'Midtown West Corridor (demo)', status: 'open', speed_limit_kmh: 40, lanes: 3, road_class: 'arterial',
      geometry: { type: 'LineString', coordinates: [[-73.986270, 40.757910], [-73.984531, 40.759010], [-73.982792, 40.760410]] } },
    { segment_id: 2, name: 'Times Square Connector (demo)', status: 'restricted', speed_limit_kmh: 30, lanes: 2, road_class: 'collector',
      geometry: { type: 'LineString', coordinates: [[-73.982792, 40.760410], [-73.985343, 40.762110], [-73.989400, 40.760810]] } },
    { segment_id: 3, name: 'Broadway Midtown Arterial (demo)', status: 'open', speed_limit_kmh: 50, lanes: 4, road_class: 'arterial',
      geometry: { type: 'LineString', coordinates: [[-73.978388, 40.754110], [-73.981865, 40.755810], [-73.986270, 40.757910]] } },
    { segment_id: 4, name: 'Bryant Park Connector (demo)', status: 'open', speed_limit_kmh: 35, lanes: 2, road_class: 'collector',
      geometry: { type: 'LineString', coordinates: [[-73.989400, 40.760810], [-73.992877, 40.762110], [-73.996355, 40.763610]] } },
    { segment_id: 5, name: 'Hudson River Parkway Feeder (demo)', status: 'open', speed_limit_kmh: 70, lanes: 6, road_class: 'highway',
      geometry: { type: 'LineString', coordinates: [[-73.996355, 40.763610], [-74.000412, 40.765110], [-74.004469, 40.766610]] } },
    { segment_id: 6, name: 'Fifth Avenue Central Corridor (demo)', status: 'open', speed_limit_kmh: 45, lanes: 3, road_class: 'arterial',
      geometry: { type: 'LineString', coordinates: [[-73.978388, 40.754110], [-73.976649, 40.751110], [-73.974330, 40.747610]] } },
    { segment_id: 7, name: 'East Midtown Arterial (demo)', status: 'open', speed_limit_kmh: 80, lanes: 6, road_class: 'highway',
      geometry: { type: 'LineString', coordinates: [[-73.974330, 40.747610], [-73.970273, 40.745110], [-73.966216, 40.742610]] } },
    { segment_id: 8, name: 'West Side Bypass (demo)', status: 'restricted', speed_limit_kmh: 40, lanes: 2, road_class: 'collector',
      geometry: { type: 'LineString', coordinates: [[-74.004469, 40.766610], [-73.996934, 40.764110], [-73.989400, 40.760810]] } },
  ],
  incidents: [
    { incident_id: 1, segment_id: 2, incident_type: 'roadwork', severity: 2, description: 'Demo lane closure near Times Square', status: 'responding',
      location: { type: 'Point', coordinates: [-73.985343, 40.762110] }, reported_at: new Date(Date.now() - 3600000 * 3).toISOString() },
    { incident_id: 2, segment_id: 1, incident_type: 'breakdown', severity: 2, description: 'Stranded commercial vehicle on left shoulder', status: 'verified',
      location: { type: 'Point', coordinates: [-73.984183, 40.759210] }, reported_at: new Date(Date.now() - 3600000 * 1).toISOString() },
    { incident_id: 3, segment_id: 5, incident_type: 'accident', severity: 4, description: 'Multi-vehicle collision near expressway ramp', status: 'reported',
      location: { type: 'Point', coordinates: [-74.002151, 40.765810] }, reported_at: new Date(Date.now() - 1800000).toISOString() },
    { incident_id: 4, segment_id: 7, incident_type: 'weather', severity: 3, description: 'Waterlogging on outer airport feeder lane', status: 'verified',
      location: { type: 'Point', coordinates: [-73.970853, 40.745410] }, reported_at: new Date(Date.now() - 3600000 * 5).toISOString() },
    { incident_id: 5, segment_id: 8, incident_type: 'obstruction', severity: 1, description: 'Fallen tree branch cleared from sidewalk', status: 'cleared',
      location: { type: 'Point', coordinates: [-73.995196, 40.763110] }, reported_at: new Date(Date.now() - 3600000 * 12).toISOString(), cleared_at: new Date(Date.now() - 3600000 * 11).toISOString() },
  ],
  signals: [
    { signal_id: 1, intersection_name: 'Times Square Junction (demo)', mode: 'adaptive', status: 'online' },
    { signal_id: 2, intersection_name: 'Bryant Park Junction (demo)', mode: 'fixed', status: 'online' },
    { signal_id: 3, intersection_name: 'Herald Square Crossing (demo)', mode: 'adaptive', status: 'online' },
    { signal_id: 4, intersection_name: 'Rockefeller Center Circle (demo)', mode: 'adaptive', status: 'online' },
    { signal_id: 5, intersection_name: 'West Side Connector (demo)', mode: 'fixed', status: 'online' },
    { signal_id: 6, intersection_name: 'Grand Central Market Square (demo)', mode: 'flash', status: 'fault' },
    { signal_id: 7, intersection_name: 'East Midtown Link Junction (demo)', mode: 'adaptive', status: 'online' },
  ],
  sensors: [
    { sensor_id: 1, status: 'active', sensor_type: 'radar' },
    { sensor_id: 2, status: 'active', sensor_type: 'camera' },
    { sensor_id: 3, status: 'active', sensor_type: 'loop' },
    { sensor_id: 4, status: 'active', sensor_type: 'radar' },
    { sensor_id: 5, status: 'active', sensor_type: 'camera' },
    { sensor_id: 6, status: 'active', sensor_type: 'anpr' },
    { sensor_id: 7, status: 'active', sensor_type: 'loop' },
    { sensor_id: 8, status: 'active', sensor_type: 'radar' },
    { sensor_id: 9, status: 'active', sensor_type: 'anpr' },
    { sensor_id: 10, status: 'faulty', sensor_type: 'camera' },
    { sensor_id: 11, status: 'active', sensor_type: 'anpr' },
    { sensor_id: 12, status: 'inactive', sensor_type: 'radar' },
  ],
  readings: [
    { segment_id: 1, avg_speed_kmh: 42.5, vehicle_count: 210, congestion_lvl: 1 },
    { segment_id: 2, avg_speed_kmh: 26.0, vehicle_count: 95, congestion_lvl: 3 },
    { segment_id: 3, avg_speed_kmh: 48.0, vehicle_count: 340, congestion_lvl: 1 },
    { segment_id: 4, avg_speed_kmh: 33.5, vehicle_count: 160, congestion_lvl: 1 },
    { segment_id: 5, avg_speed_kmh: 64.0, vehicle_count: 520, congestion_lvl: 2 },
    { segment_id: 6, avg_speed_kmh: 38.0, vehicle_count: 280, congestion_lvl: 2 },
    { segment_id: 7, avg_speed_kmh: 74.5, vehicle_count: 640, congestion_lvl: 2 },
    { segment_id: 8, avg_speed_kmh: 29.0, vehicle_count: 110, congestion_lvl: 4 },
  ],
  violations: [
    { violation_id: 1, plate_number: 'DL-01-AB-1234', vehicle_type: 'car', make: 'Maruti Suzuki', model: 'Swift', violation_type: 'speeding', recorded_speed: 58.5, fine_amount: 1000.00, status: 'issued', occurred_at: new Date(Date.now() - 3600000 * 24).toISOString() },
    { violation_id: 2, plate_number: 'HR-26-EF-9012', vehicle_type: 'truck', make: 'Ashok Leyland', model: 'Ecomet', violation_type: 'red_light', recorded_speed: 0.0, fine_amount: 1500.00, status: 'pending', occurred_at: new Date(Date.now() - 3600000 * 3).toISOString() },
    { violation_id: 3, plate_number: 'DL-03-GH-3456', vehicle_type: 'car', make: 'Hyundai', model: 'Creta', violation_type: 'speeding', recorded_speed: 92.0, fine_amount: 2000.00, status: 'paid', occurred_at: new Date(Date.now() - 3600000 * 48).toISOString() },
    { violation_id: 4, plate_number: 'DL-04-IJ-7890', vehicle_type: 'motorcycle', make: 'Hero', model: 'Splendor', violation_type: 'red_light', recorded_speed: 0.0, fine_amount: 1000.00, status: 'pending', occurred_at: new Date(Date.now() - 3600000 * 8).toISOString() },
    { violation_id: 5, plate_number: 'UP-16-KL-2345', vehicle_type: 'truck', make: 'BharatBenz', model: '2823R', violation_type: 'speeding', recorded_speed: 84.0, fine_amount: 2000.00, status: 'disputed', occurred_at: new Date(Date.now() - 3600000 * 18).toISOString() },
    { violation_id: 6, plate_number: 'DL-01-MN-6789', vehicle_type: 'car', make: 'Honda', model: 'City', violation_type: 'speeding', recorded_speed: 105.0, fine_amount: 2500.00, status: 'issued', occurred_at: new Date(Date.now() - 3600000 * 12).toISOString() },
    { violation_id: 7, plate_number: 'HR-55-QR-4567', vehicle_type: 'car', make: 'Mahindra', model: 'Scorpio', violation_type: 'illegal_parking', recorded_speed: 0.0, fine_amount: 500.00, status: 'paid', occurred_at: new Date(Date.now() - 3600000 * 72).toISOString() },
    { violation_id: 8, plate_number: 'DL-01-AB-1234', vehicle_type: 'car', make: 'Maruti Suzuki', model: 'Swift', violation_type: 'wrong_way', recorded_speed: 25.0, fine_amount: 1500.00, status: 'pending', occurred_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  ],
  vms: [
    { vms_id: 1, segment_name: 'Midtown West Corridor (demo)', current_text: 'METRO CORRIDOR: SMOOTH FLOW - SPEED LIMIT 40 KM/H' },
    { vms_id: 2, segment_name: 'Times Square Connector (demo)', current_text: 'CAUTION: ROADWORK AHEAD IN LANE 2 - DRIVE SLOW' },
    { vms_id: 3, segment_name: 'Hudson River Parkway Feeder (demo)', current_text: 'EXPRESSWAY APPROACH: CLEAR - WEAR SEATBELT' },
    { vms_id: 4, segment_name: 'East Midtown Arterial (demo)', current_text: 'AIRPORT LINK: HEAVY MONSOON TRAFFIC EXPECTED' },
  ],
  workorders: [
    { work_order_id: 1, asset_type: 'signal', asset_id: 6, priority: 1, description: 'Controller board communication failure at Midtown East', assigned_to_name: 'Senior Operator Sharma', status: 'in_progress' },
    { work_order_id: 2, asset_type: 'sensor', asset_id: 10, priority: 2, description: 'Optical camera lens calibration required at West Side overpass', assigned_to_name: 'Senior Operator Sharma', status: 'open' },
    { work_order_id: 3, asset_type: 'vms', asset_id: 4, priority: 3, description: 'Firmware update for East Midtown VMS panel', assigned_to_name: 'Dispatch Officer Kapoor', status: 'done' },
    { work_order_id: 4, asset_type: 'road_segment', asset_id: 2, priority: 2, description: 'Pothole patch repair verification after monsoon rain', assigned_to_name: 'Senior Operator Sharma', status: 'open' },
    { work_order_id: 5, asset_type: 'signal', asset_id: 1, priority: 4, description: 'Annual preventive maintenance for ATC-2070 controller', assigned_to_name: 'Dispatch Officer Kapoor', status: 'done' },
    { work_order_id: 6, asset_type: 'sensor', asset_id: 12, priority: 3, description: 'Power supply line check on Midtown East radar unit', assigned_to_name: 'Senior Operator Sharma', status: 'open' },
  ],
  activity: [
    { activity_id: 101, action: 'status_changed', details: 'Incident #1 status changed from verified to responding', occurred_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { activity_id: 102, action: 'mode_changed', details: 'Signal #1 mode set to adaptive', occurred_at: new Date(Date.now() - 3600000 * 4).toISOString() },
    { activity_id: 103, action: 'created', details: 'Reported accident on segment #5', occurred_at: new Date(Date.now() - 3600000 * 1).toISOString() },
  ],
  history: [],
};

// Generate synchronized 24-hour reading history for all sample segments
for (let segId = 1; segId <= 8; segId++) {
  const baseSpeed = [40, 26, 48, 33, 64, 38, 74, 29][segId - 1];
  const baseVol = [210, 95, 340, 160, 520, 280, 640, 110][segId - 1];
  for (let h = 0; h < 24; h++) {
    const timestamp = FIXED_BASE_TIME - (23 - h) * 3600000;
    SAMPLE.history.push({
      segment_id: segId,
      hour: new Date(timestamp).toISOString(),
      avg_speed_kmh: Math.round(baseSpeed + 6 * Math.sin(h / 3)),
      vehicle_count: Math.round(baseVol + 40 * Math.cos(h / 2.5)),
    });
  }
}

let usingSample = false;
let trendHours = 12;
let trendMetric = 'speed';
let map, segmentLayer, incidentLayer, reportLocationMarker;
let selectedIncidentLocation = null;
let selectedSegmentId = null;

async function fetchJSON(path, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...opts, signal: controller.signal });
    if (!res.ok) throw new Error(`${path} returned ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function loadAll() {
  try {
    const [segments, incidents, signals, sensors, readings, activity, history, violations] = await Promise.all([
      fetchJSON('/segments'),
      fetchJSON('/incidents'),
      fetchJSON('/signals'),
      fetchJSON('/sensors'),
      fetchJSON('/sensors/readings/latest'),
      fetchJSON('/activity'),
      fetchJSON(`/sensors/readings/history?hours=${trendHours}`).catch(() => SAMPLE.history),
      fetchJSON('/violations').catch(() => SAMPLE.violations),
    ]);
    usingSample = false;
    setConn(true);
    // If backend history is empty, fall back to sample history for rich graph curves
    const safeHistory = (Array.isArray(history) && history.length > 0) ? history : SAMPLE.history;
    return { segments, incidents, signals, sensors, readings, activity, history: safeHistory, violations };
  } catch (err) {
    usingSample = true;
    setConn(false);
    return SAMPLE;
  }
}

function setConn(live) {
  const dot = document.getElementById('connDot');
  const label = document.getElementById('connLabel');
  if (dot) dot.className = 'dot ' + (live ? 'live' : 'down');
  if (label) label.textContent = live ? 'MySQL API connected' : 'MySQL unreachable — showing sample telemetry';
}

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  if (typeof L === 'undefined') {
    console.warn('Leaflet GIS library not loaded. Map fallback activated.');
    mapEl.innerHTML = `
      <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#151e25; color:#9baab6; text-align:center; padding:20px;">
        <span style="font-size:2.2rem; margin-bottom:10px;">🗺️</span>
        <strong style="color:#e8edf1; font-size:1.1rem; margin-bottom:6px;">Manhattan Transportation Network (New York)</strong>
        <p style="margin:0; font-size:0.84rem; max-width:400px;">Leaflet GIS map tile server offline or loading. Road corridors, speed telemetry, and graphs are actively rendering below.</p>
      </div>
    `;
    segmentLayer = { clearLayers: () => {}, eachLayer: () => {} };
    incidentLayer = { clearLayers: () => {} };
    return;
  }

  try {
    map = L.map('map', { zoomControl: true }).setView([40.75791, -73.98627], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    segmentLayer = L.layerGroup().addTo(map);
    incidentLayer = L.layerGroup().addTo(map);

    map.on('click', (event) => {
      if (event.originalEvent?.target?.closest?.('.leaflet-interactive')) return;
      selectedIncidentLocation = event.latlng;
      if (reportLocationMarker) map.removeLayer(reportLocationMarker);
      reportLocationMarker = L.circleMarker(event.latlng, {
        radius: 8,
        color: '#f2a33c',
        fillColor: '#f2a33c',
        fillOpacity: 0.9,
        weight: 2,
      }).bindPopup('New incident pin').addTo(map);
      const note = document.getElementById('formNote');
      if (note) note.textContent = 'Map location selected. Submit form to record in database.';
    });
  } catch (err) {
    console.warn('Map initialization error:', err);
    segmentLayer = { clearLayers: () => {}, eachLayer: () => {} };
    incidentLayer = { clearLayers: () => {} };
  }
}

function clearIncidentMapPick() {
  selectedIncidentLocation = null;
  if (reportLocationMarker && map) {
    map.removeLayer(reportLocationMarker);
    reportLocationMarker = null;
  }
}

function renderMap(data) {
  if (!segmentLayer || typeof segmentLayer.clearLayers !== 'function') return;
  segmentLayer.clearLayers();
  if (incidentLayer && typeof incidentLayer.clearLayers === 'function') {
    incidentLayer.clearLayers();
  }

  if (typeof L === 'undefined') return;

  data.segments.forEach((seg) => {
    let geom = seg.geometry;
    if (typeof geom === 'string') {
      try { geom = JSON.parse(geom); } catch {}
    }
    if (!geom || !Array.isArray(geom.coordinates)) return;
    const latlngs = geom.coordinates.map(([lng, lat]) => [lat, lng]);
    const line = L.polyline(latlngs, {
      color: STATUS_COLOR[seg.status] || '#8a8d91',
      weight: selectedSegmentId === seg.segment_id ? 7 : 5,
      opacity: 0.9,
    }).bindPopup(`<strong>${escapeHTML(seg.name)}</strong><br>Class: ${escapeHTML(seg.road_class || '')}<br>Status: ${escapeHTML(seg.status)}<br>Limit: ${escapeHTML(seg.speed_limit_kmh ?? '—')} km/h`);
    line.on('click', () => {
      segmentLayer.eachLayer((layer) => { if (layer.setStyle) layer.setStyle({ weight: 5 }); });
      selectedSegmentId = seg.segment_id;
      line.setStyle({ weight: 7 });
      renderSegmentDetails(seg, data.readings);
    });
    line.addTo(segmentLayer);
  });

  if (selectedSegmentId !== null) {
    const selected = data.segments.find((segment) => segment.segment_id === selectedSegmentId);
    if (selected) renderSegmentDetails(selected, data.readings);
  }

  data.incidents.forEach((inc) => {
    if (!inc.location) return;
    let loc = inc.location;
    if (typeof loc === 'string') {
      try { loc = JSON.parse(loc); } catch {}
    }
    if (!loc || !Array.isArray(loc.coordinates)) return;
    const [lng, lat] = loc.coordinates;
    L.circleMarker([lat, lng], {
      radius: 7,
      color: '#d1495b',
      fillColor: '#d1495b',
      fillOpacity: 0.85,
      weight: 1,
    }).bindPopup(`<strong>${escapeHTML(inc.incident_type)}</strong><br>${escapeHTML(inc.description || '')}<br>Severity ${escapeHTML(inc.severity)} · Status: ${escapeHTML(inc.status)}`)
      .addTo(incidentLayer);
  });
}

function renderSegmentDetails(segment, readings) {
  const reading = readings.find((item) => item.segment_id === segment.segment_id);
  const fields = [
    ['Road class', segment.road_class || '—'],
    ['Status', segment.status || '—'],
    ['Lanes', segment.lanes ?? '—'],
    ['Speed limit', segment.speed_limit_kmh == null ? '—' : `${segment.speed_limit_kmh} km/h`],
    ['Latest speed', reading?.avg_speed_kmh == null ? 'No recent reading' : `${reading.avg_speed_kmh} km/h`],
    ['Vehicles / hr', reading?.vehicle_count ?? 'No recent reading'],
  ];
  const details = document.getElementById('segmentDetails');
  if (!details) return;
  details.innerHTML = `
    <div class="details-heading">
      <div><p class="details-kicker">Selected corridor</p><h3>${escapeHTML(segment.name)}</h3></div>
      <span class="segment-status status-${escapeHTML(segment.status)}">${escapeHTML(segment.status)}</span>
    </div>
    <dl class="details-grid">
      ${fields.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}
    </dl>`;
}

function renderRoadDetails(segments, readings) {
  const body = document.getElementById('roadDetailsBody');
  if (!body) return;
  if (!Array.isArray(segments) || segments.length === 0) {
    body.innerHTML = '<tr><td colspan="7" class="empty">No road corridors available.</td></tr>';
    return;
  }

  body.innerHTML = segments.map((segment) => {
    const reading = (readings || []).find((item) => item.segment_id === segment.segment_id);
    const status = String(segment.status || 'unknown').toLowerCase();
    return `<tr>
      <td><strong>${escapeHTML(segment.name)}</strong></td>
      <td>${escapeHTML(segment.road_class || '—')}</td>
      <td>${escapeHTML(segment.lanes ?? '—')}</td>
      <td><span class="segment-status status-${escapeHTML(status)}">${escapeHTML(status)}</span></td>
      <td>${segment.speed_limit_kmh == null ? '—' : `${escapeHTML(segment.speed_limit_kmh)} km/h`}</td>
      <td>${reading?.avg_speed_kmh == null ? '—' : `${escapeHTML(reading.avg_speed_kmh)} km/h`}</td>
      <td>${reading?.vehicle_count == null ? '—' : escapeHTML(reading.vehicle_count)}</td>
    </tr>`;
  }).join('');
}

function sevClass(sev) {
  if (sev >= 4) return 'sev-high';
  if (sev >= 2) return 'sev-mid';
  return 'sev-low';
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

// ---------------------------------------------------------------------
// GRAPH 1: Multi-Series Hourly Traffic Speed & Volume Trend Line Chart
// ---------------------------------------------------------------------
function renderTrafficTrends(segments, history) {
  const chart = document.getElementById('trendChart');
  const cloneChart = document.getElementById('analyticsTrendChart');
  if (!chart && !cloneChart) return;

  const metricKey = trendMetric === 'vehicles' ? 'vehicle_count' : 'avg_speed_kmh';
  const metricLabel = trendMetric === 'vehicles' ? 'Vehicle count' : 'Average speed';
  const unit = trendMetric === 'vehicles' ? 'veh/hr' : 'km/h';
  const desc = document.getElementById('trendDescription');
  if (desc) desc.textContent = `${metricLabel} by road corridor over the last ${trendHours} hours`;

  const historyData = (Array.isArray(history) && history.length > 0) ? history : SAMPLE.history;
  const segmentsData = (Array.isArray(segments) && segments.length > 0) ? segments : SAMPLE.segments;

  const readings = historyData.filter((item) => item[metricKey] !== null && Number.isFinite(Number(item[metricKey])));
  if (readings.length === 0) {
    if (chart) chart.innerHTML = '<p class="details-placeholder">Rendering speed curves…</p>';
    if (cloneChart) cloneChart.innerHTML = '<p class="details-placeholder">Rendering speed curves…</p>';
    return;
  }

  // Parse millisecond timestamp safely without NaN
  const getMs = (h) => {
    if (typeof h === 'number') return h;
    const ms = Date.parse(String(h).replace(' ', 'T'));
    return Number.isFinite(ms) ? ms : Date.now();
  };

  const timestamps = [...new Set(readings.map((item) => getMs(item.hour)))].sort((a, b) => a - b);
  const timestampIndex = new Map(timestamps.map((ts, idx) => [ts, idx]));

  const seriesBySegment = new Map();
  readings.forEach((reading) => {
    if (!seriesBySegment.has(reading.segment_id)) seriesBySegment.set(reading.segment_id, []);
    seriesBySegment.get(reading.segment_id).push(reading);
  });

  const width = 760;
  const height = 238;
  const left = 44;
  const right = 20;
  const top = 16;
  const bottom = 36;
  const plotHeight = height - top - bottom;
  const plotWidth = width - left - right;

  const maxValue = Math.max(10, ...readings.map((r) => Number(r[metricKey])));
  const tickStep = trendMetric === 'vehicles' ? 100 : 20;
  const ceiling = Math.max(trendMetric === 'vehicles' ? 400 : 80, Math.ceil(maxValue / tickStep) * tickStep);
  const ticks = Array.from({ length: Math.floor(ceiling / tickStep) + 1 }, (_, index) => index * tickStep);

  const xFor = (hourVal) => {
    const ms = getMs(hourVal);
    const idx = timestampIndex.get(ms);
    if (idx === undefined || timestamps.length < 2) return left + plotWidth / 2;
    return left + (idx / (timestamps.length - 1)) * plotWidth;
  };

  const yFor = (value) => {
    const num = Number(value);
    const clamped = Math.min(ceiling, Math.max(0, Number.isFinite(num) ? num : 0));
    return top + plotHeight - (clamped / ceiling) * plotHeight;
  };

  const grid = ticks.map((tick) => {
    const y = yFor(tick);
    return `<line class="trend-grid-line" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" />
      <text class="trend-axis-label" x="${left - 8}" y="${y + 4}" text-anchor="end">${tick}</text>`;
  }).join('');

  const timeIndexes = [...new Set([0, Math.floor((timestamps.length - 1) / 3), Math.floor((2 * (timestamps.length - 1)) / 3), timestamps.length - 1])];
  const timeLabels = timeIndexes.map((index) => {
    const d = new Date(timestamps[index]);
    const label = !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${index}h`;
    return `<text class="trend-axis-label" x="${xFor(timestamps[index])}" y="${height - 8}" text-anchor="middle">${escapeHTML(label)}</text>`;
  }).join('');

  const colors = ['#4ebca8', '#f2a33c', '#80bad8', '#e07a5f', '#d1495b', '#a288e3', '#64b5f6', '#81c784'];
  const paths = [...seriesBySegment.entries()].map(([segmentId, rows], seriesIndex) => {
    const segment = segmentsData.find((item) => item.segment_id === segmentId);
    const color = colors[seriesIndex % colors.length];
    rows.sort((a, b) => getMs(a.hour) - getMs(b.hour));
    const points = rows.map((row) => `${xFor(row.hour).toFixed(1)},${yFor(row[metricKey]).toFixed(1)}`).join(' ');
    const circles = rows.map((row) => `<circle class="trend-point" cx="${xFor(row.hour).toFixed(1)}" cy="${yFor(row[metricKey]).toFixed(1)}" r="3" fill="${color}"><title>${escapeHTML(segment?.name || `Segment ${segmentId}`)}: ${escapeHTML(row[metricKey])} ${unit}</title></circle>`).join('');
    return `<polyline class="trend-series-line" points="${points}" stroke="${color}" />${circles}`;
  }).join('');

  const legend = [...seriesBySegment.keys()].slice(0, 6).map((segmentId, index) => {
    const segment = segmentsData.find((item) => item.segment_id === segmentId);
    const color = colors[index % colors.length];
    return `<span class="trend-legend-item"><i class="trend-legend-swatch" style="background:${color}"></i>${escapeHTML(segment?.name || `Segment ${segmentId}`)}</span>`;
  }).join('');

  const chartHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${metricLabel} by road over the last ${trendHours} hours">
      ${grid}${timeLabels}${paths}
      <text class="trend-axis-label" x="12" y="16">${trendMetric === 'vehicles' ? 'veh.' : 'km/h'}</text>
    </svg>
    <div class="trend-legend">${legend}</div>
  `;

  if (chart) chart.innerHTML = chartHTML;
  if (cloneChart) cloneChart.innerHTML = chartHTML;
}

// ---------------------------------------------------------------------
// GRAPH 2: Operations watchlist, ranked from available demo/API data
// ---------------------------------------------------------------------
function renderOperationsWatchlist(segments, readings, incidents) {
  const container = document.getElementById('operationsWatchlist');
  if (!container) return;

  const segList = Array.isArray(segments) ? segments : SAMPLE.segments;
  const readList = Array.isArray(readings) ? readings : SAMPLE.readings;
  const incidentList = Array.isArray(incidents) ? incidents : SAMPLE.incidents;
  const activeStatuses = new Set(['reported', 'verified', 'responding']);

  const items = segList.map((segment) => {
    const reading = readList.find((item) => Number(item.segment_id) === Number(segment.segment_id));
    const activeIncidents = incidentList.filter((item) =>
      Number(item.segment_id) === Number(segment.segment_id) && activeStatuses.has(String(item.status || '').toLowerCase()));
    const limit = Number(segment.speed_limit_kmh) || 0;
    const speed = Number(reading?.avg_speed_kmh);
    const deficitPct = limit > 0 && Number.isFinite(speed)
      ? Math.round(Math.max(0, ((limit - speed) / limit) * 100))
      : 0;
    const congestion = Number(reading?.congestion_lvl) || 0;
    const status = String(segment.status || 'open').toLowerCase();
    const score = (status === 'closed' ? 35 : status === 'restricted' ? 25 : 0)
      + (activeIncidents.length ? 30 + Math.min(activeIncidents.length - 1, 2) * 5 : 0)
      + (deficitPct >= 25 ? 25 : deficitPct >= 15 ? 15 : deficitPct > 0 ? 5 : 0)
      + (congestion >= 4 ? 15 : congestion >= 3 ? 8 : 0);

    const reasons = [];
    if (status === 'closed' || status === 'restricted') reasons.push(`${status === 'closed' ? 'Closed' : 'Restricted'} road`);
    if (deficitPct > 0) reasons.push(`Speed ${deficitPct}% below limit (${Number.isFinite(speed) ? speed : '—'} / ${limit || '—'} km/h)`);
    if (activeIncidents.length) reasons.push(`${activeIncidents.length} active incident${activeIncidents.length === 1 ? '' : 's'}`);
    if (congestion >= 3) reasons.push(`Congestion level ${congestion}/5`);

    let nextStep = 'Continue monitoring traffic conditions.';
    if (activeIncidents.length) nextStep = 'Review the incident report and response status.';
    else if (status === 'closed' || status === 'restricted') nextStep = 'Verify the restriction and assess route impacts.';
    else if (deficitPct >= 15) nextStep = 'Check the corridor conditions and validate its traffic reading.';

    return { name: segment.name, score, activeIncidents, reasons, nextStep };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  if (!items.length) {
    container.innerHTML = '<p class="details-placeholder">No road corridors are available to prioritize.</p>';
    return;
  }

  container.innerHTML = `<div style="display:grid;gap:12px">
    ${items.map((item, index) => {
      const priority = item.score >= 50 ? 'High' : item.score >= 25 ? 'Review' : 'Monitor';
      const accent = priority === 'High' ? 'var(--red)' : priority === 'Review' ? 'var(--amber)' : 'var(--teal)';
      const reasons = item.reasons.length ? item.reasons.join(' · ') : 'No restriction, active incident, or notable speed shortfall';
      return `<article style="padding:14px 16px;border:1px solid var(--border,#2c3942);border-left:4px solid ${accent};border-radius:8px;background:var(--panel-raised,#202a31)">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:10px;min-width:0"><span style="color:var(--muted,#9aaab5);font:600 12px monospace">0${index + 1}</span><strong>${escapeHTML(item.name)}</strong></div>
          <span style="padding:4px 9px;border-radius:999px;color:${accent};background:color-mix(in srgb, ${accent} 14%, transparent);font-size:12px;font-weight:700">${priority} priority</span>
        </div>
        <p style="margin:9px 0 5px;color:var(--muted,#a3b0b8);font-size:14px">${escapeHTML(reasons)}</p>
        <p style="margin:0;font-size:14px"><strong>Next step:</strong> ${escapeHTML(item.nextStep)}</p>
      </article>`;
    }).join('')}
    <p style="margin:0;color:var(--muted,#9aaab5);font-size:12px">Priorities are a demo aid based on the data currently available; they do not replace operator judgment.</p>
  </div>`;
}

// ---------------------------------------------------------------------
// GRAPH 3: 24-Hour Vehicular Volume Distribution (Vertical Bar Chart)
// ---------------------------------------------------------------------
function renderVolumeBarChart(history) {
  const container = document.getElementById('volumeBarChart');
  if (!container) return;

  const historyData = (Array.isArray(history) && history.length > 0) ? history : SAMPLE.history;
  const buckets = Array.from({ length: 12 }, (_, index) => ({
    label: `${String(index * 2).padStart(2, '0')}:00`,
    total: 0,
  }));

  historyData.forEach((reading) => {
    const rawHour = reading.hour;
    const parsed = rawHour instanceof Date ? rawHour : new Date(String(rawHour).replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) return;
    const bucket = Math.floor(parsed.getHours() / 2);
    buckets[bucket].total += Number(reading.vehicle_count) || 0;
  });

  const chartWidth = 900;
  const chartHeight = 300;
  const left = 68;
  const right = 20;
  const top = 24;
  const bottom = 58;
  const plotHeight = chartHeight - top - bottom;
  const plotWidth = chartWidth - left - right;
  const maxValue = Math.max(1, ...buckets.map((bucket) => bucket.total));
  const ceiling = Math.ceil(maxValue / 100) * 100 || 100;
  const tickCount = 4;
  const slotWidth = plotWidth / buckets.length;
  const barWidth = Math.min(42, slotWidth * 0.68);

  const grid = Array.from({ length: tickCount + 1 }, (_, index) => {
    const value = (ceiling / tickCount) * index;
    const y = top + plotHeight - (value / ceiling) * plotHeight;
    return `<g>
      <line x1="${left}" y1="${y}" x2="${chartWidth - right}" y2="${y}" stroke="#34434e" stroke-width="1" />
      <text x="${left - 10}" y="${y + 4}" fill="#a9b7c2" font-size="12" text-anchor="end" font-family="system-ui, sans-serif">${Math.round(value).toLocaleString()}</text>
    </g>`;
  }).join('');

  const bars = buckets.map((bucket, index) => {
    const x = left + index * slotWidth + (slotWidth - barWidth) / 2;
    const barHeight = bucket.total > 0 ? Math.max(3, (bucket.total / ceiling) * plotHeight) : 0;
    const y = top + plotHeight - barHeight;
    const center = x + barWidth / 2;
    return `<g>
      <title>${bucket.label}–${String((index * 2 + 2) % 24).padStart(2, '0')}:00: ${bucket.total.toLocaleString()} vehicles</title>
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="#43b8a5" />
      <text x="${center}" y="${Math.max(top + 12, y - 7)}" fill="#e8edf1" font-size="11" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">${bucket.total.toLocaleString()}</text>
      <text x="${center}" y="${chartHeight - 25}" fill="#b6c2cb" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif">${bucket.label}</text>
    </g>`;
  }).join('');

  container.innerHTML = `
    <div style="width:100%;overflow-x:auto;">
      <svg viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Vehicle counts by two-hour period over the last 24 hours" style="display:block;width:100%;min-width:620px;height:auto;">
        <text x="${left}" y="14" fill="#a9b7c2" font-size="11" font-family="system-ui, sans-serif">Vehicles per 2-hour period</text>
        ${grid}${bars}
      </svg>
    </div>`;
}

// ---------------------------------------------------------------------
// GRAPH 4: Sensor Network Health Donut SVG Chart
// ---------------------------------------------------------------------
function renderSensorDonutChart(sensors) {
  const container = document.getElementById('sensorDonutChart');
  if (!container) return;

  const sensorList = (Array.isArray(sensors) && sensors.length > 0) ? sensors : SAMPLE.sensors;
  const typeCounts = {};
  sensorList.forEach((s) => {
    typeCounts[s.sensor_type] = (typeCounts[s.sensor_type] || 0) + 1;
  });

  const total = sensorList.length || 1;
  const colors = { loop: '#4ebca8', camera: '#80bad8', radar: '#f2a33c', anpr: '#e07a5f', lidar: '#a288e3', bluetooth: '#81c784' };
  const activeCount = sensorList.filter((s) => s.status === 'active').length;

  let cumulativeAngle = 0;
  const paths = Object.entries(typeCounts).map(([type, count]) => {
    const sliceAngle = (count / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += sliceAngle;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (cumulativeAngle - 90) * (Math.PI / 180);
    const x1 = 85 + 65 * Math.cos(startRad);
    const y1 = 85 + 65 * Math.sin(startRad);
    const x2 = 85 + 65 * Math.cos(endRad);
    const y2 = 85 + 65 * Math.sin(endRad);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const color = colors[type] || '#ccc';
    return `<path d="M 85 85 L ${x1.toFixed(1)} ${y1.toFixed(1)} A 65 65 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${color}" stroke="#19232c" stroke-width="2"/>`;
  }).join('');

  container.innerHTML = `
    <div class="donut-widget">
      <div class="donut-svg-wrap">
        <svg viewBox="0 0 170 170">
          ${paths}
          <circle cx="85" cy="85" r="42" fill="#19232c" />
          <text x="85" y="82" text-anchor="middle" fill="#e8edf1" font-size="16" font-weight="700">${activeCount}/${total}</text>
          <text x="85" y="97" text-anchor="middle" fill="#9baab6" font-size="9">ONLINE</text>
        </svg>
      </div>
      <div class="donut-legend">
        ${Object.entries(typeCounts).map(([type, count]) => `
          <div class="donut-legend-item">
            <span class="legend-swatch-circle" style="background:${colors[type] || '#ccc'}"></span>
            <span><strong>${escapeHTML(type.toUpperCase())}</strong>: ${count} (${Math.round((count / total) * 100)}%)</span>
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ---------------------------------------------------------------------
// GRAPH 5: Traffic Violation Fines & Revenue Recovery Chart
// ---------------------------------------------------------------------
function renderViolationRevenueChart(violations) {
  const container = document.getElementById('violationRevenueChart');
  if (!container) return;

  const violationList = (Array.isArray(violations) && violations.length > 0) ? violations : SAMPLE.violations;
  const revenueByType = {};
  let totalCollected = 0;
  let totalPending = 0;

  violationList.forEach((v) => {
    const fine = Number(v.fine_amount) || 0;
    if (!revenueByType[v.violation_type]) {
      revenueByType[v.violation_type] = { count: 0, fines: 0 };
    }
    revenueByType[v.violation_type].count += 1;
    revenueByType[v.violation_type].fines += fine;
    if (v.status === 'paid') totalCollected += fine;
    else totalPending += fine;
  });

  const entries = Object.entries(revenueByType);
  const maxFines = Math.max(1, ...entries.map(([, d]) => d.fines));

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:12px; gap:8px; flex-wrap:wrap;">
      <div><span style="color:var(--muted); font-size:.78rem;">Fines Levied:</span> <strong style="color:var(--teal); font-size:1rem; font-family:var(--mono);">₹${(totalCollected + totalPending).toLocaleString()}</strong></div>
      <div><span style="color:var(--muted); font-size:.78rem;">Collected:</span> <strong style="color:#6ee7d2; font-size:1rem; font-family:var(--mono);">₹${totalCollected.toLocaleString()}</strong></div>
      <div><span style="color:var(--muted); font-size:.78rem;">Pending:</span> <strong style="color:var(--amber); font-size:1rem; font-family:var(--mono);">₹${totalPending.toLocaleString()}</strong></div>
    </div>
    <div class="hbar-container">
      ${entries.map(([type, data]) => `
        <div class="hbar-item">
          <div class="hbar-labels">
            <span class="hbar-name">${escapeHTML(type.replace('_', ' ').toUpperCase())} (${data.count})</span>
            <span class="hbar-stat">₹${data.fines.toLocaleString()}</span>
          </div>
          <div class="hbar-track">
            <div class="hbar-fill lvl-2" style="width: ${Math.round((data.fines / maxFines) * 100)}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ---------------------------------------------------------------------
// GRAPH 6: Incident Severity & Category Breakdown
// ---------------------------------------------------------------------
function renderIncidentTypeBarChart(incidents) {
  const container = document.getElementById('incidentTypeBarChart');
  if (!container) return;

  const incidentList = (Array.isArray(incidents) && incidents.length > 0) ? incidents : SAMPLE.incidents;
  const typeMap = {};
  incidentList.forEach((inc) => {
    typeMap[inc.incident_type] = (typeMap[inc.incident_type] || 0) + 1;
  });

  const maxCount = Math.max(1, ...Object.values(typeMap));
  const types = Object.entries(typeMap);

  container.innerHTML = `
    <div class="hbar-container">
      ${types.map(([type, count]) => `
        <div class="hbar-item">
          <div class="hbar-labels">
            <span class="hbar-name">${escapeHTML(type.toUpperCase())}</span>
            <span class="hbar-stat">${count} recorded incident(s)</span>
          </div>
          <div class="hbar-track">
            <div class="hbar-fill lvl-3" style="width: ${Math.round((count / maxCount) * 100)}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderIncidentList(incidents) {
  const el = document.getElementById('incidentList');
  if (!el) return;
  const open = incidents.filter((i) => i.status !== 'cleared');
  if (open.length === 0) {
    el.innerHTML = '<li class="empty">No active incidents</li>';
    return;
  }
  el.innerHTML = open
    .map(
      (i) => `<li class="${sevClass(i.severity)}">
        <span class="asset-name">${escapeHTML(i.incident_type)} (Sev ${i.severity}) — ${escapeHTML(i.description || 'no details')}</span>
        <form class="status-form" data-resource="incidents" data-id="${i.incident_id}">
          <label class="sr-only" for="incident-status-${i.incident_id}">Status for incident</label>
          <select id="incident-status-${i.incident_id}" name="status">
            ${['reported', 'verified', 'responding', 'cleared'].map((status) => `<option value="${status}" ${i.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
          <button type="submit">Update</button>
        </form>
      </li>`
    )
    .join('');
}

function renderIncidentHistory(incidents) {
  const list = document.getElementById('historyList');
  const countEl = document.getElementById('historyCount');
  if (!list) return;

  const cleared = incidents
    .filter((incident) => incident.status === 'cleared')
    .sort((a, b) => Date.parse(b.cleared_at || b.reported_at) - Date.parse(a.cleared_at || a.reported_at));
  if (countEl) countEl.textContent = cleared.length;

  if (cleared.length === 0) {
    list.innerHTML = '<li class="empty">No cleared incidents yet</li>';
    return;
  }

  list.innerHTML = cleared.map((incident) => {
    const clearedAt = incident.cleared_at || incident.reported_at;
    const dateLabel = clearedAt ? new Date(clearedAt).toLocaleString() : 'Time unavailable';
    return `<li>
      <span><strong>${escapeHTML(incident.incident_type)}</strong> — ${escapeHTML(incident.description || 'cleared')}</span>
      <time>Cleared ${escapeHTML(dateLabel)}</time>
    </li>`;
  }).join('');
}

function renderActivityList(activity) {
  const list = document.getElementById('activityList');
  if (!list) return;
  if (activity.length === 0) {
    list.innerHTML = '<li class="empty">No activity recorded yet</li>';
    return;
  }

  list.innerHTML = activity.slice(0, 15).map((entry) => {
    const dateLabel = entry.occurred_at ? new Date(entry.occurred_at).toLocaleTimeString() : '';
    return `<li>
      <span>${escapeHTML(entry.details)}</span>
      <time>${escapeHTML(dateLabel)}</time>
    </li>`;
  }).join('');
}

function renderViolationsTable(violations) {
  const tbody = document.getElementById('violationsTableBody');
  const countEl = document.getElementById('tabViolationsCount');
  if (countEl) countEl.textContent = violations.length;
  if (!tbody) return;

  if (violations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty">No violations logged.</td></tr>';
    return;
  }

  tbody.innerHTML = violations.map((v) => `
    <tr>
      <td><code>#${v.violation_id}</code></td>
      <td><strong>${escapeHTML(v.plate_number)}</strong></td>
      <td>${escapeHTML(v.make || '')} ${escapeHTML(v.model || '')} (${escapeHTML(v.vehicle_type)})</td>
      <td>${escapeHTML(v.violation_type.replace('_', ' '))}</td>
      <td>${v.recorded_speed > 0 ? `${v.recorded_speed} km/h` : 'N/A'}</td>
      <td><strong>₹${Number(v.fine_amount).toLocaleString()}</strong></td>
      <td><span class="badge badge-${escapeHTML(v.status)}">${escapeHTML(v.status)}</span></td>
      <td><time>${v.occurred_at ? new Date(v.occurred_at).toLocaleDateString() : 'Recent'}</time></td>
      <td>
        <form class="status-form" data-resource="violations" data-id="${v.violation_id}">
          <select name="status">
            ${['pending', 'issued', 'paid', 'disputed', 'dismissed'].map((s) => `<option value="${s}" ${v.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <button type="submit">Save</button>
        </form>
      </td>
    </tr>
  `).join('');
}

function renderWorkOrdersTable(workorders) {
  const tbody = document.getElementById('workOrdersTableBody');
  const countEl = document.getElementById('tabWorkOrdersCount');
  if (countEl) countEl.textContent = workorders.filter((w) => w.status !== 'done').length;
  if (!tbody) return;

  if (workorders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty">No work orders recorded.</td></tr>';
    return;
  }

  tbody.innerHTML = workorders.map((w) => `
    <tr>
      <td><code>#${w.work_order_id}</code></td>
      <td>${escapeHTML(w.asset_type.toUpperCase())}</td>
      <td>#${w.asset_id}</td>
      <td><span class="badge badge-p${w.priority}">Priority ${w.priority}</span></td>
      <td>${escapeHTML(w.description)}</td>
      <td>${escapeHTML(w.assigned_to_name || 'Unassigned')}</td>
      <td><span class="badge badge-${escapeHTML(w.status)}">${escapeHTML(w.status)}</span></td>
      <td>
        <form class="status-form" data-resource="workorders" data-id="${w.work_order_id}">
          <select name="status">
            ${['open', 'in_progress', 'done', 'cancelled'].map((s) => `<option value="${s}" ${w.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <button type="submit">Update</button>
        </form>
      </td>
    </tr>
  `).join('');
}

function renderVMSBoards(vmsList) {
  const container = document.getElementById('vmsContainer');
  if (!container) return;
  if (vmsList.length === 0) {
    container.innerHTML = '<p class="empty">No VMS signs found.</p>';
    return;
  }

  container.innerHTML = vmsList.map((v) => `
    <div class="vms-card">
      <div class="vms-card-top">
        <span>VMS #${v.vms_id} &mdash; ${escapeHTML(v.segment_name || 'Corridor')}</span>
        <span class="badge badge-paid">LED ACTIVE</span>
      </div>
      <div class="vms-display">${escapeHTML(v.current_text || 'NO ADVISORY POSTED')}</div>
      <form class="vms-edit-form" data-vms-id="${v.vms_id}">
        <input type="text" name="current_text" value="${escapeHTML(v.current_text || '')}" placeholder="Broadcast message text..." required />
        <button type="submit">Broadcast</button>
      </form>
    </div>
  `).join('');
}

function renderSignalList(signals) {
  const el = document.getElementById('signalList');
  if (!el) return;
  if (signals.length === 0) {
    el.innerHTML = '<li class="empty">No signals</li>';
    return;
  }
  el.innerHTML = signals
    .map(
      (s) => `<li>
        <span class="asset-name">${escapeHTML(s.intersection_name)}</span>
        <form class="status-form" data-resource="signals" data-id="${s.signal_id}">
          <label class="sr-only" for="signal-mode-${s.signal_id}">Mode for signal</label>
          <select id="signal-mode-${s.signal_id}" name="mode">
            ${['fixed', 'adaptive', 'flash', 'manual', 'off'].map((mode) => `<option value="${mode}" ${s.mode === mode ? 'selected' : ''}>${mode}</option>`).join('')}
          </select>
          <button type="submit">Update</button>
        </form>
      </li>`
    )
    .join('');
}

function renderSegmentList(segments) {
  const el = document.getElementById('segmentList');
  if (!el) return;
  if (segments.length === 0) {
    el.innerHTML = '<li class="empty">No road segments</li>';
    return;
  }
  el.innerHTML = segments
    .map(
      (segment) => `<li>
        <span class="asset-name">${escapeHTML(segment.name)}</span>
        <form class="status-form" data-resource="segments" data-id="${segment.segment_id}">
          <label class="sr-only" for="segment-status-${segment.segment_id}">Status for road</label>
          <select id="segment-status-${segment.segment_id}" name="status">
            ${['open', 'restricted', 'closed'].map((status) => `<option value="${status}" ${segment.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
          <button type="submit">Update</button>
        </form>
      </li>`
    )
    .join('');
}

async function handleStatusUpdate(e) {
  const form = e.target;
  if (!form.matches('.status-form')) return;
  e.preventDefault();

  const resource = form.dataset.resource;
  let note;
  if (resource === 'incidents') note = document.getElementById('incidentManagementNote');
  else if (resource === 'violations') note = document.getElementById('violationNote');
  else if (resource === 'workorders') note = document.getElementById('workOrderNote');
  else note = document.getElementById('managementNote');

  if (usingSample) {
    if (note) note.textContent = 'Demo mode: Changes reflected locally.';
    return;
  }

  const field = resource === 'signals' ? 'mode' : 'status';
  const value = form.elements[field].value;
  const button = form.querySelector('button');
  if (button) button.disabled = true;
  if (note) note.textContent = 'Saving change…';

  try {
    await fetchJSON(`/${resource}/${form.dataset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (note) note.textContent = 'Change saved in MySQL.';
    await refresh();
  } catch (err) {
    if (note) note.textContent = 'Could not save change. Check API connection.';
    if (button) button.disabled = false;
  }
}

async function handleVMSSubmit(e) {
  const form = e.target;
  if (!form.matches('.vms-edit-form')) return;
  e.preventDefault();
  const vmsId = form.dataset.vmsId;
  const current_text = form.current_text.value;
  const note = document.getElementById('vmsNote');

  if (usingSample) {
    if (note) note.textContent = 'Demo mode: VMS updated in browser state.';
    const item = SAMPLE.vms.find((v) => String(v.vms_id) === String(vmsId));
    if (item) item.current_text = current_text;
    renderVMSBoards(SAMPLE.vms);
    return;
  }

  try {
    await fetchJSON(`/vms/${vmsId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_text }),
    });
    if (note) note.textContent = `VMS Sign #${vmsId} broadcast updated successfully.`;
    refresh();
  } catch {
    if (note) note.textContent = 'Could not update VMS board.';
  }
}

function renderKPIs(data) {
  const incEl = document.getElementById('kpiIncidents');
  if (incEl) incEl.textContent = data.incidents.filter((i) => i.status !== 'cleared').length;

  const speeds = data.readings.map((r) => Number(r.avg_speed_kmh)).filter((n) => !Number.isNaN(n));
  const avgSpeed = speeds.length ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : '—';
  const spdEl = document.getElementById('kpiSpeed');
  if (spdEl) spdEl.textContent = speeds.length ? `${avgSpeed} km/h` : '—';

  const sensorsOnline = data.sensors.filter((sensor) => sensor.status === 'active').length;
  const senEl = document.getElementById('kpiSensors');
  if (senEl) senEl.textContent = `${sensorsOnline}/${data.sensors.length}`;

  const adaptive = data.signals.filter((s) => s.mode === 'adaptive').length;
  const sigEl = document.getElementById('kpiSignals');
  if (sigEl) sigEl.textContent = `${adaptive}/${data.signals.length}`;
}

function populateSegmentSelect(segments) {
  const select = document.getElementById('segmentSelect');
  if (!select) return;
  select.innerHTML = segments.map((segment) => {
    let geom = segment.geometry;
    if (typeof geom === 'string') {
      try { geom = JSON.parse(geom); } catch {}
    }
    const coordinates = geom?.coordinates || [];
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const lng = first && last ? (first[0] + last[0]) / 2 : '';
    const lat = first && last ? (first[1] + last[1]) / 2 : '';
    return `<option value="${segment.segment_id}" data-lat="${lat}" data-lng="${lng}">${escapeHTML(segment.name)}</option>`;
  }).join('');
}

async function handleIncidentSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const note = document.getElementById('formNote');
  const selectedSegment = form.segment_id.selectedOptions[0];
  const hasMapPick = Boolean(selectedIncidentLocation);
  const lat = selectedIncidentLocation?.lat ?? Number(selectedSegment?.dataset.lat);
  const lng = selectedIncidentLocation?.lng ?? Number(selectedSegment?.dataset.lng);
  if (!selectedSegment || (!hasMapPick && (selectedSegment.dataset.lat === '' || selectedSegment.dataset.lng === '')) ||
      !Number.isFinite(lat) || !Number.isFinite(lng)) {
    if (note) note.textContent = 'Please choose a segment with valid coordinates or click the map.';
    return;
  }
  const body = {
    incident_type: form.incident_type.value,
    segment_id: Number(form.segment_id.value),
    severity: Number(form.severity.value),
    description: form.description.value,
    lat,
    lng,
  };

  if (usingSample) {
    if (note) note.textContent = 'Demo mode: Incident added to local memory.';
    SAMPLE.incidents.unshift({
      incident_id: SAMPLE.incidents.length + 1,
      ...body,
      status: 'reported',
      location: { type: 'Point', coordinates: [lng, lat] },
      reported_at: new Date().toISOString(),
    });
    form.reset();
    clearIncidentMapPick();
    refresh();
    return;
  }

  try {
    await fetchJSON('/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (note) note.textContent = 'Incident reported and saved in MySQL.';
    form.reset();
    clearIncidentMapPick();
    refresh();
  } catch (err) {
    if (note) note.textContent = 'Could not submit report — verify API connection.';
  }
}

function renderDashboard(data) {
  // Keep each panel independent so one bad component cannot blank the dashboard.
  try { renderMap(data); } catch (e) { console.warn('renderMap error:', e); }
  try { renderRoadDetails(data.segments, data.readings); } catch (e) { console.warn('renderRoadDetails error:', e); }
  try { renderKPIs(data); } catch (e) { console.warn('renderKPIs error:', e); }
  try { renderTrafficTrends(data.segments, data.history); } catch (e) { console.warn('renderTrafficTrends error:', e); }
  try { renderOperationsWatchlist(data.segments, data.readings, data.incidents); } catch (e) { console.warn('renderOperationsWatchlist error:', e); }
  try { renderSensorDonutChart(data.sensors); } catch (e) { console.warn('renderSensorDonutChart error:', e); }
  try { renderVolumeBarChart(data.history); } catch (e) { console.warn('renderVolumeBarChart error:', e); }
  try { renderViolationRevenueChart(data.violations); } catch (e) { console.warn('renderViolationRevenueChart error:', e); }
  try { renderIncidentList(data.incidents); } catch (e) { console.warn('renderIncidentList error:', e); }
  try { renderIncidentHistory(data.incidents); } catch (e) { console.warn('renderIncidentHistory error:', e); }
  try { renderActivityList(data.activity); } catch (e) { console.warn('renderActivityList error:', e); }
  try { renderSignalList(data.signals); } catch (e) { console.warn('renderSignalList error:', e); }
  try { renderSegmentList(data.segments); } catch (e) { console.warn('renderSegmentList error:', e); }
  try { populateSegmentSelect(data.segments); } catch (e) { console.warn('populateSegmentSelect error:', e); }
}

async function refresh() {
  try {
    const data = await loadAll();
    renderDashboard(data);
  } catch (err) {
    console.warn('loadAll failed, falling back to SAMPLE:', err);
    usingSample = true;
    setConn(false);
    renderDashboard(SAMPLE);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderDashboard(SAMPLE); // Paint charts immediately while API data loads.

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const targetId = btn.dataset.target;
      document.querySelectorAll('.view-section').forEach((sec) => sec.classList.add('hidden'));
      const activeSec = document.getElementById(targetId);
      if (activeSec) activeSec.classList.remove('hidden');

      if (targetId === 'view-dashboard' && map && typeof map.invalidateSize === 'function') {
        setTimeout(() => map.invalidateSize(), 100);
      }
    });
  });

  const metricSelect = document.getElementById('trendMetric');
  if (metricSelect) {
    metricSelect.addEventListener('change', (event) => {
      trendMetric = event.target.value;
      refresh();
    });
  }

  const rangeSelect = document.getElementById('trendRange');
  if (rangeSelect) {
    rangeSelect.addEventListener('change', (event) => {
      trendHours = Number(event.target.value) === 24 ? 24 : 12;
      refresh();
    });
  }

  const incidentForm = document.getElementById('incidentForm');
  if (incidentForm) incidentForm.addEventListener('submit', handleIncidentSubmit);

  const segmentSelect = document.getElementById('segmentSelect');
  if (segmentSelect) segmentSelect.addEventListener('change', clearIncidentMapPick);

  document.addEventListener('submit', handleStatusUpdate);
  document.addEventListener('submit', handleVMSSubmit);

  refresh();
  setInterval(refresh, 15000);
});
