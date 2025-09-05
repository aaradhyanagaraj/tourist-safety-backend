/*
  Warnings:

  - Added the required column `mobileNonce` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileTag` to the `Tourist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tourist" ADD COLUMN     "mobileNonce" TEXT NOT NULL,
ADD COLUMN     "mobileTag" TEXT NOT NULL;
