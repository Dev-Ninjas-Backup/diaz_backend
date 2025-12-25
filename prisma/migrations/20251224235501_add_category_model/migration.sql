-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_imageId_key" ON "categories"("imageId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
