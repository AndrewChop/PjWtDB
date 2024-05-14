-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MAN', 'WOMAN', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SPECIFY');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PASSPORT', 'IDENTITY_CARD', 'DRIVER_LICENSE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "gender" "Gender",
    "birthDate" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "studyField" TEXT,
    "originUniversity" TEXT,
    "studentNumber" TEXT,
    "countryOfOrigin" TEXT NOT NULL,
    "cityOfOrigin" TEXT NOT NULL,
    "addressCityOfOrigin" TEXT,
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "documentExpiration" TIMESTAMP(3),
    "documentIssuer" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cardNumber_key" ON "users"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
