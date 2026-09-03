-- CreateEnum
CREATE TYPE "ReviewRating" AS ENUM ('RECOMMENDED', 'NEUTRAL', 'NOT_RECOMMENDED', 'NOT_APPLICABLE');

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "recommendation",
DROP COLUMN "score",
ADD COLUMN     "rating" "ReviewRating";

