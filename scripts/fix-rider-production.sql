-- Run this in Supabase → SQL Editor if rider login crashes after sign-in.
-- Safe to run more than once.

-- 1. Rider status enum + table
DO $$ BEGIN
  CREATE TYPE "RiderStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Rider" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "pinHash" TEXT NOT NULL,
  "area" TEXT NOT NULL,
  "motorbikeNumber" TEXT,
  "status" "RiderStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Rider_phone_key" ON "Rider"("phone");

-- 2. New order statuses (add before migrating rows)
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_CONFIRMED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'RIDER_ASSIGNED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'OUT_FOR_DELIVERY';

-- 3. Rider assignment columns on orders
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "assignedRiderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3);

DO $$ BEGIN
  ALTER TABLE "Order"
    ADD CONSTRAINT "Order_assignedRiderId_fkey"
    FOREIGN KEY ("assignedRiderId") REFERENCES "Rider"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. Migrate old status values (run after new enum values exist)
UPDATE "Order" SET "status" = 'PAYMENT_CONFIRMED' WHERE "status"::text = 'PAID';
UPDATE "Order" SET "status" = 'READY_FOR_PICKUP' WHERE "status"::text = 'PREPARING';
UPDATE "Order" SET "status" = 'OUT_FOR_DELIVERY' WHERE "status"::text = 'ON_THE_WAY';
