-- Create storage buckets for case evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-evidence', 'case-evidence', false);

-- Create RLS policies for case evidence storage
CREATE POLICY "Users can view evidence from accessible cases" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'case-evidence' AND 
  EXISTS (
    SELECT 1 FROM public.cases 
    WHERE cases.id::text = (storage.foldername(name))[1] 
    AND (cases.created_by = auth.uid() OR public.is_analyst_or_admin())
  )
);

CREATE POLICY "Users can upload evidence to accessible cases" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'case-evidence' AND 
  EXISTS (
    SELECT 1 FROM public.cases 
    WHERE cases.id::text = (storage.foldername(name))[1] 
    AND (cases.created_by = auth.uid() OR public.is_analyst_or_admin())
  )
);

CREATE POLICY "Users can update evidence in accessible cases" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'case-evidence' AND 
  EXISTS (
    SELECT 1 FROM public.cases 
    WHERE cases.id::text = (storage.foldername(name))[1] 
    AND (cases.created_by = auth.uid() OR public.is_analyst_or_admin())
  )
);

CREATE POLICY "Users can delete evidence from accessible cases" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'case-evidence' AND 
  EXISTS (
    SELECT 1 FROM public.cases 
    WHERE cases.id::text = (storage.foldername(name))[1] 
    AND (cases.created_by = auth.uid() OR public.is_analyst_or_admin())
  )
);