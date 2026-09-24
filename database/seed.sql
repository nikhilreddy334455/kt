-- Campus Lost & Found Sample Seed Data
-- Inserts realistic campus items across all target domains

INSERT INTO items (id, report_type, category, title, description, image_url, location, event_time, contact_info, status)
VALUES
(
    '70b97ece-6387-49b9-b402-454b75266bcb',
    'lost',
    'Miscellaneous',
    'Blue 32oz Hydro Flask Water Bottle',
    'Dark blue wide-mouth Hydroflask with a silver cap and a noticeable small dent near the bottom rim. Has a Yosemite National Park vinyl sticker on the side.',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    'Main University Library 2nd Floor Study Cubicles',
    '2026-09-18 11:07:29+05:30',
    'student.lost@campus.edu',
    'active'
),
(
    'f3146be1-22b0-4872-b0fb-e105779db58f',
    'found',
    'Miscellaneous',
    'Found Blue Hydro Flask with sticker',
    'Found a 32oz cobalt blue Hydroflask bottle with silver metal cap. Features a round national park sticker and a small dent along the lower base.',
    'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=800&q=80',
    'Library Quad Outdoor Benches near fountain',
    '2026-09-18 13:07:29+05:30',
    'campus.security@campus.edu',
    'active'
),
(
    '51f4d217-808a-4ace-81bb-1733b9d7e154',
    'lost',
    'Electronics',
    'Apple AirPods Pro Gen 2 with Black Silicone Case',
    'AirPods Pro 2 in a matte black Spigen silicone case with a small carabiner clip. Left earbud has tiny scratch on the stem.',
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    'Science Center Lecture Hall B10',
    '2026-09-18 04:07:29+05:30',
    'alex.w@campus.edu',
    'active'
),
(
    '959ff397-cca4-45f2-afa5-e2791e7f90ac',
    'found',
    'Electronics',
    'AirPods in Black Case',
    'White wireless ear buds inside a protective dark black rubbery case. Found tucked between row 4 lecture chairs.',
    'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80',
    'Science Center Lecture Hall B10 front row podium',
    '2026-09-18 08:07:29+05:30',
    'scicenter.helpdesk@campus.edu',
    'active'
),
(
    'a1d05d47-5144-4882-b7a2-259f6ff1ee80',
    'lost',
    'IDs & Wallets',
    'Brown Leather Bi-fold Wallet with Student ID',
    'Vintage brown Fossil leather wallet containing campus card for Nikhil Reddy, driver license, and blue transit pass.',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    'Student Dining Commons - North Entrance',
    '2026-09-17 16:07:29+05:30',
    'nikhil.r@campus.edu',
    'active'
),
(
    '04ec8ee0-d103-44f0-9c1d-edb70812cf96',
    'found',
    'Clothing',
    'Navy Blue Patagonia Fleece Pullover (Medium)',
    'Men navy blue quarter-zip fleece jacket. Left breast Patagonia logo, size M label, very good condition.',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    'Gymnasium Locker Room Bench',
    '2026-09-18 10:07:29+05:30',
    'gym.desk@campus.edu',
    'active'
),
(
    '445d7189-5661-438c-885c-ce5cb0e97ad5',
    'lost',
    'Keys',
    'Subaru Car Key + Dorm Key on Red Lanyard',
    'Black electronic Subaru fob key ring with brass dorm room key #314 and red university alumni woven lanyard.',
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
    'North Campus Parking Structure Level 2',
    '2026-09-17 22:07:29+05:30',
    'jordan.k@campus.edu',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Initial Matches sample
INSERT INTO item_matches (lost_item_id, found_item_id, confidence_score, explanation)
VALUES
(
    '70b97ece-6387-49b9-b402-454b75266bcb',
    'f3146be1-22b0-4872-b0fb-e105779db58f',
    94,
    'Both items are 32oz blue Hydro Flasks with silver caps, identical Yosemite/national park vinyl stickers, and a specific dent on the bottom rim. Locations (Library 2nd floor and adjacent Quad benches) and timeline are directly consistent.'
),
(
    '51f4d217-808a-4ace-81bb-1733b9d7e154',
    '959ff397-cca4-45f2-afa5-e2791e7f90ac',
    91,
    'Both reports describe Apple AirPods in black silicone protective cases discovered in the exact same Science Center Lecture Hall B10. Timeline indicates the found report occurred 4 hours after the loss.'
)
ON CONFLICT (lost_item_id, found_item_id) DO UPDATE
SET confidence_score = EXCLUDED.confidence_score,
    explanation = EXCLUDED.explanation;
