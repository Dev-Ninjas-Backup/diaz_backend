/*
  Warnings:

  - You are about to drop the column `mission` on the `mission_vision` table. All the data in the column will be lost.
  - Added the required column `title` to the `mission_vision` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mission_vision" DROP COLUMN "mission",
ADD COLUMN     "missionTitle" TEXT,
ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ADD COLUMN     "visionTitle" TEXT;
