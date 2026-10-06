-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_DUTY', 'OFF_DUTY', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN', 'WALKER');

-- CreateTable
CREATE TABLE "delivery_agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "serviceArea" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "vehicleType" "VehicleType" DEFAULT 'MOTORCYCLE',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "currentLoad" INTEGER NOT NULL DEFAULT 0,
    "maxCapacity" INTEGER NOT NULL DEFAULT 10,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_agents_phone_key" ON "delivery_agents"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_agents_email_key" ON "delivery_agents"("email");

-- CreateIndex
CREATE INDEX "delivery_agents_status_idx" ON "delivery_agents"("status");

-- CreateIndex
CREATE INDEX "delivery_agents_serviceArea_idx" ON "delivery_agents"("serviceArea");

-- CreateIndex
CREATE INDEX "delivery_agents_email_idx" ON "delivery_agents"("email");

-- CreateIndex
CREATE INDEX "delivery_agents_phone_idx" ON "delivery_agents"("phone");

