-- CreateTable
CREATE TABLE "florida_leads" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "florida_leads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "florida_leads" ADD CONSTRAINT "florida_leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "florida_leads" ADD CONSTRAINT "florida_leads_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
