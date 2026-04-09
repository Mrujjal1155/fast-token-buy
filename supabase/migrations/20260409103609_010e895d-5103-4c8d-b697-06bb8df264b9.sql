
CREATE OR REPLACE FUNCTION public.deduct_stock_on_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status changes TO 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.packages
    SET stock = GREATEST(stock - 1, 0)
    WHERE package_key = NEW.package_id
      AND stock IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deduct_stock_on_complete
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.deduct_stock_on_complete();
