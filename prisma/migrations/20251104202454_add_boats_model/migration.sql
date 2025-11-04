-- CreateEnum
CREATE TYPE "BoatCondition" AS ENUM ('NEW', 'USED', 'REFURBISHED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "BoatFuelType" AS ENUM ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'OTHER');

-- CreateEnum
CREATE TYPE "BoatClass" AS ENUM ('SAILBOAT', 'MOTORBOAT', 'YACHT', 'FISHING', 'PONTOON', 'SPEEDBOAT', 'CATAMARAN', 'OTHER');

-- CreateEnum
CREATE TYPE "BoatMaterial" AS ENUM ('FIBERGLASS', 'ALUMINUM', 'WOOD', 'STEEL', 'CARBON_FIBER', 'PLASTIC', 'OTHER');

-- CreateEnum
CREATE TYPE "BoatPropellerType" AS ENUM ('FIXED', 'FOLDING', 'FEATHERING', 'SURFACE_PIERCING', 'CONTROLLABLE_PITCH', 'OTHER');

-- CreateEnum
CREATE TYPE "BoatImageType" AS ENUM ('COVER', 'GALLERY');

-- CreateTable
CREATE TABLE "boats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "buildYear" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "fuelType" "BoatFuelType" NOT NULL,
    "class" "BoatClass" NOT NULL,
    "material" "BoatMaterial" NOT NULL,
    "condition" "BoatCondition" NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "beam" DOUBLE PRECISION NOT NULL,
    "draft" DOUBLE PRECISION NOT NULL,
    "enginesNumber" INTEGER NOT NULL,
    "cabinsNumber" INTEGER NOT NULL,
    "headsNumber" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "extraDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_engines" (
    "id" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "horsepower" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "fuelType" "BoatFuelType" NOT NULL,
    "propellerType" "BoatPropellerType" NOT NULL,
    "boatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_engines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_images" (
    "id" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "imageType" "BoatImageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "boats" ADD CONSTRAINT "boats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_engines" ADD CONSTRAINT "boat_engines_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_images" ADD CONSTRAINT "boat_images_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_images" ADD CONSTRAINT "boat_images_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
