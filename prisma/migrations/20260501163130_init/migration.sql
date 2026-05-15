/*
  Warnings:

  - You are about to drop the column `isActive` on the `MenuCategory` table. All the data in the column will be lost.
  - You are about to drop the column `menuType` on the `MenuCategory` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `MenuItem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - Added the required column `menuTypeId` to the `MenuCategory` table without a default value. This is not possible if the table is not empty.
  - Made the column `price` on table `MenuItem` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "MenuType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "menuTypeId" INTEGER NOT NULL,
    CONSTRAINT "MenuCategory_menuTypeId_fkey" FOREIGN KEY ("menuTypeId") REFERENCES "MenuType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuCategory" ("id", "image", "name") SELECT "id", "image", "name" FROM "MenuCategory";
DROP TABLE "MenuCategory";
ALTER TABLE "new_MenuCategory" RENAME TO "MenuCategory";
CREATE TABLE "new_MenuItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "image" TEXT,
    "menuCategoryId" INTEGER NOT NULL,
    CONSTRAINT "MenuItem_menuCategoryId_fkey" FOREIGN KEY ("menuCategoryId") REFERENCES "MenuCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" ("id", "image", "menuCategoryId", "name", "price") SELECT "id", "image", "menuCategoryId", "name", "price" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
