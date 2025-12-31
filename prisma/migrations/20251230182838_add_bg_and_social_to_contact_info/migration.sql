/*
  Warnings:

  - A unique constraint covering the columns `[backgroundImageId]` on the table `contact_info` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "contact_info" ADD COLUMN     "backgroundImageId" TEXT,
ADD COLUMN     "socialMedia" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "contact_info_backgroundImageId_key" ON "contact_info"("backgroundImageId");

-- AddForeignKey
ALTER TABLE "contact_info" ADD CONSTRAINT "contact_info_backgroundImageId_fkey" FOREIGN KEY ("backgroundImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
