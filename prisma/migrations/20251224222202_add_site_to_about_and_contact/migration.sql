/*
  Warnings:

  - A unique constraint covering the columns `[site]` on the table `aboutpage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[site]` on the table `contactpage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "aboutpage" ADD COLUMN     "site" "SiteType" NOT NULL DEFAULT 'FLORIDA';

-- AlterTable
ALTER TABLE "contactpage" ADD COLUMN     "site" "SiteType" NOT NULL DEFAULT 'FLORIDA';

-- CreateIndex
CREATE UNIQUE INDEX "aboutpage_site_key" ON "aboutpage"("site");

-- CreateIndex
CREATE UNIQUE INDEX "contactpage_site_key" ON "contactpage"("site");
