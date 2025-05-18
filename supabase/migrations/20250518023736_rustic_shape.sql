/*
  # Initial Data Migration

  1. Insert Initial Data
    - Properties
    - Sample bookings
    - Sample expenses
*/

-- Insert initial properties
INSERT INTO properties (name, type) VALUES
  ('Marbella Old Town', 'L&D Guest'),
  ('Jardines Tropicales-Puerto Banús', 'L&D Guest'),
  ('Playa de la Fontanilla Marbella', 'L&D Guest'),
  ('ALOHA • Garden + Rooftop View Marbella Stay', 'L&D Guest Commission');

-- Insert sample bookings
WITH property_ids AS (
  SELECT id, name FROM properties
)
INSERT INTO bookings (
  property_id,
  guest_name,
  guest_email,
  guest_phone,
  guest_country,
  arrival_date,
  departure_date,
  nights,
  guests,
  total_amount,
  source,
  status
)
SELECT 
  p.id as property_id,
  b.name as guest_name,
  b.email as guest_email,
  b.phone as guest_phone,
  b.country_name as guest_country,
  b.date_arrival::date as arrival_date,
  b.date_departure::date as departure_date,
  b.nights::integer,
  b.people::integer as guests,
  b.total_amount::decimal(10,2),
  b.source,
  b.status
FROM (
  VALUES 
    ('Marbella Old Town', 'Amarildo Kutrolli', NULL, NULL, 'N/A', '2025-08-09', '2025-08-16', 7, 8, 2677.50, 'Booking.com', 'Booked'),
    ('Marbella Old Town', 'Caroline Duncombe', NULL, NULL, 'N/A', '2025-11-07', '2025-11-10', 3, 6, 972.00, 'Booking.com', 'Booked'),
    ('Jardines Tropicales-Puerto Banús', 'Šárka Stiborová', 'sstibo.945379@guest.booking.com', '+420 603 387 626', 'N/A', '2025-09-03', '2025-09-07', 4, 2, 792.80, 'Booking.com', 'Booked')
) as b(house_name, name, email, phone, country_name, date_arrival, date_departure, nights, people, total_amount, source, status)
JOIN property_ids p ON p.name = b.house_name;

-- Insert sample expenses
WITH booking_ids AS (
  SELECT id, arrival_date, guests FROM bookings
)
INSERT INTO expenses (
  booking_id,
  category,
  amount,
  description,
  date
)
SELECT 
  b.id as booking_id,
  e.category,
  CASE
    WHEN e.category = 'Management-Transaction' THEN b_amount * e.rate
    WHEN e.category = 'Management-Commission' THEN b_amount * e.rate
    WHEN e.category = 'Management-VAT' THEN b_amount * 0.22 * e.rate
    WHEN e.category LIKE 'Management-%' AND e.per_guest THEN e.rate * b.guests
    ELSE e.rate
  END as amount,
  e.description,
  b.arrival_date as date
FROM booking_ids b
CROSS JOIN LATERAL (
  SELECT total_amount as b_amount FROM bookings WHERE id = b.id
) ba
CROSS JOIN (
  VALUES 
    ('Management-Transaction', 0.013, false, 'Payment processing fee (1.3%)'),
    ('Management-Commission', 0.22, false, 'Management commission (22%)'),
    ('Management-VAT', 0.21, false, 'VAT on commission (21%)'),
    ('Cleaning', 90.00, false, 'Professional cleaning service'),
    ('Management-Wine', 2.00, false, 'Welcome wine'),
    ('Management-Coffee', 0.30, true, 'Coffee capsules per guest'),
    ('Management-Water', 0.36, true, 'Water bottles per guest'),
    ('Management-Tea', 0.30, true, 'Tea bags per guest'),
    ('Management-Slippers', 0.60, true, 'Guest slippers per guest')
) as e(category, rate, per_guest, description);