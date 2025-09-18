# Trainer Roles, Seats & Invites Discovery Report

## ACK

The trainer/organization infrastructure is **comprehensively built** with a sophisticated multi-table system including orgs, org_members, org_seats, invitations, seat_invites, and audit_events. The system supports role-based access (owner/trainer/learner), seat allocation tracking, email invitation flows, and comprehensive RLS policies. However, there's **dual seat systems** (org_seats vs company_seats + seat_invites vs invitations) suggesting evolution over time, and **missing Stripe integration** for multi-seat purchases.

## Routes & UI

### Trainer Dashboard Routes
- **`app/trainer/page.tsx:7-71`** - Main trainer landing page:
  ```tsx
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer', 'admin'].includes(prof.role)) {
    return <div>Trainer access required</div>;
  }
  ```

- **`app/trainer/seats/page.tsx:5-80`** - Seat management dashboard:
  ```tsx
  const u = new URL('/api/trainer/orders', window.location.origin);
  const r = await fetch(u);
  if (r.status === 401 || r.status === 403) { setRows([]); return; }
  ```

- **`app/trainer/dashboard/page.tsx`** - Advanced trainer dashboard
- **`app/trainer/evaluations/[enrollmentId]/page.tsx`** - Individual learner evaluations
- **`app/trainer/import/page.tsx`** - Bulk import functionality

### Trainer UI Components
- **`components/trainer/TrainerTabs.tsx:28-400`** - Roster and invites management:
  ```tsx
  const [activeTab, setActiveTab] = useState<'roster' | 'invites'>('roster');
  const response = await fetch(`/api/trainer/roster?course_id=${courseId}`);
  ```

- **`components/trainer/AssignSeatsPanel.tsx:4-261`** - Bulk seat assignment:
  ```tsx
  const r1 = await fetch('/api/trainer/seat-invites/bulk', {
    body: JSON.stringify({ course_id: courseId, emails, note })
  });
  ```

## Role Checks

### Profile-Based Role System
- **`lib/auth/roles.ts:5-15`** - Core role utilities:
  ```tsx
  export type Role = 'learner' | 'trainer' | 'admin';
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return { user, role: (prof?.role as Role) || 'learner' };
  ```

- **`lib/auth/staff.server.ts:5-13`** - Staff role enforcement:
  ```tsx
  const { data } = await svc.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!data || !['admin','trainer'].includes((data as any).role)) return { ok:false, code:403 };
  ```

### Admin Guard System
- **`lib/admin/guard.ts:18-93`** - Comprehensive admin checking:
  ```tsx
  // 1) Environment variable allowlist check (primary method)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',')
  // 2) Database table check (secondary method)  
  const { data: adminRecord } = await sb.from('staff_admins').select('user_id, role')
  ```

## Seats & Invites

### Dual Invitation Systems
**System 1: Organization Invitations**
- **Table**: `invitations` (org-based, formal structure)
- **Function**: `supabase/migrations/add_organizations_and_rls.sql:136-147` - `accept_invitation(p_token)`
- **API**: No dedicated endpoints found - uses database function

**System 2: Seat Invites** 
- **Table**: `seat_invites` (course-based, simpler structure)
- **API**: `app/api/trainer/seat-invites/bulk/route.ts:10-130` - Bulk creation
- **API**: `app/api/trainer/seat-invites/send/route.ts:10-174` - Email sending
- **API**: `app/api/claim/accept/route.ts:9-199` - Redemption flow

### Seat Allocation Tables
**Modern System: org_seats**
- **`supabase/migrations/add_organizations_and_rls.sql:25-33`**:
  ```sql
  create table public.org_seats (
    org_id uuid not null references public.orgs(id),
    course_id uuid not null references public.courses(id),
    total_seats int not null, allocated_seats int not null default 0
  );
  ```

**Legacy System: company_seats**
- **`supabase/migrations/20250523_operatorsafety.sql:64-69`**:
  ```sql
  create table public.company_seats (
    company_id uuid, -- you'll add a companies table later
    enrollment_id uuid references public.enrollments(id)
  );
  ```

### Seat Assignment Flow
- **`app/api/trainer/assign-seats/route.ts:35-66`** - Direct enrollment creation:
  ```tsx
  const { data: prof2 } = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
  if (prof2?.id) {
    // Create enrollment directly
    await sb.from('enrollments').insert({ user_id: prof2.id, course_id, progress_pct: 0 });
  } else {
    // Create seat_invite for non-users
    await svc.from('seat_invites').upsert({ created_by: user.id, course_id, email });
  }
  ```

## RLS & Functions

### Comprehensive RLS Policies
- **`supabase/migrations/add_organizations_and_rls.sql:75-82`** - Core helper function:
  ```sql
  create or replace function public.is_org_role(p_org uuid, roles text[])
  returns boolean language sql stable as $$
    select exists (select 1 from public.org_members m
      where m.org_id = p_org and m.user_id = auth.uid() and m.role = any(roles));
  $$;
  ```

### Organization Policies
- **Orgs**: Members can read, owners can update (`orgs_select`, `orgs_update`)
- **Org Members**: Role-based access (`org_members_select` - owners/trainers/learners)
- **Org Seats**: Owners/trainers can view, owners can edit (`org_seats_select`, `org_seats_upsert`)
- **Invitations**: Owners/trainers can manage (`invitations_select`, `invitations_insert`)

### Enrollment Policies
- **`supabase/migrations/add_organizations_and_rls.sql:119-127`** - Multi-access pattern:
  ```sql
  create policy enrollments_select_org on public.enrollments
  for select using (
    (org_id is not null and public.is_org_role(org_id, array['owner','trainer']))
    or (user_id = auth.uid())
  );
  ```

## Stripe Touchpoints

### Existing Training Integration
- **`app/api/webhooks/stripe/route.ts:29-186`** - Legacy training webhook:
  ```tsx
  if (session.metadata?.course_slug) {
    // Handle training purchases - creates user + enrollment
    for (let i = 0; i < quantity; i++) {
      await supabase.from('enrollments').insert({
        user_id: user.id, course_id: course.id, progress_pct: 0
      });
    }
  }
  ```

### Multi-Seat Purchase Gap
- **No Stripe integration found** for `org_seats` or `company_seats`
- **No bulk purchase flow** that creates organization + allocates seats
- **No webhook handling** for organization-level purchases

## Gaps / Risks

### 1. Dual Systems Confusion
- **Two invitation tables**: `invitations` (org-based) vs `seat_invites` (course-based)
- **Two seat tables**: `org_seats` (modern) vs `company_seats` (legacy, incomplete)
- **Risk**: Developers might use wrong system, data fragmentation

### 2. Missing Stripe → Org Integration
- **Individual purchases** work via existing webhook
- **No bulk purchase flow** for organizations buying multiple seats
- **No automatic org creation** from Stripe metadata

### 3. Role Enforcement Gaps
- **`app/trainer/*` routes** - Some check roles, others rely on RLS
- **Mixed enforcement patterns**: profiles.role vs staff_admins vs ADMIN_EMAILS
- **No consistent trainer middleware**

### 4. Incomplete Legacy Tables
- **`company_seats`** references non-existent `companies` table
- **`company_seats`** has no RLS policies or business logic

## Safe Activation Plan

### Phase 1: Standardize on Modern System
1. **Migrate remaining seat_invites → invitations table**
2. **Deprecate company_seats in favor of org_seats**
3. **Add consistent trainer role middleware**

### Phase 2: Stripe Multi-Seat Integration  
1. **Create organization checkout flow** with seat quantity
2. **Add webhook handling** for org purchases (metadata: org_id, seat_count)
3. **Auto-allocate seats** to `org_seats` table on successful payment

### Phase 3: UI Consolidation
1. **Unify invitation flows** to use single system
2. **Add seat allocation dashboard** for organizations
3. **Implement seat usage tracking** and reporting

## Evidence Summary

**Active Systems**:
- ✅ `orgs`, `org_members`, `org_seats` - Modern organization system
- ✅ `seat_invites` + APIs - Working invitation system  
- ✅ Role-based RLS with `is_org_role()` function
- ✅ Trainer dashboard with roster management

**Legacy/Incomplete**:
- ⚠️ `company_seats` - References missing `companies` table
- ⚠️ `invitations` - Table exists but no API endpoints found
- ❌ Stripe multi-seat integration - Missing entirely

**Ready for Production**: The seat_invites + org_seats system is fully functional and can be activated by setting appropriate trainer roles in the profiles table.
