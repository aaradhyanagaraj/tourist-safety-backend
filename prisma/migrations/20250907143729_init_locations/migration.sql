/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Location" DROP CONSTRAINT "Location_touristId_fkey";

-- DropTable
DROP TABLE "public"."Location";

-- CreateTable
CREATE TABLE "public"."LocationRaw" (
    "id" SERIAL NOT NULL,
    "touristId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "provider" TEXT,
    "deviceId" TEXT,
    "batchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationRaw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LocationLatest" (
    "touristId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "provider" TEXT,
    "deviceId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationLatest_pkey" PRIMARY KEY ("touristId")
);

-- CreateIndex
CREATE INDEX "LocationRaw_touristId_timestamp_idx" ON "public"."LocationRaw"("touristId", "timestamp");

-- CreateIndex
CREATE INDEX "LocationRaw_timestamp_idx" ON "public"."LocationRaw"("timestamp");

-- AddForeignKey
ALTER TABLE "public"."LocationRaw" ADD CONSTRAINT "LocationRaw_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."Tourist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocationLatest" ADD CONSTRAINT "LocationLatest_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."Tourist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
