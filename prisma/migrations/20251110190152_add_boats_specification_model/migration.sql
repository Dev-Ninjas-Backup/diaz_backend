-- CreateEnum
CREATE TYPE "BoatSpecificationType" AS ENUM ('MAKE', 'MODEL', 'FUEL_TYPE', 'CLASS', 'MATERIAL', 'CONDITION');

-- CreateTable
CREATE TABLE "boat_specifications" (
    "id" TEXT NOT NULL,
    "type" "BoatSpecificationType" NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "boat_specifications_type_name_key" ON "boat_specifications"("type", "name");
