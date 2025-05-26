INSERT INTO app_users
(name, surname, email, phone_num, password_hash, role,
 verification_code, verification_code_expires_at, enabled)
VALUES
    (
        'Alice',
        'Administrator',
        'alice@acme.com',
        '600123456',
        '{bcrypt}$2a$12$CujBhdicFbBBOLbJr7yPSeqw76PGW6AI2.ohWqdT0VE4Olcbutd5K',  -- BCrypt hash of "admin123"
        'ROLE_ADMIN',
        NULL,
        NULL,
        TRUE
    );

INSERT INTO app_users
(name, surname, email, phone_num, password_hash, role,
 verification_code, verification_code_expires_at, enabled)
VALUES
    (
        'Bob',
        'Customer',
        'bob@acme.com',
        '600654321',
        '{bcrypt}$2a$12$NWg8doOoSXA8HpSUDv/s2ujwBANtbdkp5qQP0RtsZfro3jER6Whgm',  -- BCrypt hash of "user123"
        'ROLE_USER',
        NULL,
        NULL,
        TRUE
    );

-- Add appointment statuses
INSERT INTO appointment_statuses (name) VALUES 
('PENDING'),
('CONFIRMED'), 
('COMPLETED'),
('CANCELLED');

-- Add sample services
INSERT INTO services (name, description, duration_min, price) VALUES
('Basic Makeup', 'Natural everyday makeup application', 60, 50.00),
('Evening Makeup', 'Glamorous makeup for special occasions', 90, 80.00),
('Bridal Makeup', 'Complete bridal makeup package', 120, 150.00),
('Makeup Lesson', 'Learn to do your own makeup', 90, 70.00);
