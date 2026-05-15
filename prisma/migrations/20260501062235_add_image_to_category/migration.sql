-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "menuType" TEXT NOT NULL DEFAULT 'Food',
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_MenuCategory" ("id", "image", "isActive", "menuType", "name") SELECT "id", "image", "isActive", "menuType", "name" FROM "MenuCategory";
DROP TABLE "MenuCategory";
ALTER TABLE "new_MenuCategory" RENAME TO "MenuCategory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
