/*
  # Add Enhanced Analytics Fields

  1. Changes
    - Add additional tracking fields to site_visits table for better analytics
    - Add indexes for better query performance
    - Maintain backward compatibility

  2. New Fields
    - ip_address (text) - Client IP address
    - country (text) - Country from IP geolocation
    - session_id (text) - Session identifier
    - utm_source (text) - UTM source parameter
    - utm_medium (text) - UTM medium parameter
    - utm_campaign (text) - UTM campaign parameter
    - screen_resolution (text) - Screen resolution
    - viewport_size (text) - Viewport size
    - device_type (text) - Device type (mobile/tablet/desktop)
    - browser (text) - Browser name
    - os (text) - Operating system
*/

-- Add new analytics fields to site_visits table
DO $$
BEGIN
  -- Add ip_address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN ip_address text;
  END IF;

  -- Add country column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'country'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN country text;
  END IF;

  -- Add session_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN session_id text;
  END IF;

  -- Add UTM tracking columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN utm_source text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'utm_medium'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN utm_medium text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'utm_campaign'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN utm_campaign text;
  END IF;

  -- Add device/browser tracking columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'screen_resolution'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN screen_resolution text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'viewport_size'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN viewport_size text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'device_type'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN device_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'browser'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN browser text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_visits' AND column_name = 'os'
  ) THEN
    ALTER TABLE site_visits ADD COLUMN os text;
  END IF;
END $$;

-- Add indexes for better analytics query performance
CREATE INDEX IF NOT EXISTS idx_site_visits_visited_at ON site_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_page ON site_visits(page);
CREATE INDEX IF NOT EXISTS idx_site_visits_referrer ON site_visits(referrer);
CREATE INDEX IF NOT EXISTS idx_site_visits_session_id ON site_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_country ON site_visits(country);
CREATE INDEX IF NOT EXISTS idx_site_visits_device_type ON site_visits(device_type);
CREATE INDEX IF NOT EXISTS idx_site_visits_utm_source ON site_visits(utm_source);

-- Add composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_site_visits_date_page ON site_visits(visited_at, page);
CREATE INDEX IF NOT EXISTS idx_site_visits_date_referrer ON site_visits(visited_at, referrer);