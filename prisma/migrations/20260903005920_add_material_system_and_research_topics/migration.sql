-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "materialSystemId" TEXT,
ADD COLUMN     "primaryTopicId" TEXT,
ADD COLUMN     "secondaryTopicId" TEXT;

-- CreateTable
CREATE TABLE "MaterialSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaterialSystem_code_key" ON "MaterialSystem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchTopic_code_key" ON "ResearchTopic"("code");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_materialSystemId_fkey" FOREIGN KEY ("materialSystemId") REFERENCES "MaterialSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_primaryTopicId_fkey" FOREIGN KEY ("primaryTopicId") REFERENCES "ResearchTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_secondaryTopicId_fkey" FOREIGN KEY ("secondaryTopicId") REFERENCES "ResearchTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
