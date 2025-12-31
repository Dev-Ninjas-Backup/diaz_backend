-- CreateTable
CREATE TABLE "what_sets_us_apart" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'FLORIDA',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "yearsOfYachtingExcellence" VARCHAR(100),
    "boatsSoldIn2024" VARCHAR(100),
    "listingsViewedMonthly" VARCHAR(100),
    "image1Id" TEXT,
    "image2Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "what_sets_us_apart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WhatSetsUsAparts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WhatSetsUsAparts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "what_sets_us_apart_image1Id_key" ON "what_sets_us_apart"("image1Id");

-- CreateIndex
CREATE UNIQUE INDEX "what_sets_us_apart_image2Id_key" ON "what_sets_us_apart"("image2Id");

-- CreateIndex
CREATE INDEX "what_sets_us_apart_site_idx" ON "what_sets_us_apart"("site");

-- CreateIndex
CREATE UNIQUE INDEX "what_sets_us_apart_site_key" ON "what_sets_us_apart"("site");

-- CreateIndex
CREATE INDEX "_WhatSetsUsAparts_B_index" ON "_WhatSetsUsAparts"("B");

-- AddForeignKey
ALTER TABLE "what_sets_us_apart" ADD CONSTRAINT "what_sets_us_apart_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "what_sets_us_apart" ADD CONSTRAINT "what_sets_us_apart_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WhatSetsUsAparts" ADD CONSTRAINT "_WhatSetsUsAparts_A_fkey" FOREIGN KEY ("A") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WhatSetsUsAparts" ADD CONSTRAINT "_WhatSetsUsAparts_B_fkey" FOREIGN KEY ("B") REFERENCES "what_sets_us_apart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
