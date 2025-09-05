-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "touristId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "battery" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Location_touristId_timestamp_idx" ON "public"."Location"("touristId", "timestamp");

-- CreateIndex
CREATE INDEX "Location_timestamp_idx" ON "public"."Location"("timestamp");

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "public"."Tourist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
