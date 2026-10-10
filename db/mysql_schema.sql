-- =====================================================================
-- Traffic & Transportation Management System (TTMS)
-- MySQL 8.0 / 8.4 Enterprise Database Schema, Views, Triggers & Procedures
-- Expanded Comprehensive Dataset (Manhattan Demonstration Network, New York)
-- Compliant with IIIT Bhopal DBMS Project Specification
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ttms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ttms;

-- Disable foreign key checks during drop & recreate
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS work_orders;
DROP TABLE IF EXISTS violations;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS traffic_readings;
DROP TABLE IF EXISTS sensors;
DROP TABLE IF EXISTS variable_message_signs;
DROP TABLE IF EXISTS traffic_signals;
DROP TABLE IF EXISTS road_segments;
DROP TABLE IF EXISTS intersections;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

DROP VIEW IF EXISTS v_active_incidents_detail;
DROP VIEW IF EXISTS v_segment_traffic_overview;
DROP VIEW IF EXISTS v_signal_intersection_status;
DROP VIEW IF EXISTS v_sensor_health_distribution;
DROP VIEW IF EXISTS v_violation_revenue_summary;

DROP PROCEDURE IF EXISTS sp_report_incident;
DROP PROCEDURE IF EXISTS sp_get_network_summary;
DROP PROCEDURE IF EXISTS sp_record_sensor_reading;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. ROLES & USERS (Access Control and Operational Actors)
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    role_id      INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(50) NOT NULL UNIQUE,
    description  TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE users (
    user_id        INT AUTO_INCREMENT PRIMARY KEY,
    role_id        INT NOT NULL,
    full_name      VARCHAR(120) NOT NULL,
    email          VARCHAR(160) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. ROAD NETWORK TOPOLOGY (Intersections and Road Segments)
-- ---------------------------------------------------------------------
CREATE TABLE intersections (
    intersection_id  INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    location         POINT NOT NULL SRID 4326,
    has_signal       BOOLEAN NOT NULL DEFAULT FALSE,
    SPATIAL INDEX idx_intersections_location (location)
) ENGINE=InnoDB;

CREATE TABLE road_segments (
    segment_id          INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    road_class          ENUM('highway', 'arterial', 'collector', 'local') NOT NULL,
    from_intersection   INT NULL,
    to_intersection     INT NULL,
    geometry            LINESTRING NOT NULL SRID 4326,
    length_m            DECIMAL(10,2) NULL CHECK (length_m > 0),
    lanes               SMALLINT NOT NULL DEFAULT 2 CHECK (lanes > 0),
    speed_limit_kmh     SMALLINT NULL CHECK (speed_limit_kmh > 0),
    is_one_way          BOOLEAN NOT NULL DEFAULT FALSE,
    status              ENUM('open', 'restricted', 'closed') NOT NULL DEFAULT 'open',
    CONSTRAINT fk_segment_from
        FOREIGN KEY (from_intersection) REFERENCES intersections(intersection_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_segment_to
        FOREIGN KEY (to_intersection) REFERENCES intersections(intersection_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    SPATIAL INDEX idx_segments_geometry (geometry)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. TRAFFIC SIGNALS & VARIABLE MESSAGE SIGNS (VMS)
-- ---------------------------------------------------------------------
CREATE TABLE traffic_signals (
    signal_id        INT AUTO_INCREMENT PRIMARY KEY,
    intersection_id  INT NOT NULL,
    controller_model VARCHAR(80) NULL,
    mode             ENUM('fixed', 'adaptive', 'flash', 'manual', 'off') NOT NULL DEFAULT 'fixed',
    status           ENUM('online', 'offline', 'fault') NOT NULL DEFAULT 'online',
    installed_on     DATE NULL,
    CONSTRAINT fk_signals_intersection
        FOREIGN KEY (intersection_id) REFERENCES intersections(intersection_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE variable_message_signs (
    vms_id       INT AUTO_INCREMENT PRIMARY KEY,
    segment_id   INT NULL,
    location     POINT NOT NULL SRID 4326,
    current_text VARCHAR(255) NULL,
    updated_at   DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vms_segment
        FOREIGN KEY (segment_id) REFERENCES road_segments(segment_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    SPATIAL INDEX idx_vms_location (location)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. SENSORS & REAL-TIME TELEMETRY READINGS
-- ---------------------------------------------------------------------
CREATE TABLE sensors (
    sensor_id    INT AUTO_INCREMENT PRIMARY KEY,
    segment_id   INT NULL,
    sensor_type  ENUM('loop', 'camera', 'radar', 'lidar', 'bluetooth', 'anpr') NOT NULL,
    location     POINT NOT NULL SRID 4326,
    status       ENUM('active', 'inactive', 'faulty') NOT NULL DEFAULT 'active',
    installed_on DATE NULL,
    last_seen_at DATETIME NULL,
    CONSTRAINT fk_sensors_segment
        FOREIGN KEY (segment_id) REFERENCES road_segments(segment_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    SPATIAL INDEX idx_sensors_location (location)
) ENGINE=InnoDB;

CREATE TABLE traffic_readings (
    reading_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id      INT NOT NULL,
    segment_id     INT NOT NULL,
    recorded_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vehicle_count  INT NULL CHECK (vehicle_count >= 0),
    avg_speed_kmh  DECIMAL(5,1) NULL CHECK (avg_speed_kmh >= 0),
    occupancy_pct  DECIMAL(5,2) NULL CHECK (occupancy_pct BETWEEN 0 AND 100),
    congestion_lvl TINYINT NULL CHECK (congestion_lvl BETWEEN 0 AND 5),
    CONSTRAINT fk_readings_sensor
        FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_readings_segment
        FOREIGN KEY (segment_id) REFERENCES road_segments(segment_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_readings_segment_time (segment_id, recorded_at DESC)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. INCIDENTS AND PUBLIC ALERTS
-- ---------------------------------------------------------------------
CREATE TABLE incidents (
    incident_id   INT AUTO_INCREMENT PRIMARY KEY,
    segment_id    INT NULL,
    incident_type ENUM('accident', 'breakdown', 'roadwork', 'weather', 'event', 'obstruction') NOT NULL,
    severity      TINYINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
    location      POINT NULL SRID 4326,
    description   TEXT NULL,
    status        ENUM('reported', 'verified', 'responding', 'cleared') NOT NULL DEFAULT 'reported',
    reported_by   INT NULL,
    reported_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cleared_at    DATETIME NULL,
    CONSTRAINT fk_incidents_segment
        FOREIGN KEY (segment_id) REFERENCES road_segments(segment_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_incidents_reported_by
        FOREIGN KEY (reported_by) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_incidents_status (status, reported_at DESC)
) ENGINE=InnoDB;

CREATE TABLE alerts (
    alert_id     INT AUTO_INCREMENT PRIMARY KEY,
    incident_id  INT NULL,
    segment_id   INT NULL,
    alert_type   VARCHAR(30) NOT NULL,
    message      TEXT NOT NULL,
    channel      ENUM('dashboard', 'vms', 'sms', 'app', 'email') NOT NULL DEFAULT 'dashboard',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME NULL,
    CONSTRAINT fk_alerts_incident
        FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_segment
        FOREIGN KEY (segment_id) REFERENCES road_segments(segment_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. VEHICLES AND TRAFFIC VIOLATIONS
-- ---------------------------------------------------------------------
CREATE TABLE vehicles (
    vehicle_id    INT AUTO_INCREMENT PRIMARY KEY,
    plate_number  VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type  ENUM('car', 'motorcycle', 'bus', 'truck', 'emergency', 'other') NOT NULL,
    make          VARCHAR(60) NULL,
    model         VARCHAR(60) NULL,
    owner_name    VARCHAR(120) NULL,
    is_fleet      BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE violations (
    violation_id    INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id      INT NOT NULL,
    sensor_id       INT NULL,
    violation_type  ENUM('speeding', 'red_light', 'illegal_parking', 'wrong_way', 'other') NOT NULL,
    recorded_speed  DECIMAL(5,1) NULL,
    fine_amount     DECIMAL(10,2) NOT NULL DEFAULT 500.00 CHECK (fine_amount >= 0),
    status          ENUM('pending', 'issued', 'paid', 'disputed', 'dismissed') NOT NULL DEFAULT 'pending',
    occurred_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_violations_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_violations_sensor
        FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. MAINTENANCE WORK ORDERS
-- ---------------------------------------------------------------------
CREATE TABLE work_orders (
    work_order_id  INT AUTO_INCREMENT PRIMARY KEY,
    asset_type     ENUM('signal', 'sensor', 'vms', 'road_segment') NOT NULL,
    asset_id       INT NOT NULL,
    assigned_to    INT NULL,
    priority       TINYINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    description    TEXT NULL,
    status         ENUM('open', 'in_progress', 'done', 'cancelled') NOT NULL DEFAULT 'open',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at   DATETIME NULL,
    CONSTRAINT fk_work_orders_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. AUDIT & ACTIVITY LOG TABLE
-- ---------------------------------------------------------------------
CREATE TABLE activity_log (
    activity_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_type VARCHAR(30) NOT NULL,
    resource_id   INT NULL,
    action        VARCHAR(40) NOT NULL,
    details       TEXT NOT NULL,
    occurred_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_log_time (occurred_at DESC)
) ENGINE=InnoDB;


-- =====================================================================
-- ADVANCED DBMS FEATURES: VIEWS (PDF Chapter 8.7)
-- =====================================================================

-- View 1: Active incidents with road segment details and operator info
CREATE VIEW v_active_incidents_detail AS
SELECT 
    i.incident_id,
    i.incident_type,
    i.severity,
    i.description,
    i.status,
    i.reported_at,
    rs.segment_id,
    rs.name AS segment_name,
    rs.road_class,
    ST_AsGeoJSON(i.location) AS incident_geojson,
    COALESCE(u.full_name, 'System / Automated') AS reported_by_name
FROM incidents i
LEFT JOIN road_segments rs ON i.segment_id = rs.segment_id
LEFT JOIN users u ON i.reported_by = u.user_id
WHERE i.status != 'cleared';

-- View 2: Road segment overview with latest traffic speed and congestion
CREATE VIEW v_segment_traffic_overview AS
SELECT 
    rs.segment_id,
    rs.name AS segment_name,
    rs.road_class,
    rs.speed_limit_kmh,
    rs.lanes,
    rs.status AS road_status,
    latest.avg_speed_kmh AS current_avg_speed,
    latest.vehicle_count AS current_vehicle_count,
    latest.congestion_lvl,
    latest.recorded_at AS last_reading_time
FROM road_segments rs
LEFT JOIN (
    SELECT tr1.segment_id, tr1.avg_speed_kmh, tr1.vehicle_count, tr1.congestion_lvl, tr1.recorded_at
    FROM traffic_readings tr1
    INNER JOIN (
        SELECT segment_id, MAX(recorded_at) AS max_time
        FROM traffic_readings
        GROUP BY segment_id
    ) tr2 ON tr1.segment_id = tr2.segment_id AND tr1.recorded_at = tr2.max_time
) latest ON rs.segment_id = latest.segment_id;

-- View 3: Traffic signals joined with intersection details
CREATE VIEW v_signal_intersection_status AS
SELECT 
    ts.signal_id,
    ts.intersection_id,
    i.name AS intersection_name,
    ts.mode,
    ts.status,
    ts.controller_model,
    ST_AsGeoJSON(i.location) AS intersection_geojson
FROM traffic_signals ts
JOIN intersections i ON ts.intersection_id = i.intersection_id;

-- View 4: Sensor health distribution
CREATE VIEW v_sensor_health_distribution AS
SELECT 
    sensor_type,
    status,
    COUNT(*) AS sensor_count
FROM sensors
GROUP BY sensor_type, status;

-- View 5: Violation revenue and payment collection summary
CREATE VIEW v_violation_revenue_summary AS
SELECT 
    violation_type,
    COUNT(*) AS total_count,
    SUM(fine_amount) AS total_fines,
    SUM(CASE WHEN status = 'paid' THEN fine_amount ELSE 0 END) AS collected_revenue,
    SUM(CASE WHEN status = 'pending' THEN fine_amount ELSE 0 END) AS pending_revenue
FROM violations
GROUP BY violation_type;


-- =====================================================================
-- ADVANCED DBMS FEATURES: TRIGGERS (PDF Chapter 8.7)
-- =====================================================================

DELIMITER $$

-- Trigger 1: Automatically log new incident reporting to activity_log
CREATE TRIGGER trg_after_incident_insert
AFTER INSERT ON incidents
FOR EACH ROW
BEGIN
    INSERT INTO activity_log (resource_type, resource_id, action, details, occurred_at)
    VALUES (
        'incident',
        NEW.incident_id,
        'created',
        CONCAT('Reported ', NEW.incident_type, ' (severity: ', NEW.severity, ') on segment #', COALESCE(NEW.segment_id, 0)),
        NOW()
    );
END$$

-- Trigger 2: Automatically log incident status changes & handle cleared timestamp
CREATE TRIGGER trg_after_incident_update
AFTER UPDATE ON incidents
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_log (resource_type, resource_id, action, details, occurred_at)
        VALUES (
            'incident',
            NEW.incident_id,
            'status_changed',
            CONCAT('Incident #', NEW.incident_id, ' status changed from ', OLD.status, ' to ', NEW.status),
            NOW()
        );
    END IF;
END$$

-- Trigger 3: Automatically log road segment status modifications
CREATE TRIGGER trg_after_segment_status_update
AFTER UPDATE ON road_segments
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_log (resource_type, resource_id, action, details, occurred_at)
        VALUES (
            'road_segment',
            NEW.segment_id,
            'status_changed',
            CONCAT('Road status for "', NEW.name, '" changed from ', OLD.status, ' to ', NEW.status),
            NOW()
        );
    END IF;
END$$

-- Trigger 4: Automatically log signal mode changes
CREATE TRIGGER trg_after_signal_mode_update
AFTER UPDATE ON traffic_signals
FOR EACH ROW
BEGIN
    IF OLD.mode != NEW.mode THEN
        INSERT INTO activity_log (resource_type, resource_id, action, details, occurred_at)
        VALUES (
            'signal',
            NEW.signal_id,
            'mode_changed',
            CONCAT('Signal #', NEW.signal_id, ' mode changed from ', OLD.mode, ' to ', NEW.mode),
            NOW()
        );
    END IF;
END$$

-- Trigger 5: Audit new violation tickets
CREATE TRIGGER trg_after_violation_insert
AFTER INSERT ON violations
FOR EACH ROW
BEGIN
    INSERT INTO activity_log (resource_type, resource_id, action, details, occurred_at)
    VALUES (
        'violation',
        NEW.violation_id,
        'ticket_issued',
        CONCAT('Violation #', NEW.violation_id, ' (', NEW.violation_type, ') logged for Vehicle ID #', NEW.vehicle_id, ' - Fine: INR ', NEW.fine_amount),
        NOW()
    );
END$$

-- =====================================================================
-- ADVANCED DBMS FEATURES: STORED PROCEDURES (PDF Chapter 8.7)
-- =====================================================================

-- Procedure 1: Safe transactional incident reporting
CREATE PROCEDURE sp_report_incident (
    IN p_segment_id INT,
    IN p_incident_type VARCHAR(30),
    IN p_severity TINYINT,
    IN p_description TEXT,
    IN p_lng DOUBLE,
    IN p_lat DOUBLE,
    IN p_reported_by INT,
    OUT p_incident_id INT
)
BEGIN
    DECLARE v_point POINT;
    IF p_lng IS NOT NULL AND p_lat IS NOT NULL THEN
        SET v_point = ST_GeomFromText(CONCAT('POINT(', p_lng, ' ', p_lat, ')'), 4326, 'axis-order=long-lat');
    ELSE
        SET v_point = NULL;
    END IF;

    INSERT INTO incidents (segment_id, incident_type, severity, location, description, reported_by, status, reported_at)
    VALUES (p_segment_id, p_incident_type, p_severity, v_point, p_description, p_reported_by, 'reported', NOW());

    SET p_incident_id = LAST_INSERT_ID();
END$$

-- Procedure 2: Compute real-time network KPI metrics
CREATE PROCEDURE sp_get_network_summary (
    OUT p_open_incidents INT,
    OUT p_avg_speed DECIMAL(5,1),
    OUT p_active_sensors INT,
    OUT p_adaptive_signals INT,
    OUT p_total_signals INT
)
BEGIN
    SELECT COUNT(*) INTO p_open_incidents FROM incidents WHERE status != 'cleared';
    
    SELECT ROUND(AVG(latest.avg_speed_kmh), 1) INTO p_avg_speed
    FROM (
        SELECT tr.avg_speed_kmh
        FROM traffic_readings tr
        INNER JOIN (
            SELECT segment_id, MAX(recorded_at) AS max_time
            FROM traffic_readings
            GROUP BY segment_id
        ) m ON tr.segment_id = m.segment_id AND tr.recorded_at = m.max_time
        WHERE tr.avg_speed_kmh IS NOT NULL
    ) latest;

    SELECT COUNT(*) INTO p_active_sensors FROM sensors WHERE status = 'active';
    SELECT COUNT(*) INTO p_adaptive_signals FROM traffic_signals WHERE mode = 'adaptive';
    SELECT COUNT(*) INTO p_total_signals FROM traffic_signals;
END$$

DELIMITER ;


-- =====================================================================
-- EXTENSIVE SEED DATA (Manhattan City Transport Grid, New York (demo))
-- 8 Intersections, 8 Road Corridors, 8 Signals, 12 Sensors, 6 Incidents,
-- 10 Vehicles, 8 Violations, 4 VMS Signs, 6 Work Orders, 24h Telemetry
-- =====================================================================

-- 1. Roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access and infrastructure management'),
  ('operator', 'Control room operations, signal timing and incident dispatch'),
  ('enforcement', 'Traffic police enforcement and violation adjudication'),
  ('viewer', 'Read-only monitoring dashboard access');

-- 2. Users
INSERT INTO users (role_id, full_name, email, password_hash, is_active) VALUES
  (1, 'Chief Engineer Verma', 'admin@ttms.local', 'sha256$mockhash$admin123', TRUE),
  (2, 'Senior Operator Sharma', 'operator.sharma@ttms.local', 'sha256$mockhash$oper123', TRUE),
  (2, 'Dispatch Officer Kapoor', 'operator.kapoor@ttms.local', 'sha256$mockhash$oper456', TRUE),
  (3, 'Traffic Inspector Yadav', 'inspector.yadav@ttms.local', 'sha256$mockhash$enf123', TRUE),
  (4, 'City Viewer Demo', 'viewer@ttms.local', 'sha256$mockhash$view123', TRUE);

-- 3. Intersections (8 Major Manhattan Demo Junctions)
INSERT INTO intersections (name, location, has_signal) VALUES
  ('Times Square Junction (demo)', ST_GeomFromText('POINT(-73.986270 40.757910)', 4326, 'axis-order=long-lat'), TRUE),
  ('Bryant Park Junction (demo)', ST_GeomFromText('POINT(-73.982792 40.760410)', 4326, 'axis-order=long-lat'), TRUE),
  ('West Midtown Junction (demo)', ST_GeomFromText('POINT(-73.989400 40.760810)', 4326, 'axis-order=long-lat'), FALSE),
  ('Herald Square Crossing (demo)', ST_GeomFromText('POINT(-73.978388 40.754110)', 4326, 'axis-order=long-lat'), TRUE),
  ('Rockefeller Center Circle (demo)', ST_GeomFromText('POINT(-73.996355 40.763610)', 4326, 'axis-order=long-lat'), TRUE),
  ('West Side Connector Junction (demo)', ST_GeomFromText('POINT(-74.004469 40.766610)', 4326, 'axis-order=long-lat'), TRUE),
  ('Grand Central Market Square (demo)', ST_GeomFromText('POINT(-73.974330 40.747610)', 4326, 'axis-order=long-lat'), TRUE),
  ('East Midtown Link Junction (demo)', ST_GeomFromText('POINT(-73.966216 40.742610)', 4326, 'axis-order=long-lat'), TRUE);

-- 4. Road Segments (8 Interconnected Corridors)
INSERT INTO road_segments (name, road_class, from_intersection, to_intersection, geometry, length_m, lanes, speed_limit_kmh, status) VALUES
  ('Midtown West Corridor (demo)', 'arterial', 1, 2, ST_GeomFromText('LINESTRING(-73.986270 40.757910, -73.984531 40.759010, -73.982792 40.760410)', 4326, 'axis-order=long-lat'), 420.00, 3, 40, 'open'),
  ('Times Square Connector (demo)', 'collector', 2, 3, ST_GeomFromText('LINESTRING(-73.982792 40.760410, -73.985343 40.762110, -73.989400 40.760810)', 4326, 'axis-order=long-lat'), 380.00, 2, 30, 'restricted'),
  ('Broadway Midtown Arterial (demo)', 'arterial', 4, 1, ST_GeomFromText('LINESTRING(-73.978388 40.754110, -73.981865 40.755810, -73.986270 40.757910)', 4326, 'axis-order=long-lat'), 850.00, 4, 50, 'open'),
  ('Bryant Park Connector (demo)', 'collector', 3, 5, ST_GeomFromText('LINESTRING(-73.989400 40.760810, -73.992877 40.762110, -73.996355 40.763610)', 4326, 'axis-order=long-lat'), 620.00, 2, 35, 'open'),
  ('Hudson River Parkway Feeder (demo)', 'highway', 5, 6, ST_GeomFromText('LINESTRING(-73.996355 40.763610, -74.000412 40.765110, -74.004469 40.766610)', 4326, 'axis-order=long-lat'), 1200.00, 6, 70, 'open'),
  ('Fifth Avenue Central Corridor (demo)', 'arterial', 4, 7, ST_GeomFromText('LINESTRING(-73.978388 40.754110, -73.976649 40.751110, -73.974330 40.747610)', 4326, 'axis-order=long-lat'), 780.00, 3, 45, 'open'),
  ('East Midtown Arterial (demo)', 'highway', 7, 8, ST_GeomFromText('LINESTRING(-73.974330 40.747610, -73.970273 40.745110, -73.966216 40.742610)', 4326, 'axis-order=long-lat'), 1450.00, 6, 80, 'open'),
  ('West Side Bypass (demo)', 'collector', 6, 3, ST_GeomFromText('LINESTRING(-74.004469 40.766610, -73.996934 40.764110, -73.989400 40.760810)', 4326, 'axis-order=long-lat'), 910.00, 2, 40, 'restricted');

-- 5. Traffic Signals
INSERT INTO traffic_signals (intersection_id, controller_model, mode, status, installed_on) VALUES
  (1, 'ATC-2070', 'adaptive', 'online', '2023-01-15'),
  (2, 'ATC-2070', 'fixed', 'online', '2023-03-22'),
  (4, 'Econolite Cobalt', 'adaptive', 'online', '2023-04-10'),
  (5, 'Siemens Sitraffic', 'adaptive', 'online', '2023-05-18'),
  (6, 'Econolite Cobalt', 'fixed', 'online', '2023-07-02'),
  (7, 'ATC-2070', 'flash', 'fault', '2023-08-11'),
  (8, 'Siemens Sitraffic', 'adaptive', 'online', '2023-09-05');

-- 6. Variable Message Signs (VMS)
INSERT INTO variable_message_signs (segment_id, location, current_text) VALUES
  (1, ST_GeomFromText('POINT(-73.985343 40.758610)', 4326, 'axis-order=long-lat'), 'METRO CORRIDOR: SMOOTH FLOW - SPEED LIMIT 40 KM/H'),
  (2, ST_GeomFromText('POINT(-73.984183 40.761110)', 4326, 'axis-order=long-lat'), 'CAUTION: ROADWORK AHEAD IN LANE 2 - DRIVE SLOW'),
  (5, ST_GeomFromText('POINT(-73.999832 40.764610)', 4326, 'axis-order=long-lat'), 'EXPRESSWAY APPROACH: CLEAR - WEAR SEATBELT'),
  (7, ST_GeomFromText('POINT(-73.971433 40.746110)', 4326, 'axis-order=long-lat'), 'AIRPORT LINK: HEAVY MONSOON TRAFFIC EXPECTED');

-- 7. Sensors (12 Sensors across categories)
INSERT INTO sensors (segment_id, sensor_type, location, status, installed_on, last_seen_at) VALUES
  (1, 'radar', ST_GeomFromText('POINT(-73.984531 40.759010)', 4326, 'axis-order=long-lat'), 'active', '2023-05-10', NOW()),
  (2, 'camera', ST_GeomFromText('POINT(-73.985343 40.762110)', 4326, 'axis-order=long-lat'), 'active', '2023-06-18', NOW()),
  (3, 'loop', ST_GeomFromText('POINT(-73.982445 40.756110)', 4326, 'axis-order=long-lat'), 'active', '2023-07-20', NOW()),
  (4, 'radar', ST_GeomFromText('POINT(-73.992877 40.762110)', 4326, 'axis-order=long-lat'), 'active', '2023-08-15', NOW()),
  (5, 'camera', ST_GeomFromText('POINT(-74.000412 40.765110)', 4326, 'axis-order=long-lat'), 'active', '2023-09-01', NOW()),
  (5, 'anpr', ST_GeomFromText('POINT(-74.003310 40.766110)', 4326, 'axis-order=long-lat'), 'active', '2023-09-01', NOW()),
  (6, 'loop', ST_GeomFromText('POINT(-73.976069 40.749610)', 4326, 'axis-order=long-lat'), 'active', '2023-10-12', NOW()),
  (7, 'radar', ST_GeomFromText('POINT(-73.969694 40.744610)', 4326, 'axis-order=long-lat'), 'active', '2023-11-05', NOW()),
  (7, 'anpr', ST_GeomFromText('POINT(-73.967375 40.743110)', 4326, 'axis-order=long-lat'), 'active', '2023-11-05', NOW()),
  (8, 'camera', ST_GeomFromText('POINT(-73.996355 40.763610)', 4326, 'axis-order=long-lat'), 'faulty', '2023-12-01', NOW()),
  (3, 'anpr', ST_GeomFromText('POINT(-73.980126 40.755110)', 4326, 'axis-order=long-lat'), 'active', '2024-01-10', NOW()),
  (6, 'radar', ST_GeomFromText('POINT(-73.974910 40.748410)', 4326, 'axis-order=long-lat'), 'inactive', '2024-02-15', NOW());

-- 8. Incidents (6 Incidents of various types & severities)
INSERT INTO incidents (segment_id, incident_type, severity, location, description, status, reported_by, reported_at) VALUES
  (2, 'roadwork', 2, ST_GeomFromText('POINT(-73.985343 40.762110)', 4326, 'axis-order=long-lat'), 'Demo lane closure near Times Square', 'responding', 2, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (1, 'breakdown', 2, ST_GeomFromText('POINT(-73.984183 40.759210)', 4326, 'axis-order=long-lat'), 'Stranded commercial vehicle on left shoulder', 'verified', 2, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
  (5, 'speeding', 4, ST_GeomFromText('POINT(-74.002151 40.765810)', 4326, 'axis-order=long-lat'), 'Multi-vehicle collision near expressway ramp', 'reported', 3, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
  (7, 'weather', 3, ST_GeomFromText('POINT(-73.970853 40.745410)', 4326, 'axis-order=long-lat'), 'Waterlogging on outer airport feeder lane', 'verified', 2, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
  (8, 'obstruction', 1, ST_GeomFromText('POINT(-73.995196 40.763110)', 4326, 'axis-order=long-lat'), 'Fallen tree branch cleared from sidewalk', 'cleared', 2, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
  (3, 'accident', 4, ST_GeomFromText('POINT(-73.981286 40.755610)', 4326, 'axis-order=long-lat'), 'Minor rear-end collision between two sedans', 'cleared', 3, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 9. Vehicles (10 Registered Vehicles)
INSERT INTO vehicles (plate_number, vehicle_type, make, model, owner_name, is_fleet) VALUES
  ('DL-01-AB-1234', 'car', 'Maruti Suzuki', 'Swift', 'Ramesh Kumar', FALSE),
  ('DL-09-CD-5678', 'bus', 'Tata', 'Starbus (DTC)', 'Demo Transit Operator', TRUE),
  ('HR-26-EF-9012', 'truck', 'Ashok Leyland', 'Ecomet', 'Northern Logistics', TRUE),
  ('DL-03-GH-3456', 'car', 'Hyundai', 'Creta', 'Pooja Verma', FALSE),
  ('DL-04-IJ-7890', 'motorcycle', 'Hero', 'Splendor', 'Anil Sharma', FALSE),
  ('UP-16-KL-2345', 'truck', 'BharatBenz', '2823R', 'Express Trans', TRUE),
  ('DL-01-MN-6789', 'car', 'Honda', 'City', 'Vikram Malhotra', FALSE),
  ('DL-02-OP-0123', 'emergency', 'Force', 'Traveller Ambulance', 'Demo Emergency Services', TRUE),
  ('HR-55-QR-4567', 'car', 'Mahindra', 'Scorpio', 'Deepak Hooda', FALSE),
  ('DL-08-ST-8901', 'bus', 'Eicher', 'Starline', 'Midtown School Bus Demo', TRUE);

-- 10. Traffic Violations (8 Violations with Fines)
INSERT INTO violations (vehicle_id, sensor_id, violation_type, recorded_speed, fine_amount, status, occurred_at) VALUES
  (1, 1, 'speeding', 58.5, 1000.00, 'issued', DATE_SUB(NOW(), INTERVAL 1 DAY)),
  (3, 2, 'red_light', 0.0, 1500.00, 'pending', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (4, 5, 'speeding', 92.0, 2000.00, 'paid', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (5, 6, 'red_light', 0.0, 1000.00, 'pending', DATE_SUB(NOW(), INTERVAL 8 HOUR)),
  (6, 6, 'speeding', 84.0, 2000.00, 'disputed', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
  (7, 8, 'speeding', 105.0, 2500.00, 'issued', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
  (9, 1, 'illegal_parking', 0.0, 500.00, 'paid', DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (1, 9, 'wrong_way', 25.0, 1500.00, 'pending', DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- 11. Work Orders (6 Maintenance Orders)
INSERT INTO work_orders (asset_type, asset_id, assigned_to, priority, description, status, created_at) VALUES
  ('signal', 6, 2, 1, 'Controller board communication failure at Sector 10', 'in_progress', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
  ('sensor', 10, 2, 2, 'Optical camera lens calibration required at Sector 14 overpass', 'open', DATE_SUB(NOW(), INTERVAL 1 DAY)),
  ('vms', 4, 3, 3, 'Firmware update for Airport Express VMS panel', 'done', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  ('road_segment', 2, 2, 2, 'Pothole patch repair verification after monsoon rain', 'open', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  ('signal', 1, 3, 4, 'Annual preventive maintenance for ATC-2070 controller', 'done', DATE_SUB(NOW(), INTERVAL 5 DAY)),
  ('sensor', 12, 2, 3, 'Power supply line check on Sector 10 radar unit', 'open', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 12. Current Traffic Telemetry Snapshot (8 Segments)
INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl) VALUES
  (1, 1, NOW(), 210, 42.5, 34.00, 1),
  (2, 2, NOW(), 95, 26.0, 68.00, 3),
  (3, 3, NOW(), 340, 48.0, 42.00, 1),
  (4, 4, NOW(), 160, 33.5, 38.00, 1),
  (5, 5, NOW(), 520, 64.0, 52.00, 2),
  (7, 6, NOW(), 280, 38.0, 48.00, 2),
  (8, 7, NOW(), 640, 74.5, 58.00, 2),
  (10, 8, NOW(), 110, 29.0, 72.00, 4);

-- 13. Comprehensive 24-Hour Historical Readings for All 8 Segments
-- Populates the multi-series line graph and congestion charts
INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
SELECT 1, 1, DATE_SUB(NOW(), INTERVAL n HOUR),
       ROUND(210 + 40 * SIN(n / 2.0)),
       ROUND(42.5 + 7.0 * COS(n / 3.0), 1),
       ROUND(34.0 + 8.0 * SIN(n), 2), 1
FROM (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
      UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) h;

INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
SELECT 2, 2, DATE_SUB(NOW(), INTERVAL n HOUR),
       ROUND(95 + 25 * SIN(n / 2.5)),
       ROUND(26.0 + 5.0 * COS(n / 2.0), 1),
       ROUND(68.0 + 10.0 * SIN(n), 2), 3
FROM (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
      UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) h;

INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
SELECT 3, 3, DATE_SUB(NOW(), INTERVAL n HOUR),
       ROUND(340 + 60 * SIN(n / 2.2)),
       ROUND(48.0 + 6.5 * COS(n / 2.8), 1),
       ROUND(42.0 + 7.5 * SIN(n), 2), 1
FROM (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
      UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) h;

INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
SELECT 4, 4, DATE_SUB(NOW(), INTERVAL n HOUR),
       ROUND(160 + 35 * SIN(n / 3.0)),
       ROUND(33.5 + 4.5 * COS(n / 2.5), 1),
       ROUND(38.0 + 6.0 * SIN(n), 2), 1
FROM (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
      UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) h;

INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
SELECT 5, 5, DATE_SUB(NOW(), INTERVAL n HOUR),
       ROUND(520 + 90 * SIN(n / 1.8)),
       ROUND(64.0 + 10.0 * COS(n / 3.2), 1),
       ROUND(52.0 + 11.0 * SIN(n), 2), 2
FROM (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
      UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) h;

INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
SELECT 7, 6, DATE_SUB(NOW(), INTERVAL n HOUR),
       ROUND(280 + 50 * SIN(n / 2.1)),
       ROUND(38.0 + 6.0 * COS(n / 2.7), 1),
       ROUND(48.0 + 8.5 * SIN(n), 2), 2
FROM (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
      UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) h;

INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
SELECT 8, 7, DATE_SUB(NOW(), INTERVAL n HOUR),
       ROUND(640 + 110 * SIN(n / 1.7)),
       ROUND(74.5 + 11.5 * COS(n / 3.5), 1),
       ROUND(58.0 + 12.0 * SIN(n), 2), 2
FROM (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
      UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) h;

INSERT INTO traffic_readings (sensor_id, segment_id, recorded_at, vehicle_count, avg_speed_kmh, occupancy_pct, congestion_lvl)
SELECT 10, 8, DATE_SUB(NOW(), INTERVAL n HOUR),
       ROUND(110 + 30 * SIN(n / 2.6)),
       ROUND(29.0 + 4.5 * COS(n / 2.2), 1),
       ROUND(72.0 + 12.0 * SIN(n), 2), 4
FROM (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
      UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
      UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18
      UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23) h;
