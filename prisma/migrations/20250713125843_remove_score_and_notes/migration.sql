/*
  Warnings:

  - You are about to drop the column `notes` on the `AnimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `AnimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `MangaEntry` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `MangaEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AnimeEntry" DROP COLUMN "notes",
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "MangaEntry" DROP COLUMN "notes",
DROP COLUMN "score";
