-- CreateEnum
CREATE TYPE "BoatSpecificationType" AS ENUM ('MAKE', 'MODEL', 'ENGINE_TYPE', 'FUEL_TYPE', 'CLASS', 'MATERIAL', 'CONDITION', 'PROP_TYPE', 'PROP_MATERIAL');

-- CreateEnum
CREATE TYPE "BoatFeatureType" AS ENUM ('ELECTRONICS', 'INSIDE_EQUIPMENT', 'OUTSIDE_EQUIPMENT', 'ELECTRICAL_EQUIPMENT', 'COVERS', 'ADDITIONAL_EQUIPMENT');

-- CreateEnum
CREATE TYPE "DataInsertSource" AS ENUM ('USER', 'SYSTEM');

-- CreateTable
CREATE TABLE "boat_specifications" (
    "id" TEXT NOT NULL,
    "type" "BoatSpecificationType" NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "source" "DataInsertSource" NOT NULL DEFAULT 'USER',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_features" (
    "id" TEXT NOT NULL,
    "type" "BoatFeatureType" NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "source" "DataInsertSource" NOT NULL DEFAULT 'USER',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "boat_specifications_type_name_key" ON "boat_specifications"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "boat_features_type_name_key" ON "boat_features"("type", "name");
