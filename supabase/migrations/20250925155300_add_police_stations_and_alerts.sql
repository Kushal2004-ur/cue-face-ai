-- Add police stations table for alert distribution
CREATE TABLE public.police_stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  jurisdiction_area TEXT, -- Geographic area of jurisdiction
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add alerts table for suspect match notifications
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) NOT NULL,
  suspect_id UUID REFERENCES public.suspects(id) NOT NULL,
  match_id UUID REFERENCES public.matches(id), -- Reference to the match that triggered the alert
  police_station_id UUID REFERENCES public.police_stations(id) NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'suspect_match', -- 'suspect_match', 'high_confidence_match', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'acknowledged', 'dismissed'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Additional alert data (match score, images, etc.)
  sent_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.police_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for police stations
CREATE POLICY "Officers can view police stations" ON public.police_stations
  FOR SELECT USING (public.is_officer_or_above());

CREATE POLICY "Admins can manage police stations" ON public.police_stations
  FOR ALL USING (public.is_admin());

-- Create policies for alerts
CREATE POLICY "Officers can view alerts for their cases" ON public.alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = alerts.case_id 
      AND (cases.created_by = auth.uid() OR public.is_analyst_or_admin())
    )
  );

CREATE POLICY "Analysts can manage all alerts" ON public.alerts
  FOR ALL USING (public.is_analyst_or_admin());

-- Create function to automatically send alerts for high-confidence matches
CREATE OR REPLACE FUNCTION public.create_suspect_alert(
  p_case_id UUID,
  p_suspect_id UUID,
  p_match_id UUID DEFAULT NULL,
  p_similarity_score FLOAT DEFAULT 0.0
)
RETURNS UUID AS $$
DECLARE
  alert_id UUID;
  case_info RECORD;
  suspect_info RECORD;
  priority_level TEXT;
  alert_message TEXT;
BEGIN
  -- Determine priority based on similarity score
  IF p_similarity_score >= 0.9 THEN
    priority_level := 'critical';
  ELSIF p_similarity_score >= 0.8 THEN
    priority_level := 'high';
  ELSIF p_similarity_score >= 0.7 THEN
    priority_level := 'medium';
  ELSE
    priority_level := 'low';
  END IF;

  -- Get case and suspect information
  SELECT title, description INTO case_info 
  FROM public.cases WHERE id = p_case_id;
  
  SELECT name INTO suspect_info 
  FROM public.suspects WHERE id = p_suspect_id;

  -- Create alert message
  alert_message := format(
    'Potential suspect match found for case "%s". Suspect: %s. Similarity score: %.2f',
    case_info.title,
    suspect_info.name,
    p_similarity_score
  );

  -- For now, create alerts for all police stations (in real system, would be based on jurisdiction)
  INSERT INTO public.alerts (
    case_id,
    suspect_id,
    match_id,
    police_station_id,
    alert_type,
    priority,
    message,
    metadata
  )
  SELECT 
    p_case_id,
    p_suspect_id,
    p_match_id,
    ps.id,
    'suspect_match',
    priority_level,
    alert_message,
    jsonb_build_object(
      'similarity_score', p_similarity_score,
      'case_title', case_info.title,
      'suspect_name', suspect_info.name
    )
  FROM public.police_stations ps
  RETURNING id INTO alert_id;

  RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert some sample police stations for demonstration
INSERT INTO public.police_stations (name, address, city, state, zip_code, contact_email, contact_phone, jurisdiction_area) VALUES
('Downtown Police Station', '123 Main St', 'Metro City', 'State', '12345', 'downtown@police.gov', '(555) 123-4567', 'Downtown District'),
('East Side Police Station', '456 Oak Ave', 'Metro City', 'State', '12346', 'eastside@police.gov', '(555) 234-5678', 'East District'),
('West End Police Station', '789 Pine St', 'Metro City', 'State', '12347', 'westend@police.gov', '(555) 345-6789', 'West District'),
('North Precinct', '321 Elm St', 'Metro City', 'State', '12348', 'north@police.gov', '(555) 456-7890', 'North District');

-- Create indexes for better query performance
CREATE INDEX alerts_case_id_idx ON public.alerts(case_id);
CREATE INDEX alerts_suspect_id_idx ON public.alerts(suspect_id);
CREATE INDEX alerts_station_id_idx ON public.alerts(police_station_id);
CREATE INDEX alerts_status_idx ON public.alerts(status);
CREATE INDEX alerts_priority_idx ON public.alerts(priority);
CREATE INDEX alerts_created_at_idx ON public.alerts(created_at);

-- Update function to automatically generate embeddings for suspects
CREATE OR REPLACE FUNCTION public.trigger_suspect_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create alerts for high-confidence matches (score >= 0.7)
  IF NEW.score >= 0.7 THEN
    PERFORM public.create_suspect_alert(
      NEW.case_id,
      NEW.suspect_id,
      NEW.id,
      NEW.score
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create alerts when matches are created
CREATE TRIGGER matches_alert_trigger
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.trigger_suspect_alert();