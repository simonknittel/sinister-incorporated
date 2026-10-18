import { AuditEventType } from "./AuditEventTypes.js";

/**
 * Types whose events are written often enough to drown out everything else
 * in the system log — per page view, per opened notification popover, per
 * automation run. The system log hides them unless they are explicitly
 * selected in its type filter.
 */
export const HIGH_VOLUME_AUDIT_EVENT_TYPES: ReadonlySet<AuditEventType> =
  new Set([
    AuditEventType.USER_LOGIN_V2,
    AuditEventType.USER_FIRST_VISIT_OF_THE_DAY_V2,
    AuditEventType.WIKI_PAGE_VISITED,
    AuditEventType.WIKI_PAGE_UPDATED,
    AuditEventType.ON_SITE_NOTIFICATIONS_CREATED,
    AuditEventType.ON_SITE_NOTIFICATIONS_READ,
    AuditEventType.ON_SITE_NOTIFICATIONS_ALL_READ,
    AuditEventType.ON_SITE_NOTIFICATION_UNREAD,
    AuditEventType.ON_SITE_NOTIFICATION_ARCHIVED,
    AuditEventType.ON_SITE_NOTIFICATIONS_READ_ARCHIVED,
    AuditEventType.ON_SITE_NOTIFICATION_UNARCHIVED,
    AuditEventType.CHANGELOG_ENTRIES_SEEN,
    AuditEventType.LOG_ANALYZER_ENTRIES_UPLOADED,
    AuditEventType.READ_MARKER_CREATED,
  ]);
