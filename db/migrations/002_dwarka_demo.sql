-- Move the built-in demonstration network from San Francisco to Dwarka.
-- The basemap is real OpenStreetMap; these road/sensor/incident records remain demo data.
BEGIN;

UPDATE intersections
SET name = 'Dwarka Sector 12 Metro junction (demo)',
    location = ST_GeogFromText('POINT(77.0407 28.5923)')
WHERE name IN ('5th Ave & Main St', 'Dwarka Sector 12 Metro junction (demo)');

UPDATE intersections
SET name = 'Sector 12–13 link junction (demo)',
    location = ST_GeogFromText('POINT(77.0437 28.5948)')
WHERE name IN ('Main St & Harbor Rd', 'Sector 12–13 link junction (demo)');

UPDATE intersections
SET name = 'West Dwarka demo junction',
    location = ST_GeogFromText('POINT(77.0380 28.5952)')
WHERE name IN ('Harbor Rd & Dock St', 'West Dwarka demo junction');

UPDATE road_segments
SET name = 'Sector 12 Metro corridor (demo)',
    geometry = ST_GeogFromText('LINESTRING(77.0407 28.5923, 77.0422 28.5934, 77.0437 28.5948)'),
    length_m = 420,
    speed_limit_kmh = 40
WHERE name IN ('Main St (5th to Harbor)', 'Road 205 (Sector 12 Metro approach)', 'Sector 12 Metro corridor (demo)');

UPDATE road_segments
SET name = 'Sector 12–13 Link Road (demo)',
    geometry = ST_GeogFromText('LINESTRING(77.0437 28.5948, 77.0415 28.5965, 77.0380 28.5952)'),
    length_m = 380,
    speed_limit_kmh = 30
WHERE name IN ('Harbor Rd (Main to Dock)', 'Sector 12–13 Link Road (demo)');

UPDATE sensors
SET location = ST_GeogFromText('POINT(77.0422 28.5934)')
WHERE sensor_id = 1;

UPDATE sensors
SET location = ST_GeogFromText('POINT(77.0415 28.5965)')
WHERE sensor_id = 2;

UPDATE incidents
SET location = CASE
        WHEN segment_id = 1 THEN ST_GeogFromText('POINT(77.0422 28.5934)')
        ELSE ST_GeogFromText('POINT(77.0415 28.5965)')
    END,
    description = CASE
        WHEN description = 'Lane closure for resurfacing' THEN 'Demo lane closure near Dwarka Sector 12'
        ELSE description
    END
WHERE ST_X(location::geometry) < -100;

COMMIT;
