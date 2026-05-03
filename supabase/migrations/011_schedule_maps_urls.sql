-- Populate maps_url for known IU Bloomington venues and SCC campus locations.
-- Uses Google Maps Place ID format: https://www.google.com/maps/place/?q=place_id:PLACE_ID
-- LIKE matches are intentionally broad to cover room-number suffixes (e.g. "Hodge 1050").

-- IU Bloomington venues
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJiWTCPbtmbIgRZyVO2JZP6Ug' WHERE location LIKE '%Assembly Hall%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJhz4S17dmbIgRHqr6_gabza0' WHERE location LIKE '%McNutt%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJJ0yK-7tmbIgRFsRUC4Pl3-w' WHERE location LIKE '%Wright%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJeda4ocFmbIgRa7zBHAFdg_c' WHERE location LIKE '%IMU%' OR location LIKE '%Memorial Union%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJn4kyX7pmbIgR1f4163mgZqI' WHERE location LIKE '%SRSC%' OR location LIKE '%Recreational Sports%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJZecKfTBnbIgRzWT9PBUpI6g' WHERE location LIKE '%Wilkinson%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJqzPByKRmbIgR1K1TirED55M' WHERE location LIKE '%Eigenmann%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJ2f_vJb1mbIgRI3KQCyITIVo' WHERE location LIKE '%Willkie%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJtWU4y7dmbIgRMBeoviX9TMk' WHERE location LIKE '%Briscoe%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJqSEA87hmbIgRt-ucArW14Jo' WHERE location LIKE '%Hodge%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJL9BKkLtmbIgRBeXIqyPCO6o' WHERE location LIKE '%Teter%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJ-_g-IbhmbIgRl7TE4IJM3-U' WHERE location LIKE '%Foster%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJp40JRVhnbIgRgm4Cc1It9ss' WHERE location LIKE '%Walnut Grove%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJscihRr9mbIgRrLheXJxnmAU' WHERE location LIKE '%Fine Arts%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJKx7HMeRnbIgRRJeJUS31XNU' WHERE location LIKE '%Union Street%';

-- Southeast Christian Church campuses
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJf-rktd6haYgRQ3VgdFiYFzw' WHERE location LIKE '%Blankenbaker%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJH2zqSNypaYgRDWvyfB7QgLY' WHERE location LIKE '%Bullitt%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJkwWvDUaaaYgRAZdmU1mwEmQ' WHERE location LIKE '%Crestwood%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJHY36Q37paIgRNL3bOigC7bs' WHERE location LIKE '%Etown%' OR location LIKE '%Elizabethtown%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJiaLKHSByaYgRJ_S0lr95hYA' WHERE location LIKE '%Indiana Campus%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJSRcX6iKOaYgRatkOJRpuSfM' WHERE location LIKE '%La Grange%' OR location LIKE '%LaGrange%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJDRR8o9N3aYgRRbNmmBYV-Qk' WHERE location LIKE '%Prospect%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJ4WlKcTnBaYgRC19PkVDWtP4' WHERE location LIKE '%Shelby%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJ1dWwAtpTaIgRJLH6fQ30J6w' WHERE location LIKE '%Nelson%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJl_B3HYASaYgRalLOC20_2Ww' WHERE location LIKE '%South Lou%' OR location LIKE '%Beechmont%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJq4hjOEQRaYgR5ISh7O0ijS4' WHERE location LIKE '%Southwest%';
UPDATE schedule_items SET maps_url = 'https://www.google.com/maps/place/?q=place_id:ChIJYWvjqNB4ZIgRIPR0If1k4dc' WHERE location LIKE '%Franklin Campus%';
