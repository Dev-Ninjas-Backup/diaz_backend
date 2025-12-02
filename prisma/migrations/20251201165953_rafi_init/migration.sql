/*
  Warnings:

  - You are about to drop the `boat_features` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `boat_specifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropTable
DROP TABLE "boat_features";

-- DropTable
DROP TABLE "boat_specifications";

-- DropEnum
DROP TYPE "BoatFeatureType";

-- DropEnum
DROP TYPE "BoatSpecificationType";

-- DropEnum
DROP TYPE "DataInsertSource";

-- CreateTable
CREATE TABLE "blog" (
    "id" TEXT NOT NULL,
    "blogImage" TEXT NOT NULL,
    "blogTitle" VARCHAR(255) NOT NULL,
    "blogDescription" TEXT NOT NULL,
    "sharedLink" VARCHAR(255) NOT NULL,
    "readTime" INTEGER NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "postStatus" "PostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aboutpage" (
    "id" TEXT NOT NULL,
    "aboutTopImage" TEXT NOT NULL,
    "aboutBottomImage" TEXT NOT NULL,
    "aboutBottomTitle" VARCHAR(255) NOT NULL,
    "aboutBottomSubTitle" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aboutpage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactpage" (
    "id" TEXT NOT NULL,
    "contactTopImage" TEXT NOT NULL,
    "contactBottomImage" TEXT NOT NULL,
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
