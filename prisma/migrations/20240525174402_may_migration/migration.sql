/*
  Warnings:

  - The values [PENDING,REJECTED] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isApproved` on the `users` table. All the data in the column will be lost.
  - Changed the type of `discountType` on the `discounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED', 'QUANTITY');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('STUDENT', 'VOLUNTEER', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "discounts" DROP COLUMN "discountType",
ADD COLUMN     "discountType" "DiscountType" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isApproved";
