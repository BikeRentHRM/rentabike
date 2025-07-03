/*
  # Update Sample Bikes with Cheaper Pricing

  1. Changes
    - Update all bike prices to be more competitive and affordable
    - Emphasize that these are the cheapest rates in HRM
    - Update bike descriptions to highlight affordability

  2. New Pricing Structure
    - City bikes: $8/hour, $25/day
    - Mountain bikes: $10/hour, $35/day  
    - Road bikes: $12/hour, $40/day
    - Cruisers: $6/hour, $20/day
    - Electric bikes: $15/hour, $50/day
    - Tandem bikes: $12/hour, $45/day
*/

-- Update bike pricing to be the cheapest in HRM
UPDATE bikes SET 
  price_per_hour = 8.00,
  price_per_day = 25.00,
  description = 'Perfect for exploring Halifax waterfront and city streets at unbeatable prices. Most affordable city bike in HRM!'
WHERE name = 'Urban Explorer';

UPDATE bikes SET 
  price_per_hour = 10.00,
  price_per_day = 35.00,
  description = 'Tackle Halifax''s trails and hills with confidence without breaking the bank. Cheapest mountain bike rental in the region!'
WHERE name = 'Mountain Trail';

UPDATE bikes SET 
  price_per_hour = 12.00,
  price_per_day = 40.00,
  description = 'Speed and agility for road cycling enthusiasts at budget-friendly rates. Best value road bike in Halifax!'
WHERE name = 'Road Runner';

UPDATE bikes SET 
  price_per_hour = 6.00,
  price_per_day = 20.00,
  description = 'Relaxed riding experience perfect for leisurely tours around Halifax. Our most affordable option - unbeatable value!'
WHERE name = 'Cruiser Classic';

UPDATE bikes SET 
  price_per_hour = 15.00,
  price_per_day = 50.00,
  description = 'Effortless cycling with electric assist at the lowest e-bike rates in HRM. Premium technology, budget price!'
WHERE name = 'Electric Glide';

UPDATE bikes SET 
  price_per_hour = 12.00,
  price_per_day = 45.00,
  description = 'Double the fun at half the expected price! Most affordable tandem bike rental in Halifax Regional Municipality.'
WHERE name = 'Family Tandem';