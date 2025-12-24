-- DropForeignKey
ALTER TABLE "contactpage" DROP CONSTRAINT "contactpage_contactBottomImageId_fkey";

-- DropForeignKey
ALTER TABLE "contactpage" DROP CONSTRAINT "contactpage_contactTopImageId_fkey";

-- AlterTable
ALTER TABLE "contactpage" ADD COLUMN     "contactDescription" TEXT,
ADD COLUMN     "contactTitle" VARCHAR(255),
ALTER COLUMN "contactTopImageId" DROP NOT NULL,
ALTER COLUMN "contactBottomImageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "contactpage" ADD CONSTRAINT "contactpage_contactTopImageId_fkey" FOREIGN KEY ("contactTopImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactpage" ADD CONSTRAINT "contactpage_contactBottomImageId_fkey" FOREIGN KEY ("contactBottomImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
