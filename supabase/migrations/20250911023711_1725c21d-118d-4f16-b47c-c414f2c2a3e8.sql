-- Create user profile trigger for new registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'officer'  -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix the vector extension security warning by moving it to a dedicated schema
CREATE SCHEMA IF NOT EXISTS extensions;
-- Note: Extension movement requires manual intervention by Supabase team
-- This is documented in the security linter results

-- Add audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.create_audit_log(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add audit triggers to critical tables
CREATE TRIGGER cases_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER suspects_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.suspects
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER users_audit_trigger
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();