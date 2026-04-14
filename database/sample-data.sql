-- Proxisense Launch Ready Sample Data
-- For testing AI, Trust, and Scheduling features

USE local_service_finder;

-- ─── 0. Cleanup ─────────────────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE user_availability;
TRUNCATE TABLE service_portfolio_images;
TRUNCATE TABLE payments;
TRUNCATE TABLE notifications;
TRUNCATE TABLE reviews;
TRUNCATE TABLE bookings;
TRUNCATE TABLE services;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ─── 1. Core Users (Admin, Providers, Customers) ──────────────────────────
INSERT INTO users (username, email, password, full_name, role, trust_score, is_verified, phone, address) VALUES
('admin', 'admin@proxisense.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Super Admin', 'ADMIN', 100, TRUE, '9999999999', 'HQ Bangalore'),
('rahul_fixit', 'rahul@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Rahul Sharma (Expert Plumber)', 'PROVIDER', 98, TRUE, '9876543210', 'Indiranagar, Bangalore'),
('priya_sparkle', 'priya@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Priya Cleaners', 'PROVIDER', 95, TRUE, '9876543211', 'HSR Layout, Bangalore'),
('akash_volt', 'akash@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Akash Electricals', 'PROVIDER', 92, FALSE, '9876543212', 'Koramangala, Bangalore'),
('customer1', 'customer@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'John Doe', 'USER', 100, FALSE, '9000000001', 'Whitefield, Bangalore');

-- ─── 2. High-Trust Services ───────────────────────────────────────────────
INSERT INTO services (title, description, category, price, location, latitude, longitude, image_url, provider_id, platform_fee, booking_type, is_available_now) VALUES
('Emergency Plumbing & Leak Fix', '24/7 emergency support for pipe leaks and bathroom fittings.', 'Plumbing', 399.00, 'Bangalore Central', 12.9716, 77.5946, 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189', 2, 50.00, 'INSTANT', TRUE),
('Premium Deep Home Cleaning', 'Full home sanitation and deep cleaning using eco-friendly products.', 'Cleaning', 1499.00, 'HSR Layout', 12.9141, 77.6411, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 3, 100.00, 'REQUEST', FALSE),
('Safe Smart Home Wiring', 'Installation and repair of smart switches, CCTV, and home automation.', 'Electrical', 899.00, 'Koramangala', 12.9352, 77.6245, 'https://images.unsplash.com/photo-1621905252507-b354bcadc0e2', 4, 75.00, 'REQUEST', TRUE);

-- ─── 3. Provider Availability (Shifts) ────────────────────────────────────
-- Rahul (Mon-Fri, 9 AM to 6 PM)
INSERT INTO user_availability (user_id, day_of_week, start_time, end_time, is_active) VALUES
(2, 1, '09:00:00', '18:00:00', TRUE),
(2, 2, '09:00:00', '18:00:00', TRUE),
(2, 3, '09:00:00', '18:00:00', TRUE),
(2, 4, '09:00:00', '18:00:00', TRUE),
(2, 5, '09:00:00', '18:00:00', TRUE);

-- Priya (Sat-Sun, 10 AM to 4 PM)
INSERT INTO user_availability (user_id, day_of_week, start_time, end_time, is_active) VALUES
(3, 6, '10:00:00', '16:00:00', TRUE),
(3, 7, '10:00:00', '16:00:00', TRUE);

-- ─── 4. Specialists Visual Portfolio ──────────────────────────────────────
INSERT INTO service_portfolio_images (service_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1504148455328-436277dffad4'),
(1, 'https://images.unsplash.com/photo-1542013936693-884638332954'),
(2, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac');

-- ─── 5. Initial Reviews ────────────────────────────────────────────────────
INSERT INTO reviews (user_id, service_id, rating, comment) VALUES
(5, 1, 5, 'Rahul was incredibly fast. Fixed my kitchen leak in 15 minutes!'),
(5, 2, 4, 'Deep cleaning was good, but took slightly longer than expected.');

-- ─── 6. Live Active Booking (For Tracking UI Demo) ────────────────────────
INSERT INTO bookings (user_id, service_id, booking_date, status, pin, provider_lat, provider_lng, eta_minutes, base_price, platform_fee, total_price) VALUES
(5, 1, DATE_ADD(NOW(), INTERVAL 1 HOUR), 'ACCEPTED', '1234', 12.9750, 77.6000, 12, 399.00, 50.00, 449.00);

-- Match initial payment
INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES
(1, 449.00, 'ONLINE', 'COMPLETED');
