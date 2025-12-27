-- Add missing INSERT, UPDATE, DELETE policies for matches table
-- Only analysts and admins can create matches
CREATE POLICY "Analysts can create matches"
ON public.matches
FOR INSERT
WITH CHECK (is_analyst_or_admin());

-- Only analysts and admins can update matches
CREATE POLICY "Analysts can update matches"
ON public.matches
FOR UPDATE
USING (is_analyst_or_admin());

-- Only analysts and admins can delete matches
CREATE POLICY "Analysts can delete matches"
ON public.matches
FOR DELETE
USING (is_analyst_or_admin());