-- CreateEnum
CREATE TYPE "PresentationCategory" AS ENUM ('GENERAL', 'INVITED');

-- AlterTable
ALTER TABLE "ConferenceSettings" ADD COLUMN     "generalTalkMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "invitedTalkMinutes" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "presentationCategory" "PresentationCategory" NOT NULL DEFAULT 'GENERAL';
