/*
  # Fix RLS Policies for All Tables

  1. Changes
    - Drop all existing policies
    - Create new policies with proper permissions for authenticated users
    - Enable full CRUD access for authenticated users on all tables

  2. Security
    - Policies apply to authenticated users only
    - Each table gets separate policies for SELECT, INSERT, UPDATE, and DELETE
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON properties;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON bookings;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON expenses;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_tasks;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON maintenance_tasks;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON maintenance_tasks;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON maintenance_tasks;

-- Create new policies for properties table
CREATE POLICY "Enable read access for authenticated users"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON properties
  FOR DELETE
  TO authenticated
  USING (true);

-- Create new policies for bookings table
CREATE POLICY "Enable read access for authenticated users"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- Create new policies for expenses table
CREATE POLICY "Enable read access for authenticated users"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (true);

-- Create new policies for maintenance_tasks table
CREATE POLICY "Enable read access for authenticated users"
  ON maintenance_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON maintenance_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON maintenance_tasks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON maintenance_tasks
  FOR DELETE
  TO authenticated
  USING (true);