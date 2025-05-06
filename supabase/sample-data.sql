-- Insert sample parts data
INSERT INTO parts (slug, name, description, price, category, brand)
VALUES
  ('powerwise-36v-ezgo-charger', 'PowerWise 36V EZGO Charger', 'OEM replacement PowerWise 36V charger for EZGO golf carts', 299.99, 'chargers', 'EZGO'),
  ('club-car-solenoid-48v', 'Club Car 48V Solenoid', 'OEM replacement solenoid for 48V Club Car golf carts', 49.95, 'electrical', 'Club Car'),
  ('yamaha-g29-drive-belt', 'Yamaha Drive/G29 Drive Belt', 'Replacement drive belt for Yamaha G29 golf carts', 89.95, 'drivetrain', 'Yamaha'),
  ('precedent-shock-absorber', 'Club Car Precedent Shock Absorber', 'Front shock absorber for Club Car Precedent models', 78.50, 'suspension', 'Club Car'),
  ('universal-6v-battery-cable', 'Universal 6V Battery Cable Set', 'Complete battery cable set for 6V systems, fits multiple brands', 32.99, 'electrical', 'Universal');

-- Verify data was inserted correctly
SELECT COUNT(*) FROM parts; 