/*
  Warnings:

  - You are about to drop the column `totalVolumes` on the `MangaEntry` table. All the data in the column will be lost.
  - You are about to drop the column `volumesRead` on the `MangaEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MangaEntry" DROP COLUMN "totalVolumes",
DROP COLUMN "volumesRead";
