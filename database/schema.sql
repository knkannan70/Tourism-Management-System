-- ============================================================
-- Tourism Management System - MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS tourism_db;
USE tourism_db;

-- ============================================================
-- ADMINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    profile_image_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS states (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================
-- DISTRICTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS districts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL,
    state_id BIGINT NOT NULL,
    CONSTRAINT fk_district_state FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================
-- PLACES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS places (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    place_name VARCHAR(200) NOT NULL,
    region VARCHAR(100) NOT NULL,
    season VARCHAR(50),
    days INT NOT NULL DEFAULT 1,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    image_url VARCHAR(500),
    category_id BIGINT,
    state_id BIGINT,
    district_id BIGINT,
    location VARCHAR(200),
    latitude DOUBLE,
    longitude DOUBLE,
    best_time_to_visit VARCHAR(100),
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    opening_time VARCHAR(20),
    closing_time VARCHAR(20),
    rating DOUBLE DEFAULT 0.0,
    review_count INT DEFAULT 0,
    nearby_attractions TEXT,
    travel_tips TEXT,
    popular_activities TEXT,
    video_url VARCHAR(500),
    video_thumbnail_url VARCHAR(500),
    google_maps_url VARCHAR(1000),
    view_count BIGINT DEFAULT 0,
    booking_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_place_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_place_state FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
    CONSTRAINT fk_place_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
);

-- ============================================================
-- HOTELS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(300),
    state_id BIGINT,
    district_id BIGINT,
    place_id BIGINT,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_per_night DECIMAL(10,2) DEFAULT 0.00,
    description TEXT,
    image_url VARCHAR(500),
    contact_number VARCHAR(20),
    amenities TEXT,
    star_rating INT DEFAULT 3,
    rating DOUBLE DEFAULT 0.0,
    review_count INT DEFAULT 0,
    video_url VARCHAR(500),
    video_thumbnail_url VARCHAR(500),
    google_maps_url VARCHAR(1000),
    room_types TEXT,
    view_count BIGINT DEFAULT 0,
    booking_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hotel_state FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL,
    CONSTRAINT fk_hotel_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
    CONSTRAINT fk_hotel_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL
);

-- ============================================================
-- PACKAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(200) NOT NULL,
    place_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_package_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    CONSTRAINT fk_package_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    travel_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    booking_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    number_of_persons INT DEFAULT 1,
    special_requests TEXT,
    payment_status VARCHAR(30) DEFAULT 'PAID',
    payment_id VARCHAR(100),
    user_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- ============================================================
-- FEEDBACK TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    booking_id BIGINT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    approved BOOLEAN DEFAULT FALSE,
    likes_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- ============================================================
-- PLACE IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS place_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    place_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_place_image_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);

-- ============================================================
-- HOTEL IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS hotel_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_hotel_image_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);
