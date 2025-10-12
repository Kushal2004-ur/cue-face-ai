-- Add DELETE policy for cases table
-- Officers can delete their own cases, Analysts and Admins can delete any case
CREATE POLICY "Officers can delete own cases, analysts can delete any"
ON public.cases
FOR DELETE
USING (
  (auth.uid() = created_by) OR is_analyst_or_admin()
);