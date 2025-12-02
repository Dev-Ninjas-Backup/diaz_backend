-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('HOME', 'BLOG', 'CONTACT', 'SEARCH', 'PRIVACY_POLICY', 'TERMS_AND_CONDITION');

-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('FLORIDA', 'JUPITER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL');

-- CreateTable
CREATE TABLE "page_banners" (
    "id" TEXT NOT NULL,
    "page" "PageType" NOT NULL,
    "site" "SiteType" NOT NULL,
    "bannerTitle" TEXT NOT NULL,
    "subtitle" TEXT,
    "logoId" TEXT,
    "backgroundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog" (
    "id" TEXT NOT NULL,
    "blogImageId" TEXT,
    "blogTitle" VARCHAR(255) NOT NULL,
    "blogDescription" TEXT NOT NULL,
    "sharedLink" VARCHAR(255) NOT NULL,
    "readTime" INTEGER DEFAULT 5,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "postStatus" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "logoId" TEXT,
    "newListingSubmitted" BOOLEAN NOT NULL DEFAULT true,
    "newSellerRegistration" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_blogImage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_blogImage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_sharedLink_key" ON "blog"("sharedLink");

-- CreateIndex
CREATE INDEX "_blogImage_B_index" ON "_blogImage"("B");

-- AddForeignKey
ALTER TABLE "page_banners" ADD CONSTRAINT "page_banners_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_banners" ADD CONSTRAINT "page_banners_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_blogImageId_fkey" FOREIGN KEY ("blogImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blogImage" ADD CONSTRAINT "_blogImage_A_fkey" FOREIGN KEY ("A") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blogImage" ADD CONSTRAINT "_blogImage_B_fkey" FOREIGN KEY ("B") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
