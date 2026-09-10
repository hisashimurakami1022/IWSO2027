-- Add structured affiliation fields.
ALTER TABLE "Submission" ADD COLUMN     "affiliations" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SubmissionAuthor" ADD COLUMN     "affiliationIndexes" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Backfill Submission.affiliations: each submission's distinct author
-- affiliations, ordered by the first author (by `order`) that used them.
WITH ranked AS (
    SELECT
        sa."submissionId"       AS sid,
        btrim(sa."affiliation") AS aff,
        MIN(sa."order")         AS first_order
    FROM "SubmissionAuthor" sa
    WHERE sa."affiliation" IS NOT NULL AND btrim(sa."affiliation") <> ''
    GROUP BY sa."submissionId", btrim(sa."affiliation")
),
agg AS (
    SELECT sid, array_agg(aff ORDER BY first_order, aff) AS affs
    FROM ranked
    GROUP BY sid
)
UPDATE "Submission" s
SET "affiliations" = agg.affs
FROM agg
WHERE agg.sid = s."id";

-- Backfill SubmissionAuthor.affiliationIndexes from the new list (1-based).
UPDATE "SubmissionAuthor" sa
SET "affiliationIndexes" = ARRAY[array_position(s."affiliations", btrim(sa."affiliation"))]
FROM "Submission" s
WHERE s."id" = sa."submissionId"
  AND sa."affiliation" IS NOT NULL
  AND btrim(sa."affiliation") <> ''
  AND array_position(s."affiliations", btrim(sa."affiliation")) IS NOT NULL;

-- Drop the old free-text column.
ALTER TABLE "SubmissionAuthor" DROP COLUMN "affiliation";
