-- CreateTable
CREATE TABLE "public"."ForeignTourist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "passportNo" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "visaType" TEXT NOT NULL,
    "visaNumber" TEXT NOT NULL,
    "travelStart" TIMESTAMP(3) NOT NULL,
    "travelEnd" TIMESTAMP(3) NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForeignTourist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForeignTourist_passportNo_key" ON "public"."ForeignTourist"("passportNo");
