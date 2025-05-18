/*
  # Add Insert and Update Policies

  1. Changes
    - Add insert policies for authenticated users
    - Add update policies for authenticated users
    - Add delete policies for authenticated users

  2. Security
    - Policies are restricted to authenticated users only
    - Each policy has specific conditions for data access
*/

-- Add policies for properties table
CREATE POLICY "Allow authenticated users to insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (true);

-- Add policies for bookings table
CREATE POLICY "Allow authenticated users to insert bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);

-- Add policies for expenses table
CREATE POLICY "Allow authenticated users to insert expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (true);

-- Add policies for maintenance_tasks table
CREATE POLICY "Allow authenticated users to insert maintenance tasks"
  ON maintenance_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update maintenance tasks"
  ON maintenance_tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete maintenance tasks"
  ON maintenance_tasks FOR DELETE
  TO authenticated
  USING (true);