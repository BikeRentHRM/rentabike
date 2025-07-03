/*
  # Initial Schema for Rent Bikes HRM

  1. New Tables
    - `bikes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `description` (text)
      - `price_per_hour` (decimal)
      - `price_per_day` (decimal)
      - `image_url` (text)
      - `available` (boolean)
      - `features` (text array)
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `bike_id` (uuid, foreign key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `duration_hours` (integer)
      - `total_cost` (decimal)
      - `status` (text)
      - `special_requests` (text)
      - `created_at` (timestamp)
    
    - `site_visits`
      - `id` (uuid, primary key)
      - `visited_at` (timestamptz)
      - `page` (text)
      - `referrer` (text)
      - `user_agent` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access on bikes
    - Add policies for booking creation and admin access
    - Add policies for site visit tracking
*/

-- Create bikes table
CREATE TABLE IF NOT EXISTS bikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  price_per_hour decimal(10,2) NOT NULL,
  price_per_day decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  available boolean DEFAULT true,
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id uuid REFERENCES bikes(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  duration_hours integer NOT NULL,
  total_cost decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  special_requests text,
  created_at timestamptz DEFAULT now()
);

-- Create site_visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at timestamptz DEFAULT now(),
  page text NOT NULL,
  referrer text,
  user_agent text
);

-- Enable Row Level Security
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Policies for bikes table (public read access)
CREATE POLICY "Anyone can view bikes"
  ON bikes
  FOR SELECT
  TO public
  USING (true);

-- Policies for bookings table (public can create, authenticated can view all)
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can manage bookings"
  ON bookings
  FOR ALL
  TO service_role
  USING (true);

-- Policies for site_visits table (public can insert)
CREATE POLICY "Anyone can track visits"
  ON site_visits
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can view visits"
  ON site_visits
  FOR SELECT
  TO service_role
  USING (true);

-- Insert sample bikes
INSERT INTO bikes (name, type, description, price_per_hour, price_per_day, image_url, available, features) VALUES
('Urban Explorer', 'City Bike', 'Perfect for exploring Halifax waterfront and city streets. Comfortable upright riding position with all the essentials.', 12.00, 45.00, 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg', true, ARRAY['Basket', 'LED Lights', 'Comfortable Seat', '7 Gears', 'Bell']),
('Mountain Trail', 'Mountain Bike', 'Tackle Halifax''s trails and hills with confidence. Full suspension and rugged build for any terrain.', 15.00, 60.00, 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg', true, ARRAY['Full Suspension', 'All Terrain Tires', '21 Gears', 'Water Bottle Holder', 'Mud Guards']),
('Road Runner', 'Road Bike', 'Speed and agility for road cycling enthusiasts. Lightweight frame perfect for longer distances.', 18.00, 70.00, 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg', true, ARRAY['Lightweight Frame', 'Drop Handlebars', '16 Gears', 'Racing Tires', 'Clipless Pedals']),
('Cruiser Classic', 'Cruiser', 'Relaxed riding experience perfect for leisurely tours around Halifax. Vintage style meets modern comfort.', 10.00, 40.00, 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg', true, ARRAY['Wide Seat', 'Upright Position', 'Single Speed', 'Vintage Style', 'Chain Guard']),
('Electric Glide', 'Electric Bike', 'Effortless cycling with electric assist. Perfect for tackling Halifax''s hills without breaking a sweat.', 25.00, 95.00, 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg', true, ARRAY['Electric Motor', 'LCD Display', 'Removable Battery', '5 Assist Levels', 'LED Lights']),
('Family Tandem', 'Tandem Bike', 'Double the fun with our tandem bike. Perfect for couples or parent-child adventures around HRM.', 20.00, 80.00, 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg', true, ARRAY['Two Seats', 'Synchronized Pedaling', 'Extra Stability', 'Double Brakes', 'Safety Flag']);