INSERT INTO app_users
(name, surname, email, phone_num, password_hash, role)
VALUES
    (
        'Alice',
        'Administrator',
        'alice@acme.com',
        '600123456',
        '{bcrypt}$2a$12$CujBhdicFbBBOLbJr7yPSeqw76PGW6AI2.ohWqdT0VE4Olcbutd5K',  -- BCrypt hash of “admin123”
        'ROLE_ADMIN'
    );


INSERT INTO app_users
(name, surname, email, phone_num, password_hash, role)
VALUES
    (
        'Bob',
        'Customer',
        'bob@acme.com',
        '600654321',
        '{bcrypt}$2a$12$NWg8doOoSXA8HpSUDv/s2ujwBANtbdkp5qQP0RtsZfro3jER6Whgm',  -- BCrypt hash of “user123”
        'ROLE_USER'
    );