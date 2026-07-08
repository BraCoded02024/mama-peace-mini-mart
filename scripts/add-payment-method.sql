-- Add payment method for admin-selected Paystack vs MTN MoMo (CODETECHS)
DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('PAYSTACK', 'MTN_MOMO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" "PaymentMethod";
