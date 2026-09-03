-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "submissionCode" TEXT;

-- CreateTable
CREATE TABLE "SubmissionCounter" (
    "category" "PresentationCategory" NOT NULL,
    "lastAssigned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubmissionCounter_pkey" PRIMARY KEY ("category")
);

-- CreateIndex
CREATE UNIQUE INDEX "Submission_submissionCode_key" ON "Submission"("submissionCode");

