/*
  Warnings:

  - You are about to drop the column `aboutBottomSubTitle` on the `aboutpage` table. All the data in the column will be lost.
  - You are about to drop the column `aboutBottomTitle` on the `aboutpage` table. All the data in the column will be lost.
  - You are about to drop the column `aboutBottonImageId` on the `aboutpage` table. All the data in the column will be lost.
  - You are about to drop the column `aboutTopImageId` on the `aboutpage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "aboutpage" DROP CONSTRAINT "aboutpage_aboutBottonImageId_fkey";

-- DropForeignKey
ALTER TABLE "aboutpage" DROP CONSTRAINT "aboutpage_aboutTopImageId_fkey";

-- DropIndex
DROP INDEX "aboutpage_aboutBottonImageId_key";

-- DropIndex
DROP INDEX "aboutpage_aboutTopImageId_key";

-- AlterTable
ALTER TABLE "aboutpage" DROP COLUMN "aboutBottomSubTitle",
DROP COLUMN "aboutBottomTitle",
DROP COLUMN "aboutBottonImageId",
DROP COLUMN "aboutTopImageId";
