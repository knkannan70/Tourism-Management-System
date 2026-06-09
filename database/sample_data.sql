-- ============================================================
-- Tourism Management System - Sample Data
-- Run this AFTER starting the Spring Boot app at least once
-- (so Hibernate creates the tables via ddl-auto=update)
-- ============================================================

USE tourism_db;

-- ============================================================
-- NOTE: The admin user is auto-created by DataInitializer.java
-- Default credentials: admin / admin123
-- ============================================================

-- ============================================================
-- PLACES
-- ============================================================
INSERT IGNORE INTO places (place_name, region, season, days, cost, description, image_url) VALUES
('Goa Beaches', 'West India', 'Winter', 5, 8000.00, 'Pristine beaches, vibrant nightlife, and Portuguese heritage make Goa a top destination. Enjoy stunning sunsets at Calangute Beach, explore Old Goa churches, and indulge in seafood.', NULL),
('Kerala Backwaters', 'South India', 'Monsoon', 7, 12000.00, 'Experience the serene backwaters of Kerala on a traditional houseboat. Wind through coconut groves, rice paddies, and tranquil waterways in God''s Own Country.', NULL),
('Manali Hills', 'North India', 'Summer', 6, 15000.00, 'Nestled in the Himalayas, Manali offers adventure sports, scenic valleys, and ancient monasteries. Perfect for trekking, skiing, and experiencing mountain culture.', NULL),
('Rajasthan Desert', 'West India', 'Winter', 8, 18000.00, 'Journey through the land of kings — majestic forts, opulent palaces, golden sand dunes, and vibrant culture. Explore Jaipur, Jodhpur, Jaisalmer, and Udaipur.', NULL),
('Andaman Islands', 'East India', 'Summer', 6, 25000.00, 'Crystal-clear waters, pristine coral reefs, and white sandy beaches make Andaman a paradise for water sports, diving, and snorkeling enthusiasts.', NULL),
('Ooty Hills', 'South India', 'Summer', 4, 9000.00, 'The Queen of Hill Stations — lush tea gardens, botanical gardens, and scenic toy train rides through the Nilgiri Hills make Ooty a refreshing retreat.', NULL),
('Agra Heritage', 'North India', 'Winter', 3, 7000.00, 'Home to the iconic Taj Mahal, Agra is a UNESCO World Heritage city with the Agra Fort and Fatehpur Sikri, offering a glimpse into Mughal grandeur.', NULL),
('Darjeeling Tea', 'East India', 'Spring', 5, 11000.00, 'Famous for its tea estates, the Himalayan backdrop, and the legendary Darjeeling Himalayan Railway, this hill station is a photographer''s dream.', NULL);

-- ============================================================
-- HOTELS
-- ============================================================
INSERT IGNORE INTO hotels (hotel_name, city, cost, description, image_url) VALUES
('Sunset Beach Resort', 'Goa', 4500.00, 'A luxurious beachfront resort with infinity pools, spa services, and gourmet dining. All rooms have ocean views.', NULL),
('Houseboat Deluxe', 'Alleppey', 6000.00, 'Traditional Kerala-style houseboat with air-conditioned bedrooms, a sun deck, and a personal chef. Navigate the backwaters in style.', NULL),
('Snow Peak Lodge', 'Manali', 3500.00, 'Cozy mountain lodge with fireplaces, panoramic valley views, and easy access to ski slopes and trekking routes.', NULL),
('Haveli Heritage Hotel', 'Jaipur', 5500.00, 'A royal heritage hotel set in a restored 18th-century haveli with traditional Rajasthani décor, courtyard, and cultural performances.', NULL),
('Coral Bay Resort', 'Port Blair', 7000.00, 'Premium island resort with private beach access, water sports facilities, and glass-bottom boat tours.', NULL),
('Nilgiri Tea Bungalow', 'Ooty', 3000.00, 'Charming colonial-era bungalow surrounded by tea gardens. Includes guided tea estate walks and evening bonfires.', NULL),
('Taj View Grand', 'Agra', 8000.00, 'Five-star hotel with direct views of the Taj Mahal, rooftop restaurant, and curated heritage tours.', NULL),
('Himalayan Retreat', 'Darjeeling', 4000.00, 'Boutique hotel with stunning Kanchenjunga views, Tibetan décor, and guided tea garden experiences.', NULL);

-- ============================================================
-- PACKAGES (linking places and hotels by ID)
-- ============================================================
INSERT IGNORE INTO packages (package_name, place_id, hotel_id, duration, price, description, image_url) VALUES
('Goa Beach Paradise', 1, 1, '5 Days / 4 Nights', 32000.00, 'An all-inclusive beach holiday in Goa featuring comfortable stays at Sunset Beach Resort, guided beach tours, water sports (jet skiing, parasailing), Goa heritage walk, and farewell dinner.', NULL),
('Kerala Backwater Bliss', 2, 2, '7 Days / 6 Nights', 55000.00, 'The ultimate Kerala experience — houseboat cruise through Alleppey backwaters, Ayurvedic spa sessions, Kathakali dance performance, spice plantation visit, and Cochin sightseeing.', NULL),
('Manali Adventure Escape', 3, 3, '6 Days / 5 Nights', 45000.00, 'An action-packed Himalayan adventure with paragliding, river rafting, Rohtang Pass excursion, trekking to Jogini Falls, and a visit to Hadimba Temple and Old Manali.', NULL),
('Royal Rajasthan Tour', 4, 4, '8 Days / 7 Nights', 72000.00, 'A grand royal tour covering Jaipur, Jodhpur, Jaisalmer, and Udaipur. Includes camel safari at Sam Sand Dunes, City Palace tour, lake boat ride in Udaipur, and folk evening.', NULL),
('Andaman Island Getaway', 5, 5, '6 Days / 5 Nights', 85000.00, 'Explore Havelock Island beaches, scuba diving at coral reefs, glass-bottom boat ride, cellular jail sound and light show, North Bay Island visit, and Island beach barbecue.', NULL),
('Ooty Hill Station Holiday', 6, 6, '4 Days / 3 Nights', 28000.00, 'Refresh yourself in the Nilgiris with a Botanical Garden visit, Ooty Lake boating, tea estate walk, Doddabetta Peak viewpoint, toy train ride, and Pykara waterfall excursion.', NULL),
('Agra Heritage Day Tour', 7, 7, '3 Days / 2 Nights', 35000.00, 'Experience the Mughal splendor with sunrise Taj Mahal visit, Agra Fort tour, Mehtab Bagh sunset view, Fatehpur Sikri excursion, and traditional Mughlai dinner.', NULL),
('Darjeeling Panorama Package', 8, 8, '5 Days / 4 Nights', 42000.00, 'Witness the magical sunrise from Tiger Hill, explore Darjeeling''s famous tea gardens, ride the heritage toy train, visit Buddhist monasteries, and indulge in local Tibetan cuisine.', NULL);

-- ============================================================
-- SAMPLE USERS (password: Test@1234 -> BCrypt encoded)
-- You can register via the UI for proper BCrypt passwords
-- ============================================================
-- Note: The below are placeholder hash values.
-- Register through the UI for properly encoded passwords.

-- ============================================================
-- END OF SAMPLE DATA
-- ============================================================
SELECT 'Sample data loaded successfully!' AS status;
