-- AlterTable
ALTER TABLE "users" ALTER COLUMN "cardNumber" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "surname" DROP NOT NULL,
ALTER COLUMN "birthDate" DROP NOT NULL,
ALTER COLUMN "nationality" DROP NOT NULL,
ALTER COLUMN "countryOfOrigin" DROP NOT NULL,
ALTER COLUMN "cityOfOrigin" DROP NOT NULL,
ALTER COLUMN "exchangeDuration" DROP NOT NULL,
ALTER COLUMN "hostUniversity" DROP NOT NULL;