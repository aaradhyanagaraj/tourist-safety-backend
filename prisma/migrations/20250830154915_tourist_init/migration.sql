/*
  Warnings:

  - You are about to drop the column `country` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Tourist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aadhaarHash]` on the table `Tourist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aadhaarHash` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consent` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedPayload` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payloadNonce` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payloadTag` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `travelFrom` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `travelTo` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrappedDek` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrappedDekNonce` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrappedDekTag` to the `Tourist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tourist" DROP COLUMN "country",
DROP COLUMN "name",
ADD COLUMN     "aadhaarHash" TEXT NOT NULL,
ADD COLUMN     "consent" BOOLEAN NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "encryptedPayload" TEXT NOT NULL,
ADD COLUMN     "payloadNonce" TEXT NOT NULL,
ADD COLUMN     "payloadTag" TEXT NOT NULL,
ADD COLUMN     "travelFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "travelTo" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wrappedDek" TEXT NOT NULL,
ADD COLUMN     "wrappedDekNonce" TEXT NOT NULL,
ADD COLUMN     "wrappedDekTag" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."BlockchainLog" (
    "id" SERIAL NOT NULL,
    "touristId" INTEGER NOT NULL,
    "auditHash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OtpVerification" (
    "id" SERIAL NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_phoneHash_key" ON "public"."OtpVerification"("phoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_aadhaarHash_key" ON "public"."Tourist"("aadhaarHash");

-- AddForeignKey
ALTER TABLE "public"."BlockchainLog" ADD CONSTRAINT "BlockchainLog_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."Tourist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
