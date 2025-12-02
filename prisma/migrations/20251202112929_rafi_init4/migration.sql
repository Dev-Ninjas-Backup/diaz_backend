/*
  Warnings:

  - You are about to drop the column `aboutBottomImage` on the `aboutpage` table. All the data in the column will be lost.
  - You are about to drop the column `aboutTopImage` on the `aboutpage` table. All the data in the column will be lost.
  - You are about to drop the column `contactBottomImage` on the `contactpage` table. All the data in the column will be lost.
  - You are about to drop the column `contactTopImage` on the `contactpage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aboutTopImageId]` on the table `aboutpage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aboutBottonImageId]` on the table `aboutpage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactTopImageId]` on the table `contactpage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactBottomImageId]` on the table `contactpage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactBottomImageId` to the `contactpage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactTopImageId` to the `contactpage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "aboutpage" DROP COLUMN "aboutBottomImage",
DROP COLUMN "aboutTopImage",
ADD COLUMN     "aboutBottonImageId" TEXT,
ADD COLUMN     "aboutTopImageId" TEXT;

-- AlterTable
ALTER TABLE "contactpage" DROP COLUMN "contactBottomImage",
DROP COLUMN "contactTopImage",
ADD COLUMN     "contactBottomImageId" TEXT NOT NULL,
ADD COLUMN     "contactTopImageId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "aboutpage_aboutTopImageId_key" ON "aboutpage"("aboutTopImageId");

-- CreateIndex
CREATE UNIQUE INDEX "aboutpage_aboutBottonImageId_key" ON "aboutpage"("aboutBottonImageId");

-- CreateIndex
CREATE UNIQUE INDEX "contactpage_contactTopImageId_key" ON "contactpage"("contactTopImageId");

-- CreateIndex
CREATE UNIQUE INDEX "contactpage_contactBottomImageId_key" ON "contactpage"("contactBottomImageId");

-- AddForeignKey
ALTER TABLE "aboutpage" ADD CONSTRAINT "aboutpage_aboutTopImageId_fkey" FOREIGN KEY ("aboutTopImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aboutpage" ADD CONSTRAINT "aboutpage_aboutBottonImageId_fkey" FOREIGN KEY ("aboutBottonImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactpage" ADD CONSTRAINT "contactpage_contactTopImageId_fkey" FOREIGN KEY ("contactTopImageId") REFERENCES "file_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactpage" ADD CONSTRAINT "contactpage_contactBottomImageId_fkey" FOREIGN KEY ("contactBottomImageId") REFERENCES "file_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
