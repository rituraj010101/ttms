CREATE TABLE IF NOT EXISTS activity_log (
    activity_id   BIGSERIAL PRIMARY KEY,
    resource_type VARCHAR(30) NOT NULL,
    resource_id   INT,
    action        VARCHAR(40) NOT NULL,
    details       TEXT NOT NULL,
    occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_time
    ON activity_log (occurred_at DESC);
