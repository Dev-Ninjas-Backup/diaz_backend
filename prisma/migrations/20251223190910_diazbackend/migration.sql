-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('HOME', 'BLOG', 'CONTACT', 'SEARCH', 'PRIVACY_POLICY', 'TERMS_AND_CONDITION');

-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('FLORIDA', 'JUPITER');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BoatSpecificationType" AS ENUM ('MAKE', 'MODEL', 'ENGINE_TYPE', 'FUEL_TYPE', 'CLASS', 'MATERIAL', 'CONDITION', 'PROP_TYPE', 'PROP_MATERIAL');

-- CreateEnum
CREATE TYPE "BoatFeatureType" AS ENUM ('ELECTRONICS', 'INSIDE_EQUIPMENT', 'OUTSIDE_EQUIPMENT', 'ELECTRICAL_EQUIPMENT', 'COVERS', 'ADDITIONAL_EQUIPMENT');

-- CreateEnum
CREATE TYPE "DataInsertSource" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BoatListingStatus" AS ENUM ('ONBOARDING_PENDING', 'DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SOLD');

-- CreateEnum
CREATE TYPE "BoatImageType" AS ENUM ('COVER', 'GALLERY');

-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('FLORIDA', 'JUPITER');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('INDIVIDUAL_LISTING', 'GLOBAL');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('image', 'docs', 'link', 'document', 'any', 'video', 'audio');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'PENDING', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('UPCOMING', 'PAID', 'PAST_DUE', 'FAILED', 'VOID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SELLER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('VERIFICATION', 'RESET');

-- CreateTable
CREATE TABLE "ai_search_banners" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'JUPITER',
    "bannerTitle" TEXT NOT NULL,
    "subtitle" TEXT,
    "aiSearchBannerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_search_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_banners" (
    "id" TEXT NOT NULL,
    "page" "PageType" NOT NULL,
    "site" "SiteType" NOT NULL,
    "bannerTitle" TEXT NOT NULL,
    "subtitle" TEXT,
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
    "postStatus" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_specifications" (
    "id" TEXT NOT NULL,
    "type" "BoatSpecificationType" NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "source" "DataInsertSource" NOT NULL DEFAULT 'USER',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_features" (
    "id" TEXT NOT NULL,
    "type" "BoatFeatureType" NOT NULL,
    "name" TEXT NOT NULL,
    "meta" JSONB,
    "source" "DataInsertSource" NOT NULL DEFAULT 'USER',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boats" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "buildYear" INTEGER NOT NULL,
    "description" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "engineType" TEXT,
    "propType" TEXT,
    "propMaterial" TEXT,
    "electronics" TEXT[],
    "insideEquipment" TEXT[],
    "outsideEquipment" TEXT[],
    "electricalEquipment" TEXT[],
    "covers" TEXT[],
    "additionalEquipment" TEXT[],
    "length" DOUBLE PRECISION NOT NULL,
    "beam" DOUBLE PRECISION NOT NULL,
    "draft" DOUBLE PRECISION NOT NULL,
    "enginesNumber" INTEGER NOT NULL,
    "cabinsNumber" INTEGER NOT NULL,
    "headsNumber" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "extraDetails" JSONB,
    "status" "BoatListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoURL" TEXT,

    CONSTRAINT "boats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_engines" (
    "id" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "horsepower" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "propellerType" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_engines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_images" (
    "id" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "imageType" "BoatImageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boat_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" "ContactSource" NOT NULL,
    "type" "ContactType" NOT NULL,
    "listingId" TEXT,
    "listingSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "florida_leads" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "florida_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aboutpage" (
    "id" TEXT NOT NULL,
    "aboutTopImageId" TEXT,
    "aboutBottonImageId" TEXT,
    "aboutBottomTitle" VARCHAR(255) NOT NULL,
    "aboutBottomSubTitle" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aboutpage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactpage" (
    "id" TEXT NOT NULL,
    "contactTopImageId" TEXT NOT NULL,
    "contactBottomImageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contactpage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacypolicy" (
    "id" TEXT NOT NULL,
    "privacyTitle" VARCHAR(255) NOT NULL,
    "privacyDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacypolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_of_services" (
    "id" TEXT NOT NULL,
    "termsTitle" VARCHAR(255) NOT NULL,
    "termsDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_of_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_brands" (
    "id" TEXT NOT NULL,
    "featuredbrandId" TEXT,
    "site" "SiteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_instances" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL DEFAULT 'any',
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "visitor_sessions" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "page" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER,

    CONSTRAINT "visitor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "description" TEXT,
    "benefits" TEXT[],
    "picLimit" INTEGER NOT NULL DEFAULT 5,
    "wordLimit" INTEGER NOT NULL DEFAULT 500,
    "isBest" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeProductId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "price" DOUBLE PRECISION NOT NULL,
    "billingPeriodMonths" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stripeTransactionId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "planStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planEndedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "promoCodeId" TEXT,
    "billingCycle" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "stripeCouponId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION,
    "freeMonths" INTEGER,
    "maxRedemptions" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "InvoiceStatus" NOT NULL,
    "paidAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "googleId" TEXT,
    "phone" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Unnamed User',
    "avatarUrl" TEXT DEFAULT 'https://www.gravatar.com/avatar/000000000000000000000000000000?d=mp&f=y',
    "country" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'SELLER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "lastLogoutAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpType" "OtpType",
    "stripeCustomerId" TEXT,
    "currentPlanId" TEXT,
    "currentPlanStatus" "SubscriptionStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "boat_specifications_type_name_key" ON "boat_specifications"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "boat_features_type_name_key" ON "boat_features"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "boats_listingId_key" ON "boats"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "aboutpage_aboutTopImageId_key" ON "aboutpage"("aboutTopImageId");

-- CreateIndex
CREATE UNIQUE INDEX "aboutpage_aboutBottonImageId_key" ON "aboutpage"("aboutBottonImageId");

-- CreateIndex
CREATE UNIQUE INDEX "contactpage_contactTopImageId_key" ON "contactpage"("contactTopImageId");

-- CreateIndex
CREATE UNIQUE INDEX "contactpage_contactBottomImageId_key" ON "contactpage"("contactBottomImageId");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_userId_notificationId_key" ON "user_notifications"("userId", "notificationId");

-- CreateIndex
CREATE INDEX "visitor_sessions_ip_idx" ON "visitor_sessions"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_stripeProductId_key" ON "subscription_plans"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_stripePriceId_key" ON "subscription_plans"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripeTransactionId_key" ON "user_subscriptions"("stripeTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripeSubscriptionId_key" ON "user_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_stripeCouponId_key" ON "promo_codes"("stripeCouponId");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "_blogImage_B_index" ON "_blogImage"("B");

-- AddForeignKey
ALTER TABLE "ai_search_banners" ADD CONSTRAINT "ai_search_banners_aiSearchBannerId_fkey" FOREIGN KEY ("aiSearchBannerId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_banners" ADD CONSTRAINT "page_banners_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_blogImageId_fkey" FOREIGN KEY ("blogImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boats" ADD CONSTRAINT "boats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_engines" ADD CONSTRAINT "boat_engines_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_images" ADD CONSTRAINT "boat_images_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_images" ADD CONSTRAINT "boat_images_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "florida_leads" ADD CONSTRAINT "florida_leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "florida_leads" ADD CONSTRAINT "florida_leads_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aboutpage" ADD CONSTRAINT "aboutpage_aboutTopImageId_fkey" FOREIGN KEY ("aboutTopImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aboutpage" ADD CONSTRAINT "aboutpage_aboutBottonImageId_fkey" FOREIGN KEY ("aboutBottonImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactpage" ADD CONSTRAINT "contactpage_contactTopImageId_fkey" FOREIGN KEY ("contactTopImageId") REFERENCES "file_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactpage" ADD CONSTRAINT "contactpage_contactBottomImageId_fkey" FOREIGN KEY ("contactBottomImageId") REFERENCES "file_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_brands" ADD CONSTRAINT "featured_brands_featuredbrandId_fkey" FOREIGN KEY ("featuredbrandId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_banners" ADD CONSTRAINT "package_banners_packageBannerId_fkey" FOREIGN KEY ("packageBannerId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentPlanId_fkey" FOREIGN KEY ("currentPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blogImage" ADD CONSTRAINT "_blogImage_A_fkey" FOREIGN KEY ("A") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blogImage" ADD CONSTRAINT "_blogImage_B_fkey" FOREIGN KEY ("B") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
