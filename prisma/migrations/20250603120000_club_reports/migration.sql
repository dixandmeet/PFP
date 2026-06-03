-- CreateEnum
CREATE TYPE "ReportKind" AS ENUM ('PLAYER', 'MATCH');

-- CreateEnum
CREATE TYPE "ReportSource" AS ENUM ('CLUB', 'AGENT', 'PLAYER', 'SUBMISSION');

-- AlterTable
ALTER TABLE "PlayerReport" ADD COLUMN "reportKind" "ReportKind" NOT NULL DEFAULT 'PLAYER';
ALTER TABLE "PlayerReport" ADD COLUMN "source" "ReportSource";
ALTER TABLE "PlayerReport" ADD COLUMN "clubProfileId" TEXT;
ALTER TABLE "PlayerReport" ADD COLUMN "createdByUserId" TEXT;
ALTER TABLE "PlayerReport" ADD COLUMN "externalPlayer" JSONB;
ALTER TABLE "PlayerReport" ADD COLUMN "footballMatchId" TEXT;
ALTER TABLE "PlayerReport" ADD COLUMN "matchManual" JSONB;

-- Make subjectId and authorId nullable
ALTER TABLE "PlayerReport" ALTER COLUMN "subjectId" DROP NOT NULL;
ALTER TABLE "PlayerReport" ALTER COLUMN "authorId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ReportClubAccess" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "submissionId" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportClubAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerReport_clubProfileId_idx" ON "PlayerReport"("clubProfileId");
CREATE INDEX "PlayerReport_reportKind_idx" ON "PlayerReport"("reportKind");
CREATE INDEX "PlayerReport_footballMatchId_idx" ON "PlayerReport"("footballMatchId");
CREATE UNIQUE INDEX "ReportClubAccess_reportId_clubProfileId_key" ON "ReportClubAccess"("reportId", "clubProfileId");
CREATE INDEX "ReportClubAccess_clubProfileId_idx" ON "ReportClubAccess"("clubProfileId");
CREATE INDEX "ReportClubAccess_submissionId_idx" ON "ReportClubAccess"("submissionId");

-- AddForeignKey
ALTER TABLE "PlayerReport" ADD CONSTRAINT "PlayerReport_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerReport" ADD CONSTRAINT "PlayerReport_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlayerReport" ADD CONSTRAINT "PlayerReport_footballMatchId_fkey" FOREIGN KEY ("footballMatchId") REFERENCES "FootballMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReportClubAccess" ADD CONSTRAINT "ReportClubAccess_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "PlayerReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportClubAccess" ADD CONSTRAINT "ReportClubAccess_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
