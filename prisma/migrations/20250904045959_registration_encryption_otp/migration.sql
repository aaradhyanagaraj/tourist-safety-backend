/*
  Warnings:

  - Added the required column `mobile` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Made the column `wrappedDek` on table `Tourist` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `type` on the `Tourist` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Tourist" ADD COLUMN     "aadhaarHash" TEXT,
ADD COLUMN     "mobile" TEXT NOT NULL,
ADD COLUMN     "visaIdHash" TEXT,
ALTER COLUMN "wrappedDek" SET NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;
