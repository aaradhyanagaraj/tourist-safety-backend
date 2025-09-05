/*
  Warnings:

  - You are about to drop the column `accuracy` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `battery` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `speed` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `aadhaarHash` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `travelFrom` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `travelTo` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `wrappedDek` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `wrappedDekNonce` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `wrappedDekTag` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the `BlockchainLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtpVerification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[touristId]` on the table `Tourist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mobile` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileOtp` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `touristId` to the `Tourist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BlockchainLog" DROP CONSTRAINT "BlockchainLog_touristId_fkey";

-- DropIndex
DROP INDEX "public"."Location_timestamp_idx";

-- DropIndex
DROP INDEX "public"."Location_touristId_timestamp_idx";

-- DropIndex
DROP INDEX "public"."Tourist_aadhaarHash_key";

-- AlterTable
ALTER TABLE "public"."Location" DROP COLUMN "accuracy",
DROP COLUMN "battery",
DROP COLUMN "heading",
DROP COLUMN "speed",
DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Tourist" DROP COLUMN "aadhaarHash",
DROP COLUMN "travelFrom",
DROP COLUMN "travelTo",
DROP COLUMN "updatedAt",
DROP COLUMN "wrappedDek",
DROP COLUMN "wrappedDekNonce",
DROP COLUMN "wrappedDekTag",
ADD COLUMN     "mobile" TEXT NOT NULL,
ADD COLUMN     "mobileOtp" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "touristId" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "type" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."BlockchainLog";

-- DropTable
DROP TABLE "public"."OtpVerification";

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_touristId_key" ON "public"."Tourist"("touristId");
