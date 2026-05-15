-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingDate" TEXT NOT NULL,
    "bookingTime" TEXT NOT NULL,
    "guestsCount" INTEGER NOT NULL,
    "selectedMenu" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otherContactId" TEXT,
    "specialNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "agreedToTerms" BOOLEAN NOT NULL DEFAULT false,
    "understoodLeadTime" BOOLEAN NOT NULL DEFAULT false,
    "paymentScreenshot" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Reservation" ("agreedToTerms", "bookingDate", "bookingTime", "createdAt", "email", "guestName", "guestsCount", "id", "otherContactId", "paymentScreenshot", "phoneNumber", "selectedMenu", "specialNotes", "status", "understoodLeadTime", "updatedAt") SELECT "agreedToTerms", "bookingDate", "bookingTime", "createdAt", "email", "guestName", "guestsCount", "id", "otherContactId", "paymentScreenshot", "phoneNumber", "selectedMenu", "specialNotes", "status", "understoodLeadTime", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
