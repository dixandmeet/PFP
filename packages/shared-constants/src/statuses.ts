export const MandateStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  TERMINATED: "TERMINATED",
  REJECTED: "REJECTED",
} as const

export type MandateStatus = (typeof MandateStatus)[keyof typeof MandateStatus]

export const ApplicationStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  SHORTLISTED: "SHORTLISTED",
  TRIAL: "TRIAL",
  REJECTED: "REJECTED",
  ACCEPTED: "ACCEPTED",
  SIGNED: "SIGNED",
} as const

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export const ListingStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CLOSED: "CLOSED",
} as const

export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus]

export const ClubStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
} as const

export type ClubStatus = (typeof ClubStatus)[keyof typeof ClubStatus]

export const ReportStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus]

export const NotificationType = {
  MANDATE_REQUEST: "MANDATE_REQUEST",
  MANDATE_ACCEPTED: "MANDATE_ACCEPTED",
  MANDATE_REJECTED: "MANDATE_REJECTED",
  APPLICATION_RECEIVED: "APPLICATION_RECEIVED",
  SUBMISSION_RECEIVED: "SUBMISSION_RECEIVED",
  LISTING_NEW: "LISTING_NEW",
  REPORT_SHARED: "REPORT_SHARED",
  POST_LIKE: "POST_LIKE",
  POST_COMMENT: "POST_COMMENT",
  POST_SHARE: "POST_SHARE",
  MENTION: "MENTION",
  FOLLOW: "FOLLOW",
  AI_ACTION_COMPLETED: "AI_ACTION_COMPLETED",
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]
