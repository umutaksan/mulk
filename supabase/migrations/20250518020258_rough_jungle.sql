/*
  # Initial Schema Setup for Property Management System

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - L&D Guest or L&D Guest Commission
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key)
      - `guest_name` (text)
      - `guest_email` (text)
      - `guest_phone` (text)
      - `guest_country` (text)
      - `arrival_date` (date)
      - `departure_date` (date)
      - `nights` (integer)
      - `guests` (integer)
      - `total_amount` (decimal)
      - `source` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `expenses`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key)
      - `category` (text)
      - `amount` (decimal)
      - `description` (text)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `maintenance_tasks`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `due_date` (date)
      - `priority` (text)
      - `status` (text)
      - `price` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Functions
    - Add trigger functions for updated_at timestamps
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('L&D Guest', 'L&D Guest Commission')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text,
  guest_phone text,
  guest_country text,
  arrival_date date NOT NULL,
  departure_date date NOT NULL,
  nights integer NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  source text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (departure_date >= arrival_date),
  CONSTRAINT valid_nights CHECK (nights > 0),
  CONSTRAINT valid_guests CHECK (guests > 0)
);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  description text,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_amount CHECK (amount >= 0)
);

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_price CHECK (price >= 0)
);

CREATE TRIGGER update_maintenance_tasks_updated_at
  BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow authenticated users to read properties"
  ON properties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read maintenance tasks"
  ON maintenance_tasks FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_arrival_date ON bookings(arrival_date);
CREATE INDEX IF NOT EXISTS idx_bookings_departure_date ON bookings(departure_date);
CREATE INDEX IF NOT EXISTS idx_expenses_booking_id ON expenses(booking_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_property_id ON maintenance_tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_due_date ON maintenance_tasks(due_date);