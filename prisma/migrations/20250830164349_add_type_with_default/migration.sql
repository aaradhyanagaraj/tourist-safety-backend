-- CreateEnum
CREATE TYPE "public"."TouristType" AS ENUM ('INDIAN', 'FOREIGN');

-- AlterTable
ALTER TABLE "public"."Tourist" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'INDIAN';
