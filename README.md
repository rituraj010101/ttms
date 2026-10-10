# Traffic & Transportation Management System (TTMS)

[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Database: MySQL 8](https://img.shields.io/badge/Database-MySQL%208.0%2F8.4-blue.svg)](db/mysql_schema.sql)

A full-stack database reference project: a **MySQL 8** relational database with OpenGIS spatial geometry and automated triggers, a Node/Express REST API, and a browser dashboard for monitoring road segments, sensors, signals, and incidents on an interactive map.

> **DBMS Course Project Report:** For the full academic submission report compliant with IIIT Bhopal guidelines (ER diagrams, functional dependencies, 1NF/2NF/3NF/BCNF normalization proofs, query testing, and evaluation breakdown), see [DBMS_PROJECT_REPORT.md](DBMS_PROJECT_REPORT.md).

```
ttms/
├── DBMS_PROJECT_REPORT.md   # Complete 11-chapter academic project report
├── docker-compose.yml       # One-command orchestration for MySQL + backend + frontend
├── LICENSE
├── .gitignore
├── .github/workflows/ci.yml # Automated CI pipeline testing MySQL + API
├── db/
│   ├── mysql_schema.sql     # Complete MySQL 8 DDL, views, triggers, stored procedures & seeds
│   └── mysql_queries.sql    # 10 core query categories & advanced DBMS feature tests
├── backend/
│   ├── Dockerfile
│   ├── package.json         # Node.js backend using mysql2
│   ├── .env.example
│   └── src/
│       ├── server.js        # Express app entry point
│       ├── db.js            # mysql2 promise connection pool
│       ├── activity.js      # Audit logging helper
│       └── routes/
│           ├── segments.js  # Road segments with GeoJSON
│           ├── sensors.js   # Sensor telemetry and hourly trends
│           ├── incidents.js # Incident dispatch and location coordinates
│           ├── signals.js   # Traffic signal modes
│           └── activity.js  # Audit log queries
└── frontend/
    ├── Dockerfile
    ├── index.html           # Control Room dashboard shell
    ├── css/style.css
    └── js/app.js            # Leaflet map, SVG trend chart, API client & offline mode
```

---

## Quickstart with Docker

The fastest way to spin up the entire system (MySQL 8, Node.js API, and Nginx frontend):

```bash
docker compose up --build
```

- **Dashboard:** http://localhost:8080
- **API Health:** http://localhost:4000/api/health
- **MySQL Database:** `localhost:3306` (user: `ttms_user`, password: `ttms_password`, database: `ttms`)

The MySQL container automatically loads `db/mysql_schema.sql` (creating all 14 tables, spatial indexes, triggers, views, stored procedures, and initial seed data) upon first startup.

To move an existing database to the Midtown Manhattan demo map, run this once from the project folder, then rebuild the frontend:
```bash
docker compose exec -T db mysql -u ttms_user -pttms_password ttms < db/migrations/003_manhattan_demo.sql
docker compose up --build -d frontend
```
The map uses OpenStreetMap tiles. Network roads, device positions, incidents, and traffic readings are illustrative demo data, not live New York traffic information.

To reset the database cleanly:
```bash
docker compose down -v
docker compose up --build
```

---

## Manual Setup (without Docker)

### 1. Database (MySQL 8.0 / 8.4)

Ensure MySQL is running on your machine, then execute the complete schema script:

```bash
mysql -u root -p < db/mysql_schema.sql
```

This creates the `ttms` database, all relational tables, views (`v_active_incidents_detail`, `v_segment_traffic_overview`, `v_signal_intersection_status`), triggers (`trg_after_incident_insert`, `trg_after_incident_update`, `trg_after_segment_status_update`, `trg_after_signal_mode_update`), stored procedures, and inserts sample demonstration data centered on **Midtown Manhattan, New York (illustrative sample records)**.

To run and verify the 10 core SQL query concepts and advanced feature tests:
```bash
mysql -u root -p ttms < db/mysql_queries.sql
```

### 2. Backend API

```bash
cd backend
npm install
cp .env.example .env     # Adjust credentials if your MySQL password differs
npm start                # API runs on http://localhost:4000
```

#### API Endpoints:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint (reports status and MySQL engine) |
| `GET` | `/api/segments` | List road segments with OpenGIS GeoJSON geometry |
| `PATCH` | `/api/segments/:id` | Update road status (`open`, `restricted`, `closed`) |
| `GET` | `/api/sensors` | List traffic sensors and spatial locations |
| `GET` | `/api/sensors/readings/latest` | Most recent reading per segment |
| `GET` | `/api/sensors/readings/history?hours=12` | Hourly average speed and vehicle volume trends |
| `POST` | `/api/sensors/readings` | Ingest new sensor reading telemetry |
| `GET` | `/api/incidents` | List incidents (optional `?status=`) |
| `POST` | `/api/incidents` | Report a new incident with map coordinates |
| `PATCH` | `/api/incidents/:id` | Update incident status (`reported`, `verified`, `responding`, `cleared`) |
| `GET` | `/api/signals` | List traffic signals and intersection names |
| `PATCH` | `/api/signals/:id` | Change signal mode (`fixed`, `adaptive`, `flash`, `manual`, `off`) |
| `GET` | `/api/activity` | Retrieve recent activity audit log (50 records) |

### 3. Frontend Dashboard

The frontend is pure HTML5, CSS3, and modern JavaScript with Leaflet maps — no build or compilation step required.

```bash
cd frontend
npx serve .              # or: python3 -m http.server 8080
```

Open `http://localhost:8080` in your web browser. If the backend is unreachable, the dashboard automatically enters an offline sample mode so UI features can still be viewed and demonstrated.

---

## DBMS Features Implemented (Academic Compliance)

- **BCNF Normalization:** Zero update, insertion, or deletion anomalies across 14 relations.
- **Relational Integrity:** Explicit `CHECK` constraints on domains (`severity BETWEEN 1 AND 5`, `lanes > 0`, `fine_amount >= 0`), `FOREIGN KEY` referential actions (`ON DELETE CASCADE`, `ON DELETE SET NULL`), and `UNIQUE` constraints (`plate_number`, `email`).
- **OpenGIS Spatial Handling:** MySQL `POINT` and `LINESTRING` types with `SRID 4326`, spatial indexing (`SPATIAL INDEX`), and GeoJSON conversion (`ST_AsGeoJSON`).
- **Database Triggers:** Automated row-level triggers capture road status updates, incident reporting, and signal mode changes directly into `activity_log`.
- **Relational Views:** Pre-aggregated views for active incidents and segment traffic status.
- **Stored Procedures:** Reusable procedures for network summary metrics (`sp_get_network_summary`) and transactional incident reporting (`sp_report_incident`).

---

## License

MIT — see [LICENSE](LICENSE).
