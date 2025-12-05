-- CreateTable
CREATE TABLE "POPULAR_CATAGORY" (
    "id" SERIAL NOT NULL,
    "bannerImg" TEXT,
    "title" TEXT NOT NULL,
    "toggle" "SiteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "POPULAR_CATAGORY_pkey" PRIMARY KEY ("id")
);
