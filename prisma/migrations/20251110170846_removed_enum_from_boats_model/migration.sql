/*
  Warnings:

  - Changed the type of `fuelType` on the `boat_engines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `propellerType` on the `boat_engines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fuelType` on the `boats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `class` on the `boats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `material` on the `boats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `condition` on the `boats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "boat_engines" DROP COLUMN "fuelType",
ADD COLUMN     "fuelType" TEXT NOT NULL,
DROP COLUMN "propellerType",
ADD COLUMN     "propellerType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "boats" DROP COLUMN "fuelType",
ADD COLUMN     "fuelType" TEXT NOT NULL,
DROP COLUMN "class",
ADD COLUMN     "class" TEXT NOT NULL,
DROP COLUMN "material",
ADD COLUMN     "material" TEXT NOT NULL,
DROP COLUMN "condition",
ADD COLUMN     "condition" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."BoatClass";

-- DropEnum
DROP TYPE "public"."BoatCondition";

-- DropEnum
DROP TYPE "public"."BoatFuelType";

-- DropEnum
DROP TYPE "public"."BoatMaterial";

-- DropEnum
DROP TYPE "public"."BoatPropellerType";
