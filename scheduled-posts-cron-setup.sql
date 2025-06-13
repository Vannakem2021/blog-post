-- ========================================
-- SCHEDULED POSTS CRON JOB SETUP
-- ========================================
-- Run this in Supabase SQL Editor to set up automatic publishing
-- This requires the pg_cron extension to be enabled

-- 1. Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the publish_scheduled_posts function to run every minute
-- This will automatically publish posts that are scheduled and ready
SELECT cron.schedule(
  'publish-scheduled-posts',           -- Job name
  '* * * * *',                        -- Cron expression: every minute
  'SELECT public.publish_scheduled_posts();'  -- SQL command to execute
);

-- 3. Optional: Schedule a cleanup job to remove old log entries (runs daily at 2 AM)
SELECT cron.schedule(
  'cleanup-scheduled-posts-logs',
  '0 2 * * *',                        -- Daily at 2 AM
  'DELETE FROM public.scheduled_posts_log WHERE executed_at < NOW() - INTERVAL ''30 days'';'
);

-- 4. Optional: Schedule audit log cleanup (runs weekly on Sunday at 3 AM)
SELECT cron.schedule(
  'cleanup-schedule-audit-logs',
  '0 3 * * 0',                        -- Weekly on Sunday at 3 AM
  'DELETE FROM public.post_schedule_audit WHERE created_at < NOW() - INTERVAL ''90 days'';'
);

-- 5. View all scheduled cron jobs to verify setup
SELECT * FROM cron.job;

-- 6. To manually test the publishing function, run:
-- SELECT public.publish_scheduled_posts();

-- 7. To view recent publishing activity:
-- SELECT * FROM public.scheduled_posts_log ORDER BY executed_at DESC LIMIT 10;

-- 8. To view schedule change audit trail:
-- SELECT 
--   psa.*,
--   p.title,
--   pr.full_name as user_name
-- FROM public.post_schedule_audit psa
-- LEFT JOIN public.posts p ON psa.post_id = p.id
-- LEFT JOIN public.profiles pr ON psa.user_id = pr.id
-- ORDER BY psa.created_at DESC 
-- LIMIT 20;

-- ========================================
-- CRON JOB MANAGEMENT COMMANDS
-- ========================================

-- To disable the publishing cron job:
-- SELECT cron.unschedule('publish-scheduled-posts');

-- To re-enable with different schedule:
-- SELECT cron.schedule('publish-scheduled-posts', '*/5 * * * *', 'SELECT public.publish_scheduled_posts();');

-- To view cron job execution history:
-- SELECT * FROM cron.job_run_details WHERE jobname = 'publish-scheduled-posts' ORDER BY start_time DESC LIMIT 10;

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If posts are not publishing automatically, check:
-- 1. Is pg_cron extension enabled? SELECT * FROM pg_extension WHERE extname = 'pg_cron';
-- 2. Are cron jobs running? SELECT * FROM cron.job WHERE active = true;
-- 3. Any errors in job execution? SELECT * FROM cron.job_run_details WHERE status = 'failed';
-- 4. Test the function manually: SELECT public.publish_scheduled_posts();
-- 5. Check if there are posts ready to publish:
--    SELECT * FROM public.posts WHERE status = 'scheduled' AND auto_publish = true AND scheduled_at <= NOW();

-- Setup completed! Your scheduled posts will now be automatically published.
