/*
  Warnings:

  - You are about to drop the column `code` on the `discounts` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `treasuries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "discounts" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "treasuries" DROP COLUMN "code";
