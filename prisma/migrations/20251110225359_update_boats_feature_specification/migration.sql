-- AlterTable
ALTER TABLE "boat_features" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "boat_specifications" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
