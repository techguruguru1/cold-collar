-- Payment settings the admin can edit from the dashboard (Bitcoin address and QR image).
-- Safe to run more than once.

-- 1. Settings table. Only the server reads and writes it (no public policies).
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.site_settings TO service_role;

-- 2. Public storage for the QR image customers scan at checkout.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-assets', 'payment-assets', true, 5242880,
        ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
