-- migrate:up
ALTER TABLE users
  MODIFY COLUMN password VARCHAR(20) NULL;

-- migrate:down
ALTER TABLE users
  MODIFY COLUMN password VARCHAR(255) NULL;
