-- Add string_type and string_characteristics to inventory table
ALTER TABLE `inventory` ADD COLUMN `string_type` TEXT;
ALTER TABLE `inventory` ADD COLUMN `string_characteristics` TEXT; -- JSON array of characteristics
