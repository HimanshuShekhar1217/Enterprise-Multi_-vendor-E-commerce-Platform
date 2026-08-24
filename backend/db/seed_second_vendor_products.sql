-- Distinct starter products for the second vendor account (Sudhanshu).
-- Safe to run repeatedly because existing vendor/product names are skipped.
INSERT INTO products (name, description, price, discount_percentage, category, image_url, stock, sold_quantity, vendor_id)
SELECT item.name, item.description, item.price, item.discount_percentage, item.category, item.image_url, item.stock, 0, u.id
FROM users u
CROSS JOIN (VALUES
    ('Noise Cancelling Earbuds Pro', 'Compact wireless earbuds with active noise cancellation and a charging case.', 3499, 8, 'Audio', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900', 20),
    ('Smart LED Desk Lamp', 'Adjustable desk lamp with touch controls, warm light and USB charging.', 1899, 10, 'Home Electronics', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900', 18),
    ('USB-C Fast Charger 65W', 'Universal fast charger for phones, tablets and compatible laptops.', 2299, 5, 'Accessories', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900', 30),
    ('Portable Power Station', 'Rechargeable backup power station for travel, work and emergency use.', 12999, 12, 'Power', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=900', 8)
) AS item(name, description, price, discount_percentage, category, image_url, stock)
WHERE LOWER(u.username) = 'sudhanshu'
  AND UPPER(u.role) = 'VENDOR'
  AND NOT EXISTS (
      SELECT 1 FROM products p
      WHERE p.vendor_id = u.id AND p.name = item.name
  );
