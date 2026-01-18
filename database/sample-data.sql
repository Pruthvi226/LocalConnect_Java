-- Sample data for Local Service Finder
USE local_service_finder;

-- Insert sample users
INSERT INTO users (username, email, password, full_name, phone, address, role) VALUES
('admin', 'admin@localservice.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ5m', 'Admin User', '1234567890', '123 Admin St, City', 'ADMIN'),
('john_doe', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ5m', 'John Doe', '9876543210', '456 Main St, City', 'USER'),
('jane_smith', 'jane@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ5m', 'Jane Smith', '9876543211', '789 Oak Ave, City', 'USER'),
('mike_provider', 'mike@provider.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ5m', 'Mike Provider', '9876543212', '321 Provider Lane, City', 'PROVIDER'),
('sarah_provider', 'sarah@provider.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK8pJ5m', 'Sarah Provider', '9876543213', '654 Service Blvd, City', 'PROVIDER');

-- Note: Password for all users is 'password123' (hashed with BCrypt)

-- Insert sample services
INSERT INTO services (title, description, category, price, location, latitude, longitude, image_url, provider_id, is_available) VALUES
('Professional House Cleaning', 'Complete house cleaning service including kitchen, bathrooms, bedrooms, and living areas. We use eco-friendly products.', 'Cleaning', 150.00, 'New York, NY', 40.7128, -74.0060, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400', 4, TRUE),
('Plumbing Services', 'Expert plumbing repairs, installations, and maintenance. Available 24/7 for emergencies.', 'Plumbing', 200.00, 'Los Angeles, CA', 34.0522, -118.2437, 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400', 4, TRUE),
('Electrical Repairs', 'Licensed electrician for all your electrical needs. Safety guaranteed.', 'Electrical', 180.00, 'Chicago, IL', 41.8781, -87.6298, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400', 4, TRUE),
('Landscaping & Lawn Care', 'Professional landscaping services including mowing, trimming, planting, and garden design.', 'Landscaping', 120.00, 'Houston, TX', 29.7604, -95.3698, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 5, TRUE),
('Carpet Cleaning', 'Deep steam cleaning for carpets and rugs. Removes stains and odors effectively.', 'Cleaning', 100.00, 'Phoenix, AZ', 33.4484, -112.0740, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', 5, TRUE),
('HVAC Installation', 'Professional heating, ventilation, and air conditioning installation and repair services.', 'HVAC', 500.00, 'Philadelphia, PA', 39.9526, -75.1652, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400', 5, TRUE),
('Window Cleaning', 'Professional window cleaning for residential and commercial properties. Streak-free results.', 'Cleaning', 80.00, 'San Antonio, TX', 29.4241, -98.4936, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', 4, TRUE),
('Roofing Services', 'Expert roof repair, replacement, and maintenance. Free estimates available.', 'Roofing', 800.00, 'San Diego, CA', 32.7157, -117.1611, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400', 5, TRUE),
('Painting Services', 'Interior and exterior painting with premium quality paints. Professional finish guaranteed.', 'Painting', 300.00, 'Dallas, TX', 32.7767, -96.7970, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', 4, TRUE),
('Appliance Repair', 'Expert repair for all major appliances including refrigerators, washers, dryers, and ovens.', 'Appliance Repair', 150.00, 'San Jose, CA', 37.3382, -121.8863, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 5, TRUE);

-- Insert sample bookings
INSERT INTO bookings (user_id, service_id, booking_date, status, notes) VALUES
(2, 1, '2024-02-15 10:00:00', 'CONFIRMED', 'Please use eco-friendly cleaning products'),
(2, 3, '2024-02-20 14:00:00', 'PENDING', 'Need to fix kitchen outlet'),
(3, 4, '2024-02-18 09:00:00', 'CONFIRMED', 'Weekly lawn mowing service'),
(3, 5, '2024-02-22 11:00:00', 'PENDING', 'Deep clean living room carpet'),
(2, 7, '2024-02-16 08:00:00', 'COMPLETED', 'All windows including second floor');

-- Insert sample reviews
INSERT INTO reviews (user_id, service_id, rating, comment) VALUES
(2, 1, 5, 'Excellent service! The house was spotless. Highly recommend!'),
(3, 4, 4, 'Great landscaping work. The lawn looks amazing.'),
(2, 7, 5, 'Windows are crystal clear. Professional and efficient service.'),
(3, 5, 4, 'Carpet looks brand new. Very satisfied with the results.');

-- Update service ratings based on reviews
UPDATE services s
SET average_rating = (
    SELECT AVG(rating)
    FROM reviews r
    WHERE r.service_id = s.id
),
total_reviews = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.service_id = s.id
)
WHERE EXISTS (
    SELECT 1
    FROM reviews r
    WHERE r.service_id = s.id
);
