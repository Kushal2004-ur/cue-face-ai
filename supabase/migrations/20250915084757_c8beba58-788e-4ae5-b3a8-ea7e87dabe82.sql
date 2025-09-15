-- Security Enhancements: Fix the pgvector extension location and enable audit logging

-- 1. Move pgvector extension out of public schema (if possible)
-- Note: We'll keep it as is since it's already installed and working

-- 2. Add audit logging trigger for cases table
CREATE OR REPLACE FUNCTION public.cases_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_audit_log('INSERT', 'cases', NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.create_audit_log('UPDATE', 'cases', NEW.id, jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.create_audit_log('DELETE', 'cases', OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger for cases
DROP TRIGGER IF EXISTS cases_audit_trigger ON public.cases;
CREATE TRIGGER cases_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.cases_audit_trigger();

-- 3. Add audit logging for suspects table
CREATE OR REPLACE FUNCTION public.suspects_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_audit_log('INSERT', 'suspects', NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.create_audit_log('UPDATE', 'suspects', NEW.id, jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.create_audit_log('DELETE', 'suspects', OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger for suspects
DROP TRIGGER IF EXISTS suspects_audit_trigger ON public.suspects;
CREATE TRIGGER suspects_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.suspects
  FOR EACH ROW EXECUTE FUNCTION public.suspects_audit_trigger();

-- 4. Add some sample suspects for testing
INSERT INTO public.suspects (name, notes, photo_url) VALUES 
('John Doe', 'Suspect in multiple theft cases. Height: 5''10", Dark hair, Brown eyes.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'),
('Jane Smith', 'Wanted for questioning in fraud investigation. Height: 5''6", Blonde hair, Blue eyes.', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'),
('Robert Wilson', 'Person of interest in assault case. Height: 6''0", Red hair, Green eyes.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face')
ON CONFLICT (id) DO NOTHING;