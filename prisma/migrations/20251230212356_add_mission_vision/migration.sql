-- CreateTable
CREATE TABLE "mission_vision" (
    "id" TEXT NOT NULL,
    "site" "SiteType" NOT NULL DEFAULT 'FLORIDA',
    "mission" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "visionDescription" TEXT,
    "image1Id" TEXT,
    "image2Id" TEXT,
    "image3Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_vision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MissionVisions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MissionVisions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "mission_vision_image1Id_key" ON "mission_vision"("image1Id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_vision_image2Id_key" ON "mission_vision"("image2Id");

-- CreateIndex
CREATE UNIQUE INDEX "mission_vision_image3Id_key" ON "mission_vision"("image3Id");

-- CreateIndex
CREATE INDEX "mission_vision_site_idx" ON "mission_vision"("site");

-- CreateIndex
CREATE UNIQUE INDEX "mission_vision_site_key" ON "mission_vision"("site");

-- CreateIndex
CREATE INDEX "_MissionVisions_B_index" ON "_MissionVisions"("B");

-- AddForeignKey
ALTER TABLE "mission_vision" ADD CONSTRAINT "mission_vision_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_vision" ADD CONSTRAINT "mission_vision_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_vision" ADD CONSTRAINT "mission_vision_image3Id_fkey" FOREIGN KEY ("image3Id") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MissionVisions" ADD CONSTRAINT "_MissionVisions_A_fkey" FOREIGN KEY ("A") REFERENCES "file_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MissionVisions" ADD CONSTRAINT "_MissionVisions_B_fkey" FOREIGN KEY ("B") REFERENCES "mission_vision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
