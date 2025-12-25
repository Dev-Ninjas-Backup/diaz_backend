-- CreateTable
CREATE TABLE "featured_yachts" (
    "id" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "site" "SiteType" NOT NULL,
    "featuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_yachts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "featured_yachts_site_key" ON "featured_yachts"("site");

-- AddForeignKey
ALTER TABLE "featured_yachts" ADD CONSTRAINT "featured_yachts_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
