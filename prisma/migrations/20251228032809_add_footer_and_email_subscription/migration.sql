-- CreateTable
CREATE TABLE "footer_settings" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'FLORIDA',
    "companyName" VARCHAR(255),
    "companyDescription" TEXT,
    "quickLinks" JSONB,
    "policyLinks" JSONB,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "socialMediaLinks" JSONB,
    "copyrightText" TEXT DEFAULT '© Copyright 2025 by Jupiter Marine Sales. All rights reserved.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_subscriptions" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'FLORIDA',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "footer_settings_site_key" ON "footer_settings"("site");

-- CreateIndex
CREATE UNIQUE INDEX "email_subscriptions_email_site_key" ON "email_subscriptions"("email", "site");

-- CreateIndex
CREATE INDEX "email_subscriptions_email_idx" ON "email_subscriptions"("email");

-- CreateIndex
CREATE INDEX "email_subscriptions_site_idx" ON "email_subscriptions"("site");
