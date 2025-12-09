-- CreateTable
CREATE TABLE "ai_search_banners" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL,
    "aiSearchBannerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_search_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_banners" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'FLORIDA',
    "bannerTitle" TEXT NOT NULL,
    "subtitle" TEXT,
    "packageBannerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_banners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ai_search_banners" ADD CONSTRAINT "ai_search_banners_aiSearchBannerId_fkey" FOREIGN KEY ("aiSearchBannerId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_banners" ADD CONSTRAINT "package_banners_packageBannerId_fkey" FOREIGN KEY ("packageBannerId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
