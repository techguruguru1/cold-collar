-- Special order requests (with optional photos) that show on the admin dashboard.
-- Safe to run more than once.

-- 1. Requests table. Only the server reads and writes it (no public policies).
CREATE TABLE IF NOT EXISTS public.special_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  item TEXT NOT NULL,
  details TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  budget TEXT,
  needed_by DATE,
  product TEXT,
  image_paths TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'handled'))
);
CREATE INDEX IF NOT EXISTS special_orders_created_at_idx ON public.special_orders (created_at DESC);
ALTER TABLE public.special_orders ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.special_orders TO service_role;

-- 2. Private storage for the photos customers attach. Only the admin can view them.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('special-order-images', 'special-order-images', false, 10485760,
        ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
