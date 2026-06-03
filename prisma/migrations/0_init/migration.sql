-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'AGENT', 'CLUB', 'CLUB_STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "MandateStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'TRIAL', 'REJECTED', 'ACCEPTED', 'SIGNED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TeamLevel" AS ENUM ('PRO', 'AMATEUR', 'ACADEMY');

-- CreateEnum
CREATE TYPE "ClubType" AS ENUM ('PRO', 'AMATEUR', 'ACADEMY');

-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClubKycStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'VERIFIED', 'REJECTED_KYC');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('CREATOR', 'CLUB_INFO', 'KYC', 'SUBMIT', 'DONE');

-- CreateEnum
CREATE TYPE "ClubKycDocumentType" AS ENUM ('PROOF_LEGAL', 'REPRESENTATIVE_ID', 'POWER_PROOF', 'BANK_RIB');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('CLUB_CREATOR_VERIFY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MANDATE_REQUEST', 'MANDATE_ACCEPTED', 'MANDATE_REJECTED', 'APPLICATION_RECEIVED', 'SUBMISSION_RECEIVED', 'LISTING_NEW', 'REPORT_SHARED', 'POST_LIKE', 'POST_COMMENT', 'POST_SHARE', 'MENTION', 'FOLLOW', 'AI_ACTION_COMPLETED', 'PROFILE_VIEWED', 'ADMIN_NEW_USER', 'ADMIN_CLUB_SUBMITTED', 'ADMIN_PAYMENT_RECEIVED', 'ADMIN_WITHDRAWAL_REQUEST');

-- CreateEnum
CREATE TYPE "FileAssetType" AS ENUM ('PROFILE_PICTURE', 'COVER_PHOTO', 'VIDEO', 'DOCUMENT', 'REPORT_ATTACHMENT', 'POST_MEDIA');

-- CreateEnum
CREATE TYPE "PlayerProgressionLevel" AS ENUM ('ROOKIE', 'AMATEUR', 'COMPETITOR', 'ELITE', 'PRO');

-- CreateEnum
CREATE TYPE "FootballVideoContext" AS ENUM ('UNKNOWN', 'MATCH', 'TRAINING');

-- CreateEnum
CREATE TYPE "FootballVideoSkillCategory" AS ENUM ('UNSPECIFIED', 'MATCH_HIGHLIGHTS', 'TECHNICAL', 'PHYSICAL_ATHLETIC', 'SET_PIECES', 'GOALKEEPING', 'TACTICAL', 'PORTRAIT');

-- CreateEnum
CREATE TYPE "PlayerFootballVideoStatus" AS ENUM ('PENDING_REVIEW', 'AWARDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('CLUB', 'PLAYER', 'AGENT');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RecoveryRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RecoveryEntityType" AS ENUM ('PLAYER', 'AGENT', 'CLUB');

-- CreateEnum
CREATE TYPE "MessageAttachmentType" AS ENUM ('FILE', 'REPORT');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'PRO', 'ELITE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('SUBSCRIPTION', 'PURCHASED', 'EARNED', 'BONUS');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT_SUBSCRIPTION', 'CREDIT_PURCHASE', 'CREDIT_BONUS', 'CREDIT_EARNED_FOLLOW', 'CREDIT_EARNED_LISTING', 'CREDIT_EARNED_SIGNATURE', 'DEBIT_FOLLOW', 'DEBIT_LISTING_CONSULT', 'DEBIT_PROFILE_VIEW', 'CREDIT_EARNED_PROFILE_VIEW', 'DEBIT_WITHDRAWAL', 'EXPIRATION', 'REFUND', 'CREDIT_VIDEO_UPLOAD_REWARD', 'DEBIT_VIDEO_BOOST', 'DEBIT_PROFILE_HIGHLIGHT', 'DEBIT_RECRUITER_VIDEO_SEND', 'DEBIT_ADVANCED_ANALYSIS', 'DEBIT_FULL_PLAYER_REPORT', 'DEBIT_CLUB_APPLICATION', 'DEBIT_PLAYER_RECOMMENDATION', 'DEBIT_DIRECT_RECRUITER_ACCESS', 'DEBIT_STORAGE_GB_PURCHASE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FraudFlagType" AS ENUM ('MULTI_ACCOUNT', 'ARTIFICIAL_LOOP', 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_PATTERN', 'IP_ANOMALY', 'DEVICE_ANOMALY');

-- CreateEnum
CREATE TYPE "FraudFlagSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KycDocumentType" AS ENUM ('IDENTITY_CARD', 'PASSPORT', 'DRIVING_LICENSE', 'PROOF_OF_ADDRESS', 'AGENT_LICENSE', 'CLUB_REGISTRATION', 'BANK_DETAILS', 'OTHER');

-- CreateEnum
CREATE TYPE "KycDocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "StaffOnboardingStep" AS ENUM ('PROFILE', 'KYC', 'DONE');

-- CreateEnum
CREATE TYPE "AgentInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerProgressionLevel" "PlayerProgressionLevel" NOT NULL DEFAULT 'ROOKIE',
    "gamificationXp" INTEGER NOT NULL DEFAULT 0,
    "gamificationStorageBonusBytes" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "secondNationality" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "strongFoot" TEXT,
    "primaryPosition" TEXT NOT NULL,
    "secondaryPositions" TEXT[],
    "availableFrom" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "currentClub" TEXT,
    "currentLeague" TEXT,
    "profilePicture" TEXT,
    "coverPhoto" TEXT,
    "videoLinks" TEXT[],
    "statistics" JSONB,
    "bio" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isSearchable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerEntry" (
    "id" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "league" TEXT,
    "country" TEXT,
    "season" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "position" TEXT,
    "appearances" INTEGER,
    "minutesPlayed" INTEGER,
    "goals" INTEGER,
    "assists" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "agencyName" TEXT,
    "licenseNumber" TEXT,
    "licenseCountry" TEXT,
    "bio" TEXT,
    "specialties" TEXT[],
    "phoneNumber" TEXT,
    "website" TEXT,
    "profilePicture" TEXT,
    "coverPhoto" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "slug" TEXT,
    "clubName" TEXT NOT NULL,
    "shortName" TEXT,
    "clubType" "ClubType",
    "country" TEXT NOT NULL,
    "city" TEXT,
    "league" TEXT,
    "division" TEXT,
    "logo" TEXT,
    "coverPhoto" TEXT,
    "website" TEXT,
    "bio" TEXT,
    "foundedYear" INTEGER,
    "status" "ClubStatus" NOT NULL DEFAULT 'DRAFT',
    "kycStatus" "ClubKycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "rejectReason" TEXT,
    "legalForm" TEXT,
    "registrationNumber" TEXT,
    "federation" TEXT,
    "federationNumber" TEXT,
    "officialEmail" TEXT,
    "officialPhone" TEXT,
    "address" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "TeamLevel" NOT NULL,
    "division" TEXT,
    "category" TEXT,
    "competitionName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPlayer" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "jerseyNumber" INTEGER,
    "position" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mandate" (
    "id" TEXT NOT NULL,
    "agentProfileId" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "status" "MandateStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "terms" TEXT,
    "document" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),

    CONSTRAINT "Mandate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "teamId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "nationality" TEXT[],
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT DEFAULT 'EUR',
    "contractType" TEXT,
    "startDate" TIMESTAMP(3),
    "requirements" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "coverLetter" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "agentProfileId" TEXT NOT NULL,
    "playerProfileId" TEXT NOT NULL,
    "listingId" TEXT,
    "clubProfileId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "message" TEXT,
    "playerData" JSONB NOT NULL,
    "reportIds" TEXT[],
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerReport" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shareSlug" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "attachments" TEXT[],
    "accessPolicy" JSONB,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSection" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Share" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hashtag" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostHashtag" (
    "postId" TEXT NOT NULL,
    "hashtagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostHashtag_pkey" PRIMARY KEY ("postId","hashtagId")
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "FileAssetType" NOT NULL,
    "contentHash" VARCHAR(64),
    "ownerId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "accessPolicy" JSONB,
    "playerProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerFootballVideo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileAssetId" TEXT NOT NULL,
    "contentHash" VARCHAR(64),
    "durationSeconds" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "context" "FootballVideoContext" NOT NULL DEFAULT 'UNKNOWN',
    "skillCategory" "FootballVideoSkillCategory" NOT NULL DEFAULT 'UNSPECIFIED',
    "status" "PlayerFootballVideoStatus" NOT NULL,
    "rejectReason" TEXT,
    "creditsAwarded" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerFootballVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerFootballVideoScore" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "technicalPts" INTEGER NOT NULL,
    "detectionPts" INTEGER NOT NULL,
    "actionsPts" INTEGER NOT NULL,
    "contextPts" INTEGER NOT NULL,
    "durationOk" BOOLEAN NOT NULL,
    "stabilityOk" BOOLEAN NOT NULL,
    "lightingOk" BOOLEAN NOT NULL,
    "resolutionOk" BOOLEAN NOT NULL,
    "playerVisible" BOOLEAN NOT NULL,
    "fullBodyOk" BOOLEAN NOT NULL,
    "faceDetected" BOOLEAN NOT NULL,
    "singleAction" BOOLEAN NOT NULL,
    "multipleActions" BOOLEAN NOT NULL,
    "contextMatch" BOOLEAN NOT NULL,
    "contextTraining" BOOLEAN NOT NULL,
    "analysisVersion" TEXT NOT NULL DEFAULT 'mock_v1',
    "mockSeed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerFootballVideoScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoSkillEvaluation" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "pacScore" INTEGER NOT NULL DEFAULT 0,
    "finScore" INTEGER NOT NULL DEFAULT 0,
    "tecScore" INTEGER NOT NULL DEFAULT 0,
    "visScore" INTEGER NOT NULL DEFAULT 0,
    "phyScore" INTEGER NOT NULL DEFAULT 0,
    "defScore" INTEGER NOT NULL DEFAULT 0,
    "gkScore" INTEGER NOT NULL DEFAULT 0,
    "subCriteria" JSONB,
    "compositeScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoSkillEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pac" INTEGER NOT NULL DEFAULT 0,
    "fin" INTEGER NOT NULL DEFAULT 0,
    "tec" INTEGER NOT NULL DEFAULT 0,
    "vis" INTEGER NOT NULL DEFAULT 0,
    "phy" INTEGER NOT NULL DEFAULT 0,
    "def" INTEGER NOT NULL DEFAULT 0,
    "gk" INTEGER NOT NULL DEFAULT 0,
    "ovr" INTEGER NOT NULL DEFAULT 0,
    "ratingPosition" TEXT,
    "evaluatedVideoCount" INTEGER NOT NULL DEFAULT 0,
    "confidenceLevel" TEXT NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStorageUsage" (
    "userId" TEXT NOT NULL,
    "bytesUsed" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStorageUsage_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootballTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "country" TEXT NOT NULL,
    "league" TEXT,
    "apiFootballId" INTEGER,
    "footballDataId" INTEGER,
    "sportsDbId" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "stadiumImage" TEXT,
    "jersey" TEXT,
    "venue" TEXT,
    "founded" INTEGER,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FootballTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootballPlayer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "nationality" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "number" INTEGER,
    "sportsDbId" TEXT,
    "apiFootballId" INTEGER,
    "image" TEXT,
    "cutout" TEXT,
    "teamId" TEXT,
    "teamName" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FootballPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootballMatch" (
    "id" TEXT NOT NULL,
    "apiFootballId" INTEGER,
    "footballDataId" INTEGER,
    "sportsDbId" TEXT,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "matchDate" TIMESTAMP(3) NOT NULL,
    "competition" TEXT NOT NULL,
    "competitionCode" TEXT,
    "matchday" INTEGER,
    "venue" TEXT,
    "season" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FootballMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileRecoveryRequest" (
    "id" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterUserId" TEXT,
    "entityType" "RecoveryEntityType" NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT,
    "message" TEXT NOT NULL,
    "proofDocuments" TEXT[],
    "status" "RecoveryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileRecoveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" "MessageAttachmentType" NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "reportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "creditsAllocated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WalletType" NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletType" "WalletType" NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "amount" INTEGER NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "counterpartyId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "entityFollowId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastChargedAt" TIMESTAMP(3),
    "nextChargeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingConsultation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "creditsCost" INTEGER NOT NULL,
    "creditsToClub" INTEGER NOT NULL,
    "divisionRate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingConsultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "viewedId" TEXT NOT NULL,
    "viewerRole" "Role" NOT NULL,
    "creditsCost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureValidation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "playerUserId" TEXT NOT NULL,
    "proofDocument" TEXT,
    "proofStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "totalApplications" INTEGER NOT NULL DEFAULT 0,
    "complementPaid" BOOLEAN NOT NULL DEFAULT false,
    "complementAmount" INTEGER NOT NULL DEFAULT 0,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignatureValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,
    "netAmount" INTEGER NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "stripeConnectAccountId" TEXT,
    "stripePayoutId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "availableAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeConnectAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeConnectAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceFingerprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudFlag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FraudFlagType" NOT NULL,
    "severity" "FraudFlagSeverity" NOT NULL DEFAULT 'LOW',
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditExpiration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletType" "WalletType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditExpiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "KycDocumentType" NOT NULL,
    "status" "KycDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubKycDocument" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "type" "ClubKycDocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "filename" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedByUserId" TEXT,

    CONSTRAINT "ClubKycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubOnboardingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT,
    "currentStep" "OnboardingStep" NOT NULL DEFAULT 'CREATOR',
    "creatorOtpVerifiedAt" TIMESTAMP(3),
    "verifiedCreatorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubOnboardingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubStaffProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "jobTitle" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "profilePicture" TEXT,
    "experience" JSONB,
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubStaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentInvitation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "agentEmail" TEXT NOT NULL,
    "agentFirstName" TEXT,
    "agentLastName" TEXT,
    "agentPhone" TEXT,
    "message" TEXT,
    "status" "AgentInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "playerProfileId" TEXT NOT NULL,
    "acceptedByUserId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMember" (
    "id" TEXT NOT NULL,
    "clubProfileId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "role" "ClubRole" NOT NULL DEFAULT 'STAFF',
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "inviteToken" TEXT,
    "invitedByUserId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "staffOnboardingStep" "StaffOnboardingStep",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRateLimitEvent" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRateLimitEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_slug_key" ON "PlayerProfile"("slug");

-- CreateIndex
CREATE INDEX "PlayerProfile_userId_idx" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE INDEX "PlayerProfile_isSearchable_idx" ON "PlayerProfile"("isSearchable");

-- CreateIndex
CREATE INDEX "CareerEntry_playerProfileId_idx" ON "CareerEntry"("playerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_userId_key" ON "AgentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_slug_key" ON "AgentProfile"("slug");

-- CreateIndex
CREATE INDEX "AgentProfile_userId_idx" ON "AgentProfile"("userId");

-- CreateIndex
CREATE INDEX "AgentProfile_isVerified_idx" ON "AgentProfile"("isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "ClubProfile_userId_key" ON "ClubProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubProfile_slug_key" ON "ClubProfile"("slug");

-- CreateIndex
CREATE INDEX "ClubProfile_userId_idx" ON "ClubProfile"("userId");

-- CreateIndex
CREATE INDEX "ClubProfile_country_idx" ON "ClubProfile"("country");

-- CreateIndex
CREATE INDEX "ClubProfile_status_idx" ON "ClubProfile"("status");

-- CreateIndex
CREATE INDEX "Team_clubProfileId_idx" ON "Team"("clubProfileId");

-- CreateIndex
CREATE INDEX "StaffMember_teamId_idx" ON "StaffMember"("teamId");

-- CreateIndex
CREATE INDEX "TeamPlayer_teamId_idx" ON "TeamPlayer"("teamId");

-- CreateIndex
CREATE INDEX "TeamPlayer_playerProfileId_idx" ON "TeamPlayer"("playerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlayer_teamId_playerProfileId_key" ON "TeamPlayer"("teamId", "playerProfileId");

-- CreateIndex
CREATE INDEX "Mandate_agentProfileId_idx" ON "Mandate"("agentProfileId");

-- CreateIndex
CREATE INDEX "Mandate_playerProfileId_idx" ON "Mandate"("playerProfileId");

-- CreateIndex
CREATE INDEX "Mandate_status_idx" ON "Mandate"("status");

-- CreateIndex
CREATE INDEX "Mandate_agentProfileId_playerProfileId_status_idx" ON "Mandate"("agentProfileId", "playerProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Mandate_agentProfileId_playerProfileId_startDate_key" ON "Mandate"("agentProfileId", "playerProfileId", "startDate");

-- CreateIndex
CREATE INDEX "Listing_clubProfileId_idx" ON "Listing"("clubProfileId");

-- CreateIndex
CREATE INDEX "Listing_teamId_idx" ON "Listing"("teamId");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_publishedAt_idx" ON "Listing"("publishedAt");

-- CreateIndex
CREATE INDEX "Application_playerProfileId_idx" ON "Application"("playerProfileId");

-- CreateIndex
CREATE INDEX "Application_listingId_idx" ON "Application"("listingId");

-- CreateIndex
CREATE INDEX "Application_clubProfileId_idx" ON "Application"("clubProfileId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_clubProfileId_status_idx" ON "Application"("clubProfileId", "status");

-- CreateIndex
CREATE INDEX "Application_playerProfileId_status_idx" ON "Application"("playerProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_playerProfileId_listingId_key" ON "Application"("playerProfileId", "listingId");

-- CreateIndex
CREATE INDEX "Submission_agentProfileId_idx" ON "Submission"("agentProfileId");

-- CreateIndex
CREATE INDEX "Submission_clubProfileId_idx" ON "Submission"("clubProfileId");

-- CreateIndex
CREATE INDEX "Submission_listingId_idx" ON "Submission"("listingId");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerReport_shareSlug_key" ON "PlayerReport"("shareSlug");

-- CreateIndex
CREATE INDEX "PlayerReport_subjectId_idx" ON "PlayerReport"("subjectId");

-- CreateIndex
CREATE INDEX "PlayerReport_authorId_idx" ON "PlayerReport"("authorId");

-- CreateIndex
CREATE INDEX "PlayerReport_status_idx" ON "PlayerReport"("status");

-- CreateIndex
CREATE INDEX "ReportSection_reportId_idx" ON "ReportSection"("reportId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_userId_createdAt_idx" ON "Post"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_postId_userId_key" ON "Like"("postId", "userId");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "Share_postId_idx" ON "Share"("postId");

-- CreateIndex
CREATE INDEX "Share_userId_idx" ON "Share"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Share_postId_userId_key" ON "Share"("postId", "userId");

-- CreateIndex
CREATE INDEX "Bookmark_postId_idx" ON "Bookmark"("postId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_postId_userId_key" ON "Bookmark"("postId", "userId");

-- CreateIndex
CREATE INDEX "Mention_postId_idx" ON "Mention"("postId");

-- CreateIndex
CREATE INDEX "Mention_userId_idx" ON "Mention"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Hashtag_tag_key" ON "Hashtag"("tag");

-- CreateIndex
CREATE INDEX "Hashtag_tag_idx" ON "Hashtag"("tag");

-- CreateIndex
CREATE INDEX "PostHashtag_postId_idx" ON "PostHashtag"("postId");

-- CreateIndex
CREATE INDEX "PostHashtag_hashtagId_idx" ON "PostHashtag"("hashtagId");

-- CreateIndex
CREATE UNIQUE INDEX "FileAsset_key_key" ON "FileAsset"("key");

-- CreateIndex
CREATE INDEX "FileAsset_ownerId_idx" ON "FileAsset"("ownerId");

-- CreateIndex
CREATE INDEX "FileAsset_playerProfileId_idx" ON "FileAsset"("playerProfileId");

-- CreateIndex
CREATE INDEX "FileAsset_contentHash_idx" ON "FileAsset"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerFootballVideo_fileAssetId_key" ON "PlayerFootballVideo"("fileAssetId");

-- CreateIndex
CREATE INDEX "PlayerFootballVideo_userId_idx" ON "PlayerFootballVideo"("userId");

-- CreateIndex
CREATE INDEX "PlayerFootballVideo_userId_createdAt_idx" ON "PlayerFootballVideo"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PlayerFootballVideo_contentHash_idx" ON "PlayerFootballVideo"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerFootballVideoScore_videoId_key" ON "PlayerFootballVideoScore"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSkillEvaluation_videoId_key" ON "VideoSkillEvaluation"("videoId");

-- CreateIndex
CREATE INDEX "VideoSkillEvaluation_videoId_idx" ON "VideoSkillEvaluation"("videoId");

-- CreateIndex
CREATE INDEX "VideoSkillEvaluation_evaluatorId_idx" ON "VideoSkillEvaluation"("evaluatorId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRating_userId_key" ON "PlayerRating"("userId");

-- CreateIndex
CREATE INDEX "PlayerRating_ovr_idx" ON "PlayerRating"("ovr");

-- CreateIndex
CREATE INDEX "PlayerRating_userId_idx" ON "PlayerRating"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "EmailLog"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "EntityFollow_userId_idx" ON "EntityFollow"("userId");

-- CreateIndex
CREATE INDEX "EntityFollow_entityId_idx" ON "EntityFollow"("entityId");

-- CreateIndex
CREATE INDEX "EntityFollow_entityType_idx" ON "EntityFollow"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "EntityFollow_userId_entityId_entityType_key" ON "EntityFollow"("userId", "entityId", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTeam_apiFootballId_key" ON "FootballTeam"("apiFootballId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTeam_footballDataId_key" ON "FootballTeam"("footballDataId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTeam_sportsDbId_key" ON "FootballTeam"("sportsDbId");

-- CreateIndex
CREATE INDEX "FootballTeam_name_idx" ON "FootballTeam"("name");

-- CreateIndex
CREATE INDEX "FootballTeam_country_idx" ON "FootballTeam"("country");

-- CreateIndex
CREATE INDEX "FootballTeam_league_idx" ON "FootballTeam"("league");

-- CreateIndex
CREATE UNIQUE INDEX "FootballPlayer_sportsDbId_key" ON "FootballPlayer"("sportsDbId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballPlayer_apiFootballId_key" ON "FootballPlayer"("apiFootballId");

-- CreateIndex
CREATE INDEX "FootballPlayer_name_idx" ON "FootballPlayer"("name");

-- CreateIndex
CREATE INDEX "FootballPlayer_nationality_idx" ON "FootballPlayer"("nationality");

-- CreateIndex
CREATE INDEX "FootballPlayer_teamId_idx" ON "FootballPlayer"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballMatch_apiFootballId_key" ON "FootballMatch"("apiFootballId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballMatch_footballDataId_key" ON "FootballMatch"("footballDataId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballMatch_sportsDbId_key" ON "FootballMatch"("sportsDbId");

-- CreateIndex
CREATE INDEX "FootballMatch_homeTeamId_idx" ON "FootballMatch"("homeTeamId");

-- CreateIndex
CREATE INDEX "FootballMatch_awayTeamId_idx" ON "FootballMatch"("awayTeamId");

-- CreateIndex
CREATE INDEX "FootballMatch_matchDate_idx" ON "FootballMatch"("matchDate");

-- CreateIndex
CREATE INDEX "FootballMatch_status_idx" ON "FootballMatch"("status");

-- CreateIndex
CREATE INDEX "FootballMatch_competition_idx" ON "FootballMatch"("competition");

-- CreateIndex
CREATE INDEX "FootballMatch_competitionCode_idx" ON "FootballMatch"("competitionCode");

-- CreateIndex
CREATE UNIQUE INDEX "ApiCache_cacheKey_key" ON "ApiCache"("cacheKey");

-- CreateIndex
CREATE INDEX "ApiCache_cacheKey_idx" ON "ApiCache"("cacheKey");

-- CreateIndex
CREATE INDEX "ApiCache_source_idx" ON "ApiCache"("source");

-- CreateIndex
CREATE INDEX "ApiCache_dataType_idx" ON "ApiCache"("dataType");

-- CreateIndex
CREATE INDEX "ApiCache_expiresAt_idx" ON "ApiCache"("expiresAt");

-- CreateIndex
CREATE INDEX "ApiCache_source_expiresAt_idx" ON "ApiCache"("source", "expiresAt");

-- CreateIndex
CREATE INDEX "ApiCache_dataType_expiresAt_idx" ON "ApiCache"("dataType", "expiresAt");

-- CreateIndex
CREATE INDEX "ProfileRecoveryRequest_status_idx" ON "ProfileRecoveryRequest"("status");

-- CreateIndex
CREATE INDEX "ProfileRecoveryRequest_entityType_idx" ON "ProfileRecoveryRequest"("entityType");

-- CreateIndex
CREATE INDEX "ProfileRecoveryRequest_requesterEmail_idx" ON "ProfileRecoveryRequest"("requesterEmail");

-- CreateIndex
CREATE INDEX "ProfileRecoveryRequest_createdAt_idx" ON "ProfileRecoveryRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "MessageAttachment_reportId_idx" ON "MessageAttachment"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_type_key" ON "Wallet"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_idempotencyKey_key" ON "CreditTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_walletType_idx" ON "CreditTransaction"("userId", "walletType");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "CreditTransaction_referenceId_idx" ON "CreditTransaction"("referenceId");

-- CreateIndex
CREATE INDEX "CreditTransaction_counterpartyId_idx" ON "CreditTransaction"("counterpartyId");

-- CreateIndex
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreditFollow_entityFollowId_key" ON "CreditFollow"("entityFollowId");

-- CreateIndex
CREATE INDEX "CreditFollow_followerId_idx" ON "CreditFollow"("followerId");

-- CreateIndex
CREATE INDEX "CreditFollow_followingId_idx" ON "CreditFollow"("followingId");

-- CreateIndex
CREATE INDEX "CreditFollow_isActive_idx" ON "CreditFollow"("isActive");

-- CreateIndex
CREATE INDEX "CreditFollow_nextChargeAt_idx" ON "CreditFollow"("nextChargeAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreditFollow_followerId_followingId_key" ON "CreditFollow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "ListingConsultation_userId_idx" ON "ListingConsultation"("userId");

-- CreateIndex
CREATE INDEX "ListingConsultation_listingId_idx" ON "ListingConsultation"("listingId");

-- CreateIndex
CREATE INDEX "ListingConsultation_clubProfileId_idx" ON "ListingConsultation"("clubProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingConsultation_userId_listingId_key" ON "ListingConsultation"("userId", "listingId");

-- CreateIndex
CREATE INDEX "ProfileView_viewerId_idx" ON "ProfileView"("viewerId");

-- CreateIndex
CREATE INDEX "ProfileView_viewedId_idx" ON "ProfileView"("viewedId");

-- CreateIndex
CREATE INDEX "ProfileView_viewedId_createdAt_idx" ON "ProfileView"("viewedId", "createdAt");

-- CreateIndex
CREATE INDEX "SignatureValidation_listingId_idx" ON "SignatureValidation"("listingId");

-- CreateIndex
CREATE INDEX "SignatureValidation_clubProfileId_idx" ON "SignatureValidation"("clubProfileId");

-- CreateIndex
CREATE INDEX "SignatureValidation_proofStatus_idx" ON "SignatureValidation"("proofStatus");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");

-- CreateIndex
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");

-- CreateIndex
CREATE INDEX "Withdrawal_availableAt_idx" ON "Withdrawal"("availableAt");

-- CreateIndex
CREATE UNIQUE INDEX "StripeConnectAccount_userId_key" ON "StripeConnectAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeConnectAccount_stripeAccountId_key" ON "StripeConnectAccount"("stripeAccountId");

-- CreateIndex
CREATE INDEX "StripeConnectAccount_userId_idx" ON "StripeConnectAccount"("userId");

-- CreateIndex
CREATE INDEX "StripeConnectAccount_stripeAccountId_idx" ON "StripeConnectAccount"("stripeAccountId");

-- CreateIndex
CREATE INDEX "DeviceFingerprint_userId_idx" ON "DeviceFingerprint"("userId");

-- CreateIndex
CREATE INDEX "DeviceFingerprint_fingerprint_idx" ON "DeviceFingerprint"("fingerprint");

-- CreateIndex
CREATE INDEX "DeviceFingerprint_ipAddress_idx" ON "DeviceFingerprint"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceFingerprint_userId_fingerprint_key" ON "DeviceFingerprint"("userId", "fingerprint");

-- CreateIndex
CREATE INDEX "FraudFlag_userId_idx" ON "FraudFlag"("userId");

-- CreateIndex
CREATE INDEX "FraudFlag_type_idx" ON "FraudFlag"("type");

-- CreateIndex
CREATE INDEX "FraudFlag_severity_idx" ON "FraudFlag"("severity");

-- CreateIndex
CREATE INDEX "FraudFlag_isResolved_idx" ON "FraudFlag"("isResolved");

-- CreateIndex
CREATE INDEX "CreditExpiration_userId_idx" ON "CreditExpiration"("userId");

-- CreateIndex
CREATE INDEX "CreditExpiration_year_idx" ON "CreditExpiration"("year");

-- CreateIndex
CREATE INDEX "KycDocument_userId_idx" ON "KycDocument"("userId");

-- CreateIndex
CREATE INDEX "KycDocument_type_idx" ON "KycDocument"("type");

-- CreateIndex
CREATE INDEX "KycDocument_status_idx" ON "KycDocument"("status");

-- CreateIndex
CREATE INDEX "ClubKycDocument_clubId_idx" ON "ClubKycDocument"("clubId");

-- CreateIndex
CREATE INDEX "ClubKycDocument_type_idx" ON "ClubKycDocument"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ClubKycDocument_clubId_type_key" ON "ClubKycDocument"("clubId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ClubOnboardingSession_clubId_key" ON "ClubOnboardingSession"("clubId");

-- CreateIndex
CREATE INDEX "ClubOnboardingSession_userId_idx" ON "ClubOnboardingSession"("userId");

-- CreateIndex
CREATE INDEX "ClubOnboardingSession_clubId_idx" ON "ClubOnboardingSession"("clubId");

-- CreateIndex
CREATE INDEX "OtpToken_email_purpose_idx" ON "OtpToken"("email", "purpose");

-- CreateIndex
CREATE INDEX "OtpToken_expiresAt_idx" ON "OtpToken"("expiresAt");

-- CreateIndex
CREATE INDEX "OtpToken_userId_idx" ON "OtpToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubStaffProfile_userId_key" ON "ClubStaffProfile"("userId");

-- CreateIndex
CREATE INDEX "ClubStaffProfile_userId_idx" ON "ClubStaffProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentInvitation_token_key" ON "AgentInvitation"("token");

-- CreateIndex
CREATE INDEX "AgentInvitation_token_idx" ON "AgentInvitation"("token");

-- CreateIndex
CREATE INDEX "AgentInvitation_agentEmail_idx" ON "AgentInvitation"("agentEmail");

-- CreateIndex
CREATE INDEX "AgentInvitation_playerProfileId_idx" ON "AgentInvitation"("playerProfileId");

-- CreateIndex
CREATE INDEX "AgentInvitation_status_idx" ON "AgentInvitation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMember_inviteToken_key" ON "ClubMember"("inviteToken");

-- CreateIndex
CREATE INDEX "ClubMember_clubProfileId_status_idx" ON "ClubMember"("clubProfileId", "status");

-- CreateIndex
CREATE INDEX "ClubMember_userId_idx" ON "ClubMember"("userId");

-- CreateIndex
CREATE INDEX "ClubMember_email_idx" ON "ClubMember"("email");

-- CreateIndex
CREATE INDEX "ClubMember_inviteToken_idx" ON "ClubMember"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMember_clubProfileId_userId_key" ON "ClubMember"("clubProfileId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMember_clubProfileId_email_key" ON "ClubMember"("clubProfileId", "email");

-- CreateIndex
CREATE INDEX "ApiRateLimitEvent_scope_key_createdAt_idx" ON "ApiRateLimitEvent"("scope", "key", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerEntry" ADD CONSTRAINT "CareerEntry_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubProfile" ADD CONSTRAINT "ClubProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mandate" ADD CONSTRAINT "Mandate_agentProfileId_fkey" FOREIGN KEY ("agentProfileId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mandate" ADD CONSTRAINT "Mandate_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_agentProfileId_fkey" FOREIGN KEY ("agentProfileId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerReport" ADD CONSTRAINT "PlayerReport_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerReport" ADD CONSTRAINT "PlayerReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportSection" ADD CONSTRAINT "ReportSection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "PlayerReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerFootballVideo" ADD CONSTRAINT "PlayerFootballVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerFootballVideo" ADD CONSTRAINT "PlayerFootballVideo_fileAssetId_fkey" FOREIGN KEY ("fileAssetId") REFERENCES "FileAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerFootballVideoScore" ADD CONSTRAINT "PlayerFootballVideoScore_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "PlayerFootballVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSkillEvaluation" ADD CONSTRAINT "VideoSkillEvaluation_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "PlayerFootballVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSkillEvaluation" ADD CONSTRAINT "VideoSkillEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStorageUsage" ADD CONSTRAINT "UserStorageUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityFollow" ADD CONSTRAINT "EntityFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootballPlayer" ADD CONSTRAINT "FootballPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "FootballTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootballMatch" ADD CONSTRAINT "FootballMatch_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootballMatch" ADD CONSTRAINT "FootballMatch_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "FootballTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "PlayerReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditFollow" ADD CONSTRAINT "CreditFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditFollow" ADD CONSTRAINT "CreditFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewedId_fkey" FOREIGN KEY ("viewedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeConnectAccount" ADD CONSTRAINT "StripeConnectAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceFingerprint" ADD CONSTRAINT "DeviceFingerprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudFlag" ADD CONSTRAINT "FraudFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubKycDocument" ADD CONSTRAINT "ClubKycDocument_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubOnboardingSession" ADD CONSTRAINT "ClubOnboardingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubOnboardingSession" ADD CONSTRAINT "ClubOnboardingSession_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "ClubProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpToken" ADD CONSTRAINT "OtpToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubStaffProfile" ADD CONSTRAINT "ClubStaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInvitation" ADD CONSTRAINT "AgentInvitation_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubProfileId_fkey" FOREIGN KEY ("clubProfileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

