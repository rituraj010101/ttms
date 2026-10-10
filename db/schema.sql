-- =====================================================================
-- Traffic & Transportation Management System (TTMS) - Database Schema
-- PostgreSQL 14+ with PostGIS
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE roles (
    role_id      SERIAL PRIMARY KEY,
    name         VARCHAR(50) UNIQUE NOT NULL,
    description  TEXT
);

CREATE TABLE users (
    user_id        SERIAL PRIMARY KEY,
    role_id        INT NOT NULL REFERENCES roles(role_id),
    full_name      VARCHAR(120) NOT NULL,
    email          VARCHAR(160) UNIQUE NOT NULL,
    password_hash  TEXT NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE intersections (
    intersection_id  SERIAL PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    location         GEOGRAPHY(POINT, 4326) NOT NULL,
    has_signal       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE road_segments (
    segment_id          SERIAL PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    road_class          VARCHAR(20) NOT NULL
                        CHECK (road_class IN ('highway','arterial','collector','local')),
    from_intersection   INT REFERENCES intersections(intersection_id),
    to_intersection     INT REFERENCES intersections(intersection_id),
    geometry            GEOGRAPHY(LINESTRING, 4326) NOT NULL,
    length_m            NUMERIC(10,2),
    lanes               SMALLINT NOT NULL DEFAULT 2,
    speed_limit_kmh     SMALLINT,
    is_one_way          BOOLEAN NOT NULL DEFAULT FALSE,
    status              VARCHAR(20) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','restricted','closed'))
);
CREATE INDEX idx_segments_geom ON road_segments USING GIST (geometry);

CREATE TABLE traffic_signals (
    signal_id        SERIAL PRIMARY KEY,
    intersection_id  INT NOT NULL REFERENCES intersections(intersection_id),
    controller_model VARCHAR(80),
    mode             VARCHAR(20) NOT NULL DEFAULT 'fixed'
                     CHECK (mode IN ('fixed','adaptive','flash','manual','off')),
    status           VARCHAR(20) NOT NULL DEFAULT 'online'
                     CHECK (status IN ('online','offline','fault')),
    installed_on     DATE
);

CREATE TABLE variable_message_signs (
    vms_id       SERIAL PRIMARY KEY,
    segment_id   INT REFERENCES road_segments(segment_id),
    location     GEOGRAPHY(POINT, 4326) NOT NULL,
    current_text VARCHAR(255),
    updated_at   TIMESTAMPTZ
);

CREATE TABLE sensors (
    sensor_id    SERIAL PRIMARY KEY,
    segment_id   INT REFERENCES road_segments(segment_id),
    sensor_type  VARCHAR(20) NOT NULL
                 CHECK (sensor_type IN ('loop','camera','radar','lidar','bluetooth','anpr')),
    location     GEOGRAPHY(POINT, 4326) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','inactive','faulty')),
    installed_on DATE,
    last_seen_at TIMESTAMPTZ
);

CREATE TABLE traffic_readings (
    reading_id     BIGSERIAL,
    sensor_id      INT NOT NULL REFERENCES sensors(sensor_id),
    segment_id     INT NOT NULL REFERENCES road_segments(segment_id),
    recorded_at    TIMESTAMPTZ NOT NULL,
    vehicle_count  INT,
    avg_speed_kmh  NUMERIC(5,1),
    occupancy_pct  NUMERIC(5,2),
    congestion_lvl SMALLINT CHECK (congestion_lvl BETWEEN 0 AND 5),
    PRIMARY KEY (reading_id, recorded_at)
) PARTITION BY RANGE (recorded_at);

CREATE TABLE traffic_readings_default PARTITION OF traffic_readings DEFAULT;
CREATE INDEX idx_readings_segment_time ON traffic_readings (segment_id, recorded_at DESC);

CREATE TABLE vehicles (
    vehicle_id    SERIAL PRIMARY KEY,
    plate_number  VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type  VARCHAR(20) NOT NULL
                  CHECK (vehicle_type IN ('car','motorcycle','bus','truck','emergency','other')),
    make          VARCHAR(60),
    model         VARCHAR(60),
    owner_name    VARCHAR(120),
    is_fleet      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE incidents (
    incident_id   SERIAL PRIMARY KEY,
    segment_id    INT REFERENCES road_segments(segment_id),
    incident_type VARCHAR(30) NOT NULL
                  CHECK (incident_type IN ('accident','breakdown','roadwork','weather','event','obstruction')),
    severity      SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
    location      GEOGRAPHY(POINT, 4326),
    description   TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'reported'
                  CHECK (status IN ('reported','verified','responding','cleared')),
    reported_by   INT REFERENCES users(user_id),
    reported_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    cleared_at    TIMESTAMPTZ
);
CREATE INDEX idx_incidents_status ON incidents (status, reported_at DESC);

CREATE TABLE alerts (
    alert_id     SERIAL PRIMARY KEY,
    incident_id  INT REFERENCES incidents(incident_id),
    segment_id   INT REFERENCES road_segments(segment_id),
    alert_type   VARCHAR(30) NOT NULL,
    message      TEXT NOT NULL,
    channel      VARCHAR(20) NOT NULL DEFAULT 'dashboard'
                 CHECK (channel IN ('dashboard','vms','sms','app','email')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at   TIMESTAMPTZ
);

CREATE TABLE violations (
    violation_id    SERIAL PRIMARY KEY,
    vehicle_id      INT NOT NULL REFERENCES vehicles(vehicle_id),
    sensor_id       INT REFERENCES sensors(sensor_id),
    violation_type  VARCHAR(30) NOT NULL
                    CHECK (violation_type IN ('speeding','red_light','illegal_parking','wrong_way','other')),
    recorded_speed  NUMERIC(5,1),
    fine_amount     NUMERIC(10,2),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','issued','paid','disputed','dismissed')),
    occurred_at     TIMESTAMPTZ NOT NULL
);

CREATE TABLE work_orders (
    work_order_id  SERIAL PRIMARY KEY,
    asset_type     VARCHAR(20) NOT NULL CHECK (asset_type IN ('signal','sensor','vms','road_segment')),
    asset_id       INT NOT NULL,
    assigned_to    INT REFERENCES users(user_id),
    priority       SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    description    TEXT,
    status         VARCHAR(20) NOT NULL DEFAULT 'open'
                   CHECK (status IN ('open','in_progress','done','cancelled')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at   TIMESTAMPTZ
);

CREATE TABLE activity_log (
    activity_id   BIGSERIAL PRIMARY KEY,
    resource_type VARCHAR(30) NOT NULL,
    resource_id   INT,
    action        VARCHAR(40) NOT NULL,
    details       TEXT NOT NULL,
    occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_log_time ON activity_log (occurred_at DESC);

-- -----------------------------------------------------------------
-- Seed data so the dashboard has something to show right away
-- -----------------------------------------------------------------
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('operator', 'Control room operator'),
  ('viewer', 'Read-only access');

INSERT INTO intersections (name, location, has_signal) VALUES
  ('Times Square Junction (demo)', ST_GeogFromText('POINT(-73.986270 40.757910)'), TRUE),
  ('Sector 12–13 link junction (demo)', ST_GeogFromText('POINT(-73.982792 40.760410)'), TRUE),
  ('West Midtown Junction (demo)', ST_GeogFromText('POINT(-73.989400 40.760810)'), FALSE);

INSERT INTO road_segments (name, road_class, from_intersection, to_intersection, geometry, length_m, lanes, speed_limit_kmh, status) VALUES
  ('Midtown West Corridor (demo)', 'arterial', 1, 2, ST_GeogFromText('LINESTRING(-73.986270 40.757910, -73.984531 40.759010, -73.982792 40.760410)'), 420, 3, 40, 'open'),
  ('Times Square Connector (demo)', 'collector', 2, 3, ST_GeogFromText('LINESTRING(-73.982792 40.760410, -73.985343 40.762110, -73.989400 40.760810)'), 380, 2, 30, 'restricted');

INSERT INTO traffic_signals (intersection_id, controller_model, mode, status) VALUES
  (1, 'ATC-2070', 'adaptive', 'online'),
  (2, 'ATC-2070', 'fixed', 'online');

INSERT INTO sensors (segment_id, sensor_type, location, status) VALUES
  (1, 'radar', ST_GeogFromText('POINT(-73.984531 40.759010)'), 'active'),
  (2, 'camera', ST_GeogFromText('POINT(-73.985343 40.762110)'), 'active');

INSERT INTO incidents (segment_id, incident_type, severity, location, description, status) VALUES
  (2, 'roadwork', 2, ST_GeogFromText('POINT(-73.985343 40.762110)'), 'Demo lane closure near Times Square', 'verified');
