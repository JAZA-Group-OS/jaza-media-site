-- Raise per-bucket file size limit to 100 MB for both career buckets so the
-- new direct-to-Supabase signed-URL upload flow can accept large portfolios
-- without the bucket itself rejecting the PUT.
--
-- NOTE: Supabase still enforces a project-wide cap that depends on the
-- organization's plan. On the Free plan that cap is 50 MB per file, so the
-- effective ceiling is min(plan_cap, file_size_limit). Upgrade the org to
-- Pro to actually use the full 100 MB allowed here.

UPDATE storage.buckets
  SET file_size_limit = 104857600 -- 100 MB
  WHERE id IN ('career_resumes', 'career_portfolios');
