-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "streetAddress" TEXT,
    "streetAddress2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "isExchangeMember" BOOLEAN NOT NULL DEFAULT false,
    "exchangeEnrolledAt" TIMESTAMP(3),
    "exchangeCancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "profileId" TEXT,
    "guestEmail" TEXT,
    "shippingFirstName" TEXT NOT NULL,
    "shippingLastName" TEXT NOT NULL,
    "shippingStreet" TEXT NOT NULL,
    "shippingStreet2" TEXT,
    "shippingCity" TEXT NOT NULL,
    "shippingState" TEXT NOT NULL,
    "shippingPostalCode" TEXT NOT NULL,
    "shippingCountry" TEXT NOT NULL DEFAULT 'US',
    "lineItems" JSONB NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "shippingCost" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "appliedPromotion" JSONB,
    "stripePaymentIntentId" TEXT,
    "stripePaymentStatus" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "isTestOrder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_clerkUserId_key" ON "profiles"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_profileId_idx" ON "orders"("profileId");

-- CreateIndex
CREATE INDEX "orders_guestEmail_idx" ON "orders"("guestEmail");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_stripePaymentIntentId_idx" ON "orders"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
