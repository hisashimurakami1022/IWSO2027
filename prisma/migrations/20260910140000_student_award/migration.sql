-- Student Award: a per-track opt-in flag, plus per-submission application
-- fields (all optional).

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "studentAward" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "studentAwardApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supervisorEmail" TEXT,
ADD COLUMN     "supervisorName" TEXT;
