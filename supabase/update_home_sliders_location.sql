-- Migration: Add location to home_sliders
ALTER TABLE public.home_sliders ADD COLUMN IF NOT EXISTS location text DEFAULT 'top';
