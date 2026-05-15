/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `admin_users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "admin_users" ADD COLUMN "resetTokenExpiry" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_resetToken_key" ON "admin_users"("resetToken");
