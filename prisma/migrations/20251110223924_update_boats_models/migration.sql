-- CreateEnum
CREATE TYPE "BoatFeatureType" AS ENUM ('ELECTRONICS', 'INSIDE_EQUIPMENT', 'OUTSIDE_EQUIPMENT', 'ELECTRICAL_EQUIPMENT', 'COVERS', 'ADDITIONAL_EQUIPMENT');

-- CreateEnum
CREATE TYPE "DataInsertSource" AS ENUM ('USER', 'SYSTEM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BoatSpecificationType" ADD VALUE 'ENGINE_TYPE';
ALTER TYPE "BoatSpecificationType" ADD VALUE 'PROP_TYPE';
ALTER TYPE "BoatSpecificationType" ADD VALUE 'PROP_MATERIAL';

-- AlterTable
ALTER TABLE "boat_specifications" ADD COLUMN     "source" "DataInsertSource" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "boats" ADD COLUMN     "additionalEquipment" TEXT[],
ADD COLUMN     "covers" TEXT[],
ADD COLUMN     "electricalEquipment" TEXT[],
ADD COLUMN     "electronics" TEXT[],
ADD COLUMN     "engineType" TEXT,
ADD COLUMN     "insideEquipment" TEXT[],
ADD COLUMN     "outsideEquipment" TEXT[],
ADD COLUMN     "propMaterial" TEXT,
ADD COLUMN     "propType" TEXT;

-- CreateTable
CREATE TABLE "boat_features" (
    "id" TEXT NOT NULL,
    "type" "BoatFeatureType" NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "source" "DataInsertSource" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "boat_features_type_name_key" ON "boat_features"("type", "name");
