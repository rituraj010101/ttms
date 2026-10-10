-- Add one realistic reading for each seeded sensor so the dashboard KPIs
-- have data. Re-running within 10 minutes will not add duplicate demo rows.
INSERT INTO traffic_readings
    (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh,
     occupancy_pct, congestion_lvl)
SELECT s.sensor_id, s.segment_id, now(), v.vehicle_count, v.avg_speed_kmh,
       v.occupancy_pct, v.congestion_lvl
FROM (VALUES
    (1, 210, 44.0, 32.5, 1),
    (2, 95, 28.0, 68.0, 3)
) AS v(sensor_id, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
JOIN sensors s ON s.sensor_id = v.sensor_id
WHERE s.segment_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM traffic_readings existing
      WHERE existing.sensor_id = s.sensor_id
        AND existing.recorded_at >= now() - INTERVAL '10 minutes'
  );
