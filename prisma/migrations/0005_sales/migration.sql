-- Manuel satış defteri (admin elle kaydeder).
CREATE TABLE "Sale" (
  "id" TEXT NOT NULL,
  "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT,
  "customerEmail" TEXT,
  "customerIdNo" TEXT,
  "customerCountry" TEXT,
  "service" TEXT,
  "itemName" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "promoCode" TEXT,
  "discountAmount" INTEGER NOT NULL DEFAULT 0,
  "finalAmount" INTEGER NOT NULL,
  "paymentType" TEXT,
  "paymentRef" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PAID',
  "paidAmount" INTEGER,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Sale_soldAt_idx" ON "Sale"("soldAt");
