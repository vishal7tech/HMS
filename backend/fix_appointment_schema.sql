-- Fix appointment table column name from date_time to slot_time
ALTER TABLE appointments CHANGE COLUMN date_time slot_time DATETIME NOT NULL;
