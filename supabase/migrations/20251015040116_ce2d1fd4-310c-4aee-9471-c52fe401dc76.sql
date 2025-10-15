-- Create table for storing sketch conversation history
CREATE TABLE public.sketch_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
  initial_description TEXT NOT NULL,
  refined_description TEXT,
  conversation_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sketch_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations for cases they have access to
CREATE POLICY "View conversations based on case access"
ON public.sketch_conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = sketch_conversations.case_id
    AND (cases.created_by = auth.uid() OR is_analyst_or_admin())
  )
);

-- Policy: Users can insert conversations for cases they have access to
CREATE POLICY "Insert conversations for accessible cases"
ON public.sketch_conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = sketch_conversations.case_id
    AND (cases.created_by = auth.uid() OR is_analyst_or_admin())
  )
);

-- Policy: Users can update conversations for cases they have access to
CREATE POLICY "Update conversations for accessible cases"
ON public.sketch_conversations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = sketch_conversations.case_id
    AND (cases.created_by = auth.uid() OR is_analyst_or_admin())
  )
);

-- Create index for faster lookups
CREATE INDEX idx_sketch_conversations_case_id ON public.sketch_conversations(case_id);
CREATE INDEX idx_sketch_conversations_media_id ON public.sketch_conversations(media_id);