-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_secondaryTopicId_fkey";

-- AlterTable
ALTER TABLE "MaterialSystem" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ResearchTopic" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SecondaryTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecondaryTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecondaryTopic_code_key" ON "SecondaryTopic"("code");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_secondaryTopicId_fkey" FOREIGN KEY ("secondaryTopicId") REFERENCES "SecondaryTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
