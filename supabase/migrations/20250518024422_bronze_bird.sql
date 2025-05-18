/*
  # Fix RLS Policies

  1. Drop all existing policies to avoid conflicts
  2. Create new policies with unique names for each table
  3. Enable full CRUD access for authenticated users
*/

-- Drop all existing policies
DO $$ 
BEGIN
  -- Properties table policies
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON properties;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON properties;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON properties;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON properties;
  DROP POLICY IF EXISTS "Allow authenticated users to read properties" ON properties;
  DROP POLICY IF EXISTS "Allow authenticated users to insert properties" ON properties;
  DROP POLICY IF EXISTS "Allow authenticated users to update properties" ON properties;
  DROP POLICY IF EXISTS "Allow authenticated users to delete properties" ON properties;

  -- Bookings table policies
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON bookings;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON bookings;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON bookings;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON bookings;
  DROP POLICY IF EXISTS "Allow authenticated users to read bookings" ON bookings;
  DROP POLICY IF EXISTS "Allow authenticated users to insert bookings" ON bookings;
  DROP POLICY IF EXISTS "Allow authenticated users to update bookings" ON bookings;
  DROP POLICY IF EXISTS "Allow authenticated users to delete bookings" ON bookings;

  -- Expenses table policies
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON expenses;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON expenses;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON expenses;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON expenses;
  DROP POLICY IF EXISTS "Allow authenticated users to read expenses" ON expenses;
  DROP POLICY IF EXISTS "Allow authenticated users to insert expenses" ON expenses;
  DROP POLICY IF EXISTS "Allow authenticated users to update expenses" ON expenses;
  DROP POLICY IF EXISTS "Allow authenticated users to delete expenses" ON expenses;

  -- Maintenance tasks table policies
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Allow authenticated users to read maintenance tasks" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Allow authenticated users to insert maintenance tasks" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Allow authenticated users to update maintenance tasks" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Allow authenticated users to delete maintenance tasks" ON maintenance_tasks;
END $$;

-- Create new policies for properties table
CREATE POLICY "properties_select_policy" ON properties
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "properties_insert_policy" ON properties
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "properties_update_policy" ON properties
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "properties_delete_policy" ON properties
  FOR DELETE TO authenticated
  USING (true);

-- Create new policies for bookings table
CREATE POLICY "bookings_select_policy" ON bookings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "bookings_insert_policy" ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "bookings_update_policy" ON bookings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "bookings_delete_policy" ON bookings
  FOR DELETE TO authenticated
  USING (true);

-- Create new policies for expenses table
CREATE POLICY "expenses_select_policy" ON expenses
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "expenses_insert_policy" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "expenses_update_policy" ON expenses
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "expenses_delete_policy" ON expenses
  FOR DELETE TO authenticated
  USING (true);

-- Create new policies for maintenance_tasks table
CREATE POLICY "maintenance_tasks_select_policy" ON maintenance_tasks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "maintenance_tasks_insert_policy" ON maintenance_tasks
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "maintenance_tasks_update_policy" ON maintenance_tasks
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "maintenance_tasks_delete_policy" ON maintenance_tasks
  FOR DELETE TO authenticated
  USING (true);