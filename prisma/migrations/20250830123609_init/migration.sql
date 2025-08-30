/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Tourist` table. All the data in the column will be lost.
  - You are about to drop the `ForeignTourist` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `country` to the `Tourist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Tourist_email_key";

-- AlterTable
ALTER TABLE "public"."Tourist" DROP COLUMN "createdAt",
DROP COLUMN "email",
ADD COLUMN     "country" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."ForeignTourist";
