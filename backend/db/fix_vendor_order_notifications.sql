-- Run once against the shopstack PostgreSQL database.
-- This keeps existing orders and adds the notification-read flag required by
-- the customer/vendor order notification queries.
ALTER TABLE vendor_orders
    ADD COLUMN IF NOT EXISTS customer_notification_read boolean NOT NULL DEFAULT false;
