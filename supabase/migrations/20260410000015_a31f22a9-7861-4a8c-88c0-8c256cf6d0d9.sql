
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Schedule auto_fail_expired_orders to run every 5 minutes
SELECT cron.schedule(
  'auto-fail-expired-orders',
  '*/5 * * * *',
  $$SELECT public.auto_fail_expired_orders()$$
);
