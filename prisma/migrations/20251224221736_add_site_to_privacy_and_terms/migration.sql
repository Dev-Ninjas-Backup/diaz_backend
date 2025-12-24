/*
  Warnings:

  - A unique constraint covering the columns `[site]` on the table `privacypolicy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[site]` on the table `terms_of_services` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "privacypolicy" ADD COLUMN     "site" "SiteType" NOT NULL DEFAULT 'FLORIDA';

-- AlterTable
ALTER TABLE "terms_of_services" ADD COLUMN     "site" "SiteType" NOT NULL DEFAULT 'FLORIDA';

-- CreateIndex
CREATE UNIQUE INDEX "privacypolicy_site_key" ON "privacypolicy"("site");

-- CreateIndex
CREATE UNIQUE INDEX "terms_of_services_site_key" ON "terms_of_services"("site");
