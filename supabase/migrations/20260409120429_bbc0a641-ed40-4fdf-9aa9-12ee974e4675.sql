
-- Function to auto-fail pending orders older than 30 minutes
CREATE OR REPLACE FUNCTION public.auto_fail_expired_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.orders
  SET status = 'failed', 
      admin_notes = COALESCE(admin_notes, '') || ' [Auto-failed: payment timeout 30 min]',
      updated_at = now()
  WHERE status = 'pending'
    AND created_at < now() - interval '30 minutes';
  
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
