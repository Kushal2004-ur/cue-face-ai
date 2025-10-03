-- Create settings table for system configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Admin can view and manage settings
CREATE POLICY "Admins can view settings"
  ON public.system_settings
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update settings"
  ON public.system_settings
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can insert settings"
  ON public.system_settings
  FOR INSERT
  WITH CHECK (is_admin());

-- Insert default Telegram settings
INSERT INTO public.system_settings (key, value, description)
VALUES (
  'telegram_alerts',
  '{"enabled": false, "chat_id": ""}'::jsonb,
  'Telegram bot alert configuration'
)
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_timestamp();