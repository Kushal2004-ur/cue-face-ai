-- Fix users table RLS policies to be more secure and explicit
-- Drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create secure policies that explicitly require authentication
CREATE POLICY "Authenticated users can view their own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all user profiles" 
ON public.users 
FOR SELECT 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Authenticated users can update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can update all user profiles" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (public.is_admin());

-- Ensure no INSERT or DELETE policies exist for additional security
-- Users are created automatically via trigger, so no manual INSERT should be allowed
-- DELETE should never be allowed to preserve audit trail