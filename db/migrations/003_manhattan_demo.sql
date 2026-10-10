-- Relocate the illustrative TTMS network to Midtown Manhattan.
-- OpenStreetMap supplies the basemap; all TTMS roads, sensors, traffic,
-- incidents and telemetry remain sample/demo records, not live NYC data.
START TRANSACTION;

UPDATE intersections SET name='Times Square Junction (demo)', location=ST_GeomFromText('POINT(-73.986270 40.757910)', 4326, 'axis-order=long-lat') WHERE intersection_id=1;
UPDATE intersections SET name='Bryant Park Junction (demo)', location=ST_GeomFromText('POINT(-73.982792 40.760410)', 4326, 'axis-order=long-lat') WHERE intersection_id=2;
UPDATE intersections SET name='West Midtown Junction (demo)', location=ST_GeomFromText('POINT(-73.989400 40.760810)', 4326, 'axis-order=long-lat') WHERE intersection_id=3;
UPDATE intersections SET name='Herald Square Crossing (demo)', location=ST_GeomFromText('POINT(-73.978388 40.754110)', 4326, 'axis-order=long-lat') WHERE intersection_id=4;
UPDATE intersections SET name='Rockefeller Center Circle (demo)', location=ST_GeomFromText('POINT(-73.996355 40.763610)', 4326, 'axis-order=long-lat') WHERE intersection_id=5;
UPDATE intersections SET name='West Side Connector Junction (demo)', location=ST_GeomFromText('POINT(-74.004469 40.766610)', 4326, 'axis-order=long-lat') WHERE intersection_id=6;
UPDATE intersections SET name='Grand Central Market Square (demo)', location=ST_GeomFromText('POINT(-73.974330 40.747610)', 4326, 'axis-order=long-lat') WHERE intersection_id=7;
UPDATE intersections SET name='East Midtown Link Junction (demo)', location=ST_GeomFromText('POINT(-73.966216 40.742610)', 4326, 'axis-order=long-lat') WHERE intersection_id=8;
UPDATE road_segments SET name='Midtown West Corridor (demo)', geometry=ST_GeomFromText('LINESTRING(-73.986270 40.757910, -73.984531 40.759010, -73.982792 40.760410)', 4326, 'axis-order=long-lat') WHERE segment_id=1;
UPDATE road_segments SET name='Times Square Connector (demo)', geometry=ST_GeomFromText('LINESTRING(-73.982792 40.760410, -73.985343 40.762110, -73.989400 40.760810)', 4326, 'axis-order=long-lat') WHERE segment_id=2;
UPDATE road_segments SET name='Broadway Midtown Arterial (demo)', geometry=ST_GeomFromText('LINESTRING(-73.978388 40.754110, -73.981865 40.755810, -73.986270 40.757910)', 4326, 'axis-order=long-lat') WHERE segment_id=3;
UPDATE road_segments SET name='Bryant Park Connector (demo)', geometry=ST_GeomFromText('LINESTRING(-73.989400 40.760810, -73.992877 40.762110, -73.996355 40.763610)', 4326, 'axis-order=long-lat') WHERE segment_id=4;
UPDATE road_segments SET name='Hudson River Parkway Feeder (demo)', geometry=ST_GeomFromText('LINESTRING(-73.996355 40.763610, -74.000412 40.765110, -74.004469 40.766610)', 4326, 'axis-order=long-lat') WHERE segment_id=5;
UPDATE road_segments SET name='Fifth Avenue Central Corridor (demo)', geometry=ST_GeomFromText('LINESTRING(-73.978388 40.754110, -73.976649 40.751110, -73.974330 40.747610)', 4326, 'axis-order=long-lat') WHERE segment_id=6;
UPDATE road_segments SET name='East Midtown Arterial (demo)', geometry=ST_GeomFromText('LINESTRING(-73.974330 40.747610, -73.970273 40.745110, -73.966216 40.742610)', 4326, 'axis-order=long-lat') WHERE segment_id=7;
UPDATE road_segments SET name='West Side Bypass (demo)', geometry=ST_GeomFromText('LINESTRING(-74.004469 40.766610, -73.996934 40.764110, -73.989400 40.760810)', 4326, 'axis-order=long-lat') WHERE segment_id=8;
UPDATE variable_message_signs SET location=ST_GeomFromText('POINT(-73.985343 40.758610)', 4326, 'axis-order=long-lat') WHERE vms_id=1;
UPDATE variable_message_signs SET location=ST_GeomFromText('POINT(-73.984183 40.761110)', 4326, 'axis-order=long-lat') WHERE vms_id=2;
UPDATE variable_message_signs SET location=ST_GeomFromText('POINT(-73.999832 40.764610)', 4326, 'axis-order=long-lat') WHERE vms_id=3;
UPDATE variable_message_signs SET location=ST_GeomFromText('POINT(-73.971433 40.746110)', 4326, 'axis-order=long-lat') WHERE vms_id=4;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.984531 40.759010)', 4326, 'axis-order=long-lat') WHERE sensor_id=1;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.985343 40.762110)', 4326, 'axis-order=long-lat') WHERE sensor_id=2;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.982445 40.756110)', 4326, 'axis-order=long-lat') WHERE sensor_id=3;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.992877 40.762110)', 4326, 'axis-order=long-lat') WHERE sensor_id=4;
UPDATE sensors SET location=ST_GeomFromText('POINT(-74.000412 40.765110)', 4326, 'axis-order=long-lat') WHERE sensor_id=5;
UPDATE sensors SET location=ST_GeomFromText('POINT(-74.003310 40.766110)', 4326, 'axis-order=long-lat') WHERE sensor_id=6;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.976069 40.749610)', 4326, 'axis-order=long-lat') WHERE sensor_id=7;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.969694 40.744610)', 4326, 'axis-order=long-lat') WHERE sensor_id=8;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.967375 40.743110)', 4326, 'axis-order=long-lat') WHERE sensor_id=9;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.996355 40.763610)', 4326, 'axis-order=long-lat') WHERE sensor_id=10;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.980126 40.755110)', 4326, 'axis-order=long-lat') WHERE sensor_id=11;
UPDATE sensors SET location=ST_GeomFromText('POINT(-73.974910 40.748410)', 4326, 'axis-order=long-lat') WHERE sensor_id=12;
UPDATE incidents SET location=ST_GeomFromText('POINT(-73.985343 40.762110)', 4326, 'axis-order=long-lat') WHERE incident_id=1;
UPDATE incidents SET location=ST_GeomFromText('POINT(-73.984183 40.759210)', 4326, 'axis-order=long-lat') WHERE incident_id=2;
UPDATE incidents SET location=ST_GeomFromText('POINT(-74.002151 40.765810)', 4326, 'axis-order=long-lat') WHERE incident_id=3;
UPDATE incidents SET location=ST_GeomFromText('POINT(-73.970853 40.745410)', 4326, 'axis-order=long-lat') WHERE incident_id=4;
UPDATE incidents SET location=ST_GeomFromText('POINT(-73.995196 40.763110)', 4326, 'axis-order=long-lat') WHERE incident_id=5;
UPDATE incidents SET location=ST_GeomFromText('POINT(-73.981286 40.755610)', 4326, 'axis-order=long-lat') WHERE incident_id=6;
UPDATE incidents SET description = REPLACE(description, 'Dwarka Sector 12', 'Times Square') WHERE description LIKE '%Dwarka%';
UPDATE variable_message_signs SET current_text = REPLACE(current_text, 'METRO CORRIDOR', 'MIDTOWN CORRIDOR') WHERE vms_id=1;
UPDATE variable_message_signs SET current_text = REPLACE(current_text, 'EXPRESSWAY', 'MIDTOWN') WHERE vms_id IN (3,4);

COMMIT;
