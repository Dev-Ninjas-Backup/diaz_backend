/*
  Warnings:

  - You are about to drop the column `blogImage` on the `blog` table. All the data in the column will be lost.
  - Made the column `viewCount` on table `blog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `postStatus` on table `blog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "blog" DROP COLUMN "blogImage",
ADD COLUMN     "blogImageId" TEXT,
ALTER COLUMN "viewCount" SET NOT NULL,
ALTER COLUMN "postStatus" SET NOT NULL,
ALTER COLUMN "postStatus" SET DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_blogImageId_fkey" FOREIGN KEY ("blogImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
