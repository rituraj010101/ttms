-- Generate clearly synthetic hourly readings for the seeded sensors.
-- Re-running this script does not add another reading within an existing hour.
WITH base(sensor_id, base_count, base_speed, base_occupancy) AS (
    VALUES (1, 210, 44.0, 32.0), (2, 95, 28.0, 64.0)
), generated AS (
    SELECT s.sensor_id,
           s.segment_id,
           hour_bucket.recorded_at,
           GREATEST(10, ROUND((base.base_count + 38 * SIN(EXTRACT(EPOCH FROM hour_bucket.recorded_at) / 14400 + s.sensor_id))::numeric)::integer) AS vehicle_count,
           GREATEST(10, ROUND((base.base_speed + 8 * SIN(EXTRACT(EPOCH FROM hour_bucket.recorded_at) / 18000 + s.sensor_id))::numeric, 1)) AS avg_speed_kmh,
           GREATEST(5, LEAST(95, ROUND((base.base_occupancy + 12 * SIN(EXTRACT(EPOCH FROM hour_bucket.recorded_at) / 21600 + s.sensor_id))::numeric, 2))) AS occupancy_pct
    FROM base
    JOIN sensors s ON s.sensor_id = base.sensor_id
    CROSS JOIN generate_series(
        date_trunc('hour', now()) - INTERVAL '23 hours',
        date_trunc('hour', now()),
        INTERVAL '1 hour'
    ) AS hour_bucket(recorded_at)
    WHERE s.segment_id IS NOT NULL
)
INSERT INTO traffic_readings
    (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh,
     occupancy_pct, congestion_lvl)
SELECT generated.sensor_id,
       generated.segment_id,
       generated.recorded_at,
       generated.vehicle_count,
       generated.avg_speed_kmh,
       generated.occupancy_pct,
       CASE
           WHEN generated.avg_speed_kmh < 20 THEN 4
           WHEN generated.avg_speed_kmh < 35 THEN 3
           ELSE 1
       END
FROM generated
WHERE NOT EXISTS (
    SELECT 1
    FROM traffic_readings existing
    WHERE existing.sensor_id = generated.sensor_id
      AND existing.recorded_at >= generated.recorded_at
      AND existing.recorded_at < generated.recorded_at + INTERVAL '1 hour'
);
