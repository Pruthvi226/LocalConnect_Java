-- Proxisense Production Database Schema
-- Version: 1.0.0 (Launch Ready)

CREATE DATABASE IF NOT EXISTS local_service_finder;
USE local_service_finder;

-- ─── Users Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(500),
    bio VARCHAR(1000),
    profile_image_url VARCHAR(500),
    role ENUM('USER', 'PROVIDER', 'ADMIN') DEFAULT 'USER',
    
    -- Smart Trust Metrics
    is_verified BOOLEAN DEFAULT FALSE,
    trust_score INT DEFAULT 100,
    completion_rate DECIMAL(5, 2) DEFAULT 100.00,
    on_time_performance DECIMAL(5, 2) DEFAULT 100.00,
    cancellation_rate DECIMAL(5, 2) DEFAULT 0.00,
    response_score DECIMAL(5, 2) DEFAULT 100.00,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    
    -- Safety & Payouts
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    upi_id VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Services Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    location VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url VARCHAR(500),
    
    -- Specialist Visual Proof
    before_image_url VARCHAR(500),
    after_image_url VARCHAR(500),
    
    -- Availability & Logic
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    is_available_now BOOLEAN DEFAULT FALSE,
    platform_fee DECIMAL(10, 2) DEFAULT 50.00,
    booking_type ENUM('INSTANT', 'REQUEST') DEFAULT 'REQUEST',
    
    provider_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Portfolio Images ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_portfolio_images (
    service_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- ─── Bookings Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    status ENUM(
        'PENDING', 'PENDING_PAYMENT', 'CONFIRMED', 'ACCEPTED', 
        'ARRIVED', 'IN_PROGRESS', 'UNDER_NEGOTIATION', 
        'PENDING_VERIFICATION', 'REVIEW_PENDING', 'COMPLETED', 'CANCELLED'
    ) DEFAULT 'PENDING',
    
    -- Safety & Tracking
    pin VARCHAR(10),
    provider_lat DECIMAL(10, 8),
    provider_lng DECIMAL(11, 8),
    eta_minutes INT,
    is_emergency BOOLEAN DEFAULT FALSE,
    problem_image_url VARCHAR(500),
    ai_diagnosis TEXT,
    
    -- Proof of Work
    before_image_url VARCHAR(500),
    after_image_url VARCHAR(500),
    
    -- Financial Snapshot
    base_price DECIMAL(10, 2),
    platform_fee DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    proposed_price DECIMAL(10, 2),
    
    notes VARCHAR(500),
    accepted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- ─── User Availability (Provider Shifts) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS user_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    day_of_week INT NOT NULL, -- 1(Mon) to 7(Sun)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Reviews ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_service_review (user_id, service_id)
);

-- ─── Messages ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    booking_id BIGINT,
    content VARCHAR(2000) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- ─── Notifications ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000),
    notification_type VARCHAR(50) NOT NULL,
    related_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Payments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    transaction_id VARCHAR(200),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ─── Favorites ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_service_favorite (user_id, service_id)
);

-- ─── Indexes for Performance ────────────────────────────────────────────────
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_location ON services(location);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_availability_user ON user_availability(user_id, day_of_week);