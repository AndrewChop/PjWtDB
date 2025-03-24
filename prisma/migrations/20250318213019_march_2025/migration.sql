/*
  Warnings:

  - The values [ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `surname` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `birthDate` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nationality` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneNumber` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `studyField` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `originUniversity` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `studentNumber` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `countryOfOrigin` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cityOfOrigin` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `addressCityOfOrigin` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `documentType` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `documentNumber` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `documentExpiration` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `documentIssuer` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('STUDENT', 'VOLUNTEER');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "surname" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "birthDate" SET NOT NULL,
ALTER COLUMN "nationality" SET NOT NULL,
ALTER COLUMN "phoneNumber" SET NOT NULL,
ALTER COLUMN "studyField" SET NOT NULL,
ALTER COLUMN "originUniversity" SET NOT NULL,
ALTER COLUMN "studentNumber" SET NOT NULL,
ALTER COLUMN "countryOfOrigin" SET NOT NULL,
ALTER COLUMN "cityOfOrigin" SET NOT NULL,
ALTER COLUMN "addressCityOfOrigin" SET NOT NULL,
ALTER COLUMN "documentType" SET NOT NULL,
ALTER COLUMN "documentNumber" SET NOT NULL,
ALTER COLUMN "documentExpiration" SET NOT NULL,
ALTER COLUMN "documentIssuer" SET NOT NULL,
ALTER COLUMN "isVerified" DROP NOT NULL;
