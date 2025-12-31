-- CreateTable
CREATE TABLE "our_story" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'FLORIDA',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image1Id" TEXT,
    "image2Id" TEXT,
    "image3Id" TEXT,
    "image4Id" TEXT,
    "image5Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "our_story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OurStories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OurStories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image1Id_key" ON "our_story"("image1Id");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image2Id_key" ON "our_story"("image2Id");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image3Id_key" ON "our_story"("image3Id");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image4Id_key" ON "our_story"("image4Id");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_image5Id_key" ON "our_story"("image5Id");

-- CreateIndex
CREATE INDEX "our_story_site_idx" ON "our_story"("site");

-- CreateIndex
CREATE UNIQUE INDEX "our_story_site_key" ON "our_story"("site");

-- CreateIndex
CREATE INDEX "_OurStories_B_index" ON "_OurStories"("B");

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image3Id_fkey" FOREIGN KEY ("image3Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image4Id_fkey" FOREIGN KEY ("image4Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "our_story" ADD CONSTRAINT "our_story_image5Id_fkey" FOREIGN KEY ("image5Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OurStories" ADD CONSTRAINT "_OurStories_A_fkey" FOREIGN KEY ("A") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OurStories" ADD CONSTRAINT "_OurStories_B_fkey" FOREIGN KEY ("B") REFERENCES "our_story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
