-- AlterTable
ALTER TABLE "ConferenceSettings" ALTER COLUMN "conferenceName" SET DEFAULT 'IWSO 12';

-- Update the existing settings row if it still has the placeholder name —
-- leaves it alone if the Chair already customized it via /admin/settings.
UPDATE "ConferenceSettings" SET "conferenceName" = 'IWSO 12' WHERE "conferenceName" = 'IWSO 2027';
