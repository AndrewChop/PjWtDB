/*
  Warnings:

  - Added the required column `exchangeDuration` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostUniversity` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "University" AS ENUM ('UNIVERSITA_DI_PISA', 'SCUOLA_SUPERIORE_SANT_ANNA', 'SCUOLA_NORMALE_SUPERIORE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'VOLUNTEER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CULTURE', 'SOCIAL_INCLUSION', 'EDUCATION_YOUTH', 'HEALTH_WELLBEING', 'SKILLS_EMPLOYABILITY', 'ENVIRONMENTAL_SUSTAINABILITY');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('EVENT', 'OFFICE', 'REFUND', 'MEMBERSHIP_FEE', 'MERCHANDISING', 'OTHER');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('CASH', 'BANK_TRANSFER', 'DIGITAL_PAYMENT', 'PAYMENT_TERMINAL');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "exchangeDuration" INTEGER NOT NULL,
ADD COLUMN     "hostUniversity" "University" NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL;

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "participants" INTEGER NOT NULL,
    "organizerId" INTEGER NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasuries" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "Category" NOT NULL,
    "channel" "Channel" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,

    CONSTRAINT "treasuries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
