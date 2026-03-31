
-- Allow first admin setup: if no admins exist, anyone authenticated can insert their own admin role
CREATE OR REPLACE FUNCTION public.setup_first_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only works if no admin exists yet
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, 'admin');
  RETURN true;
END;
$$;
