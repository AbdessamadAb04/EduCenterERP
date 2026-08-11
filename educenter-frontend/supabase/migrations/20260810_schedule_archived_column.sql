-- ============================================================
-- Migration: Add archived flag to schedule_classes
--
-- The "archive session" UI in the Classes module needs a soft
-- archive for schedule sessions. The live table only has the
-- class_status enum on classes, and no status/archived column
-- on schedule_classes (see documentation/DB_full_config.md).
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor).
-- Safe to re-run.
--
-- NOTE: schedule_classes.day is smallint with a CHECK constraint
-- (schedule_events_day_check) whose expression is not exported in
-- documentation/DB_full_config.md. The app writes 0-6 (Monday=0).
-- If inserts fail with a check violation, the live check is 1-7
-- and the UI day mapping must be offset by +1.
-- ============================================================

ALTER TABLE public.schedule_classes
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
