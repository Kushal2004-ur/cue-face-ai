-- Phase 1: Critical Database Security Fixes

-- Enable Row-Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspect_embeddings ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_analyst_or_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() IN ('analyst', 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_officer_or_above()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() IN ('officer', 'analyst', 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

-- Cases table policies
CREATE POLICY "Officers can view cases they created" ON public.cases
  FOR SELECT USING (auth.uid() = created_by OR public.is_analyst_or_admin());

CREATE POLICY "Officers can create cases" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = created_by AND public.is_officer_or_above());

CREATE POLICY "Analysts can update cases" ON public.cases
  FOR UPDATE USING (public.is_analyst_or_admin());

-- Suspects table policies
CREATE POLICY "Officers can view suspects" ON public.suspects
  FOR SELECT USING (public.is_officer_or_above());

CREATE POLICY "Analysts can manage suspects" ON public.suspects
  FOR ALL USING (public.is_analyst_or_admin());

-- Media table policies
CREATE POLICY "View media based on case access" ON public.media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = media.case_id 
      AND (cases.created_by = auth.uid() OR public.is_analyst_or_admin())
    )
  );

CREATE POLICY "Insert media for accessible cases" ON public.media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = media.case_id 
      AND (cases.created_by = auth.uid() OR public.is_analyst_or_admin())
    )
  );

-- Matches table policies
CREATE POLICY "View matches based on case access" ON public.matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = matches.case_id 
      AND (cases.created_by = auth.uid() OR public.is_analyst_or_admin())
    )
  );

-- Suspect embeddings policies
CREATE POLICY "View embeddings for accessible suspects" ON public.suspect_embeddings
  FOR SELECT USING (public.is_officer_or_above());

CREATE POLICY "System can manage embeddings" ON public.suspect_embeddings
  FOR ALL USING (public.is_analyst_or_admin());

-- Audit logs policies (Admin only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can create audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (action, target_type, target_id, actor_id, payload)
  VALUES (p_action, p_target_type, p_target_id, auth.uid(), p_payload);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;