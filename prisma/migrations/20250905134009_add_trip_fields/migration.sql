/*
  Warnings:

  - Added the required column `address` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContact` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `travelEnd` to the `Tourist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `travelStart` to the `Tourist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tourist" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emergencyContact" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "travelEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "travelStart" TIMESTAMP(3) NOT NULL;
