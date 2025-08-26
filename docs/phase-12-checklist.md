# Phase 12 — Checklist

## SQL
- Run docs/phase-12-community-notes.sql (adds IP + notes table).

## ENV (Vercel)
- SENDGRID_API_KEY, SENDGRID_FROM, ADMIN_NOTIFICATIONS_TO
- INTERNAL_ADMIN_KEY (already set in Phase 11)

## Verify
- Submit 1–2 test tips; confirm email to ADMIN_NOTIFICATIONS_TO.
- Submit >5 in an hour from same IP → 429 with friendly message.
- Admin list shows new tips; Approve/Reject/Flag works.
- PUBLISH to notes → appears in Community Notes section on brand hub.
- JSON-LD still present where applicable; no changes needed.
- Spanish routes still OK.

## Testing Flow

### 1. Admin Notifications
```bash
# Submit a test tip on any brand hub
# Check that admin receives email notification
```

### 2. Rate Limiting
```bash
# Submit 6+ tips from same IP within an hour
# Should get 429 "Too many submissions" error
```

### 3. Admin Moderation
```bash
# Visit /admin/service
# Use admin key to approve/reject/flag submissions
# Test PUBLISH to Community Notes functionality
```

### 4. Community Notes Display
```bash
# After publishing notes, visit brand hubs
# Verify Community Notes section appears
# Check notes are properly categorized and formatted
```

### 5. Analytics Tracking
```bash
# Visit /admin/brand-analytics for tracking guide
# Check Vercel Analytics for custom events:
#   - svc_submission
#   - svc_submission_rate_limited (in server logs)
```

## Integration Points

- **Submissions API**: Enhanced with IP tracking and notifications
- **Admin API**: Added publish-to-community-notes endpoint
- **Brand Hubs**: Now display Community Notes section
- **Rate Limiting**: 5 submissions per IP per hour
- **Email Notifications**: SendGrid integration for admin alerts

## Security Notes

- IP addresses stored for rate limiting only
- RLS policies ensure public can only INSERT suggestions
- Community Notes readable by all, writable only by service role
- Admin endpoints require INTERNAL_ADMIN_KEY header
- Email notifications are best-effort (won't break submissions)
