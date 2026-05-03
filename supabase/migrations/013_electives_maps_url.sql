ALTER TABLE electives ADD COLUMN IF NOT EXISTS maps_url text NOT NULL DEFAULT '';

-- Rename bare room names to include "IMU:" prefix for clarity
UPDATE electives SET location = 'IMU: Whittenberger Auditorium' WHERE location = 'Whittenberger Auditorium';
UPDATE electives SET location = 'IMU: Georgian Room'            WHERE location = 'Georgian Room';
UPDATE electives SET location = 'IMU: Alumni Hall'              WHERE location = 'Alumni Hall';

-- All elective locations are inside the Indiana Memorial Union (IMU), IU Bloomington
UPDATE electives
SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJeda4ocFmbIgRa7zBHAFdg_c'
WHERE location LIKE '%IMU%'
   OR location LIKE '%Whittenberger%'
   OR location LIKE '%Georgian%'
   OR location LIKE '%Alumni Hall%';
