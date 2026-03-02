-- Add `site` column to our_team with default FLORIDA
ALTER TABLE "our_team"
ADD COLUMN IF NOT EXISTS "site" "SiteType" NOT NULL DEFAULT 'FLORIDA';

-- Create index on site for faster filtering
CREATE INDEX IF NOT EXISTS "our_team_site_idx" ON "our_team"("site");

