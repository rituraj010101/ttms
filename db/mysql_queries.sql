-- =====================================================================
-- Traffic & Transportation Management System (TTMS)
-- MySQL Query Implementation Suite (Chapter 8.4 & 8.6 Demonstrations)
-- IIIT Bhopal DBMS Project Submission
-- =====================================================================

USE ttms;

-- =====================================================================
-- SECTION 8.4: DATA MODIFICATION AND DELETION OPERATIONS
-- =====================================================================

-- 8.4.1 UPDATE: Change status of a road segment
UPDATE road_segments 
SET status = 'restricted' 
WHERE segment_id = 1;

-- 8.4.2 UPDATE: Advance incident status and verify cleared timestamp handling
UPDATE incidents
SET status = 'responding'
WHERE incident_id = 1;

-- 8.4.3 UPDATE: Shift traffic signal to adaptive mode
UPDATE traffic_signals
SET mode = 'adaptive'
WHERE signal_id = 2;

-- 8.4.4 DELETE: Remove expired alerts
DELETE FROM alerts
WHERE expires_at IS NOT NULL AND expires_at < NOW();


-- =====================================================================
-- SECTION 8.6: REQUIRED SQL QUERY CONCEPTS
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Simple SELECT queries with conditions (WHERE clause)
-- Purpose: Find all active radar sensors installed in the network.
-- ---------------------------------------------------------------------
SELECT sensor_id, segment_id, sensor_type, status, installed_on
FROM sensors
WHERE sensor_type = 'radar' AND status = 'active';

-- ---------------------------------------------------------------------
-- 2. Sorting using ORDER BY
-- Purpose: Retrieve road segments sorted by speed limit in descending order.
-- ---------------------------------------------------------------------
SELECT segment_id, name, road_class, speed_limit_kmh, lanes, status
FROM road_segments
ORDER BY speed_limit_kmh DESC, name ASC;

-- ---------------------------------------------------------------------
-- 3. Aggregate functions: COUNT, SUM, AVG, MIN, and MAX
-- Purpose: Calculate system-wide sensor and reading telemetry metrics.
-- ---------------------------------------------------------------------
SELECT 
    COUNT(reading_id) AS total_readings,
    ROUND(AVG(avg_speed_kmh), 2) AS network_avg_speed,
    MIN(avg_speed_kmh) AS lowest_recorded_speed,
    MAX(avg_speed_kmh) AS highest_recorded_speed,
    SUM(vehicle_count) AS total_cumulative_vehicles
FROM traffic_readings;

-- ---------------------------------------------------------------------
-- 4. Grouping using GROUP BY and filtering groups using HAVING
-- Purpose: Find road segments with average traffic volume exceeding 100 vehicles/hr.
-- ---------------------------------------------------------------------
SELECT 
    segment_id,
    COUNT(reading_id) AS sample_count,
    ROUND(AVG(vehicle_count), 1) AS avg_vehicle_volume,
    ROUND(AVG(avg_speed_kmh), 1) AS avg_segment_speed
FROM traffic_readings
GROUP BY segment_id
HAVING AVG(vehicle_count) > 100
ORDER BY avg_vehicle_volume DESC;

-- ---------------------------------------------------------------------
-- 5. Joins: INNER JOIN and LEFT JOIN
-- ---------------------------------------------------------------------
-- 5.a INNER JOIN: Match traffic signals to their intersection locations
SELECT 
    ts.signal_id,
    i.name AS intersection_name,
    ts.controller_model,
    ts.mode,
    ts.status
FROM traffic_signals ts
INNER JOIN intersections i ON ts.intersection_id = i.intersection_id;

-- 5.b LEFT JOIN: List road segments alongside any active incidents
SELECT 
    rs.segment_id,
    rs.name AS segment_name,
    rs.status AS road_status,
    inc.incident_id,
    inc.incident_type,
    inc.severity,
    inc.status AS incident_status
FROM road_segments rs
LEFT JOIN incidents inc ON rs.segment_id = inc.segment_id AND inc.status != 'cleared';

-- ---------------------------------------------------------------------
-- 6. Nested queries and subqueries (uncorrelated and correlated)
-- ---------------------------------------------------------------------
-- 6.a Uncorrelated subquery: Find road segments with speed limits lower than network average
SELECT segment_id, name, speed_limit_kmh
FROM road_segments
WHERE speed_limit_kmh < (
    SELECT AVG(speed_limit_kmh) FROM road_segments
);

-- 6.b Correlated subquery: Get latest recorded speed for each road segment
SELECT rs.segment_id, rs.name,
    (SELECT tr.avg_speed_kmh 
     FROM traffic_readings tr 
     WHERE tr.segment_id = rs.segment_id 
     ORDER BY tr.recorded_at DESC 
     LIMIT 1) AS latest_speed
FROM road_segments rs;

-- ---------------------------------------------------------------------
-- 7. Queries using IN, EXISTS, ANY, or ALL
-- ---------------------------------------------------------------------
-- 7.a IN: Select vehicles involved in severe traffic violations
SELECT vehicle_id, plate_number, vehicle_type, owner_name
FROM vehicles
WHERE vehicle_id IN (
    SELECT vehicle_id FROM violations WHERE fine_amount >= 1000.00
);

-- 7.b EXISTS: Find road segments that have at least one active sensor
SELECT rs.segment_id, rs.name, rs.road_class
FROM road_segments rs
WHERE EXISTS (
    SELECT 1 FROM sensors s 
    WHERE s.segment_id = rs.segment_id AND s.status = 'active'
);

-- 7.c ANY: Find violations where recorded speed exceeds ANY of the road segment limits
SELECT v.violation_id, v.recorded_speed, v.fine_amount
FROM violations v
WHERE v.recorded_speed > ANY (
    SELECT speed_limit_kmh FROM road_segments
);

-- ---------------------------------------------------------------------
-- 8. Queries involving multiple tables (3 or more tables)
-- Purpose: Complete incident dispatch view joining incidents, segments, and operators.
-- ---------------------------------------------------------------------
SELECT 
    inc.incident_id,
    inc.incident_type,
    inc.severity,
    inc.status AS incident_status,
    rs.name AS road_name,
    rs.road_class,
    u.full_name AS operator_name,
    r.name AS operator_role
FROM incidents inc
INNER JOIN road_segments rs ON inc.segment_id = rs.segment_id
LEFT JOIN users u ON inc.reported_by = u.user_id
LEFT JOIN roles r ON u.role_id = r.role_id
ORDER BY inc.severity DESC, inc.reported_at DESC;

-- ---------------------------------------------------------------------
-- 9. Meaningful business analytical queries
-- ---------------------------------------------------------------------
-- 9.a Congestion Analysis: Identify congested corridors where average speed dropped
--     more than 25% below posted speed limit
SELECT 
    rs.segment_id,
    rs.name AS corridor_name,
    rs.speed_limit_kmh AS posted_limit,
    ROUND(AVG(tr.avg_speed_kmh), 1) AS observed_avg_speed,
    ROUND(((rs.speed_limit_kmh - AVG(tr.avg_speed_kmh)) / rs.speed_limit_kmh) * 100, 1) AS speed_drop_pct
FROM road_segments rs
JOIN traffic_readings tr ON rs.segment_id = tr.segment_id
WHERE tr.recorded_at >= NOW() - INTERVAL 24 HOUR
GROUP BY rs.segment_id, rs.name, rs.speed_limit_kmh
HAVING AVG(tr.avg_speed_kmh) < (rs.speed_limit_kmh * 0.75);

-- 9.b Violation Enforcement: Revenue and violation breakdown by type
SELECT 
    violation_type,
    COUNT(violation_id) AS total_violations,
    SUM(fine_amount) AS total_fines_levied,
    ROUND(AVG(fine_amount), 2) AS avg_fine,
    SUM(CASE WHEN status = 'paid' THEN fine_amount ELSE 0 END) AS collected_revenue
FROM violations
GROUP BY violation_type
ORDER BY total_fines_levied DESC;

-- ---------------------------------------------------------------------
-- 10. Querying Views (Section 8.6.10 & 8.7)
-- ---------------------------------------------------------------------
-- 10.a Query active incident details view
SELECT incident_id, incident_type, severity, segment_name, reported_by_name
FROM v_active_incidents_detail;

-- 10.b Query road segment traffic overview view
SELECT segment_id, segment_name, road_status, current_avg_speed, current_vehicle_count
FROM v_segment_traffic_overview
ORDER BY current_avg_speed ASC;

-- 10.c Query signal and intersection status view
SELECT signal_id, intersection_name, mode, status
FROM v_signal_intersection_status;


-- =====================================================================
-- SECTION 8.7: DEMONSTRATING ADVANCED DBMS FEATURES
-- =====================================================================

-- Demonstrate Procedure: Check network health via stored procedure
CALL sp_get_network_summary(@open_inc, @avg_spd, @active_sen, @adap_sig, @tot_sig);
SELECT 
    @open_inc AS active_incidents,
    @avg_spd AS network_average_speed,
    @active_sen AS sensors_online,
    CONCAT(@adap_sig, '/', @tot_sig) AS adaptive_signal_ratio;

-- Demonstrate Trigger: Insert a new incident and verify trigger logged to activity_log
INSERT INTO incidents (segment_id, incident_type, severity, description, status, reported_by)
VALUES (1, 'breakdown', 3, 'Stranded commercial vehicle near metro pillar 45', 'reported', 2);

-- Verify that trg_after_incident_insert wrote to activity_log
SELECT activity_id, resource_type, resource_id, action, details, occurred_at
FROM activity_log
ORDER BY activity_id DESC
LIMIT 5;
