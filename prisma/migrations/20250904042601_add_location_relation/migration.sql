/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `consent` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `mobileOtp` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Tourist` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrappedDek` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrappedDekNonce` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrappedDekTag` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Tourist` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Location" DROP COLUMN "createdAt",
ADD COLUMN     "accuracy" DOUBLE PRECISION,
ADD COLUMN     "battery" DOUBLE PRECISION,
ADD COLUMN     "heading" DOUBLE PRECISION,
ADD COLUMN     "speed" DOUBLE PRECISION,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Tourist" DROP COLUMN "consent",
DROP COLUMN "mobile",
DROP COLUMN "mobileOtp",
DROP COLUMN "name",
DROP COLUMN "verified",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wrappedDek" TEXT NOT NULL,
ADD COLUMN     "wrappedDekNonce" TEXT NOT NULL,
ADD COLUMN     "wrappedDekTag" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."TouristType" NOT NULL;

-- CreateTable
CREATE TABLE "public"."OtpVerification" (
    "id" SERIAL NOT NULL,
    "aadhaar" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_aadhaar_mobile_key" ON "public"."OtpVerification"("aadhaar", "mobile");
