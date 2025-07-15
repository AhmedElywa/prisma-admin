-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "settings" JSONB DEFAULT '{}';
