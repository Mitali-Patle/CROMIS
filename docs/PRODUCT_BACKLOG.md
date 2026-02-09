# PRODUCT BACKLOG

## EPIC 1 — User Management & Access Control (15 stories)

_(Signup → only students. Admin manually adds faculty/admin.)_

### 1. Student Registration

**As a student, I want to register for an account so that I can access the system to book resources.**

Subtasks:

- Create signup API
- Validate email/password
- Save role = student
- Hash password

**Acceptance Criteria:**

- User can submit registration form with valid email (unique) and password (min 8 chars, includes uppercase, lowercase, number); system sends confirmation email upon success.
- Registered user receives a success message and is redirected to login page; invalid inputs display appropriate error messages; role is automatically set to "student" and password is securely hashed.

### 2. Admin Creates Faculty/Admin Accounts

**As an admin, I want to create accounts for faculty and other admins so that they can access role-specific features securely.**

Subtasks:

- Admin form: name, email, password, role
- Hash password
- Prevent duplicate emails

**Acceptance Criteria:**

- Admin can access creation form only if logged in as admin; form validates all fields: name (non-empty), email (valid format, unique), password (strong), role (faculty or admin).
- Upon submission, account is created with hashed password and success notification shown; duplicate email attempt shows error without creating account; new user receives welcome email.

### 3. Login System

**As a user, I want to log in with my credentials so that I can securely access my personalized dashboard and features.**

Subtasks:

- Verify credentials
- Generate JWT
- Store token & role in cookies

**Acceptance Criteria:**

- Valid email/password combination grants access, generates JWT, stores in secure HTTP-only cookie, and redirects to role-specific dashboard; invalid credentials show error message.
- Successful login logs the event with timestamp and IP; JWT expiry is set to 24 hours, with refresh mechanism; rate limiting prevents brute-force attacks (max 5 attempts per 15 mins).

### 4. Session Management

**As a user, I want my session to be managed automatically so that I stay logged in securely without manual intervention.**

Subtasks:

- Validate token
- Auto-logout on expiry

**Acceptance Criteria:**

- Every protected route validates JWT from cookie; invalid/expired token redirects to login; auto-refresh token if within 1 hour of expiry, extending session seamlessly.
- Inactive sessions (no activity for 30 mins) prompt re-authentication; logout clears all cookies and invalidates token server-side; session data (e.g., role) is accessible throughout.

### 5. Role-Based Routing

**As a user, I want to be directed to role-specific pages after login so that I can access only the features relevant to my role.**

Subtasks:

- Student → /student
- Faculty → /faculty
- Admin → /admin

**Acceptance Criteria:**

- Upon login, user is automatically redirected to the correct dashboard based on role (e.g., student to /student); attempting unauthorized routes results in 403 error and redirect.
- Role changes (via admin) trigger re-routing on next login; fallback to login page if no valid session; navigation menu adapts to show only role-relevant links.

### 6. Password Reset

**As a user, I want to reset my password if forgotten so that I can regain access to my account without admin intervention.**

Subtasks:

- Generate reset token
- Save expiry
- Update password

**Acceptance Criteria:**

- "Forgot Password" link sends reset email with unique token (expires in 1 hour) only to verified email; reset form accepts token via email link; new password must be strong and confirmed.
- Successful reset logs out all sessions, updates password, and redirects to login with success message; expired or invalid token shows error and requires new request; rate limiting on reset requests (1 per hour per email).

### 7. Profile View

**As a user, I want to view my profile details so that I can review my personal information at any time.**

Subtasks:

- Retrieve user details
- Display name, email, role

**Acceptance Criteria:**

- Profile page loads user data (name, email, role, registration date) securely without exposing to others; data is read-only and displayed in a clean, responsive UI.
- If user is inactive, show status and deactivation reason (admin-only view); page requires authentication; unauthorized access redirects to login; last login timestamp is shown.

### 8. Edit Profile

**As a user, I want to edit my profile information so that I can keep my details up to date.**

Subtasks:

- Update name
- Validate fields

**Acceptance Criteria:**

- User can update name (non-empty, max 100 chars); email changes require verification via new confirmation email; changes save immediately with success message and audit log entry.
- Invalid inputs (e.g., empty name) prevent save and show errors inline; email updates invalidate current session, forcing re-login; only authenticated users can edit their own profile.

### 9. Change Password

**As a user, I want to change my password so that I can enhance my account security periodically.**

Subtasks:

- Validate old password
- Save new hashed password

**Acceptance Criteria:**

- Form requires current password verification; new password must differ from old and meet strength rules; successful change logs out all sessions except current, shows success, and emails notification.
- Mismatched confirmations or weak new password show errors; rate limiting: max 3 changes per day; audit log records change with timestamp.

### 10. Logout

**As a user, I want to log out securely so that I can end my session and protect my account from unauthorized access.**

Subtasks:

- Clear JWT cookie
- Redirect to login

**Acceptance Criteria:**

- "Logout" button clears all auth cookies and invalidates server-side token; redirects to login page with optional "Logged out successfully" message; logs logout event with timestamp.
- Post-logout, all protected routes are inaccessible; works across devices/sessions if multi-device logout is implemented.

### 11. Admin User List

**As an admin, I want to view a list of all users so that I can manage and monitor user accounts efficiently.**

Subtasks:

- Pagination
- Filter by role

**Acceptance Criteria:**

- Admin-only access; lists all users with columns: name, email, role, status, last login; pagination loads 20 users per page; navigation works seamlessly.
- Filters (role: student/faculty/admin) update list dynamically without page reload; search by name/email yields results in <2 seconds; export to CSV option available.

### 12. Admin Edit User Role

**As an admin, I want to edit a user's role so that I can adjust access levels as needed for organizational changes.**

Subtasks:

- Update role
- Validate role transitions

**Acceptance Criteria:**

- Admin selects user and chooses new role (student/faculty/admin); invalid transitions (e.g., student to student) are allowed but noted; update succeeds with email notification to user and audit log.
- Role change takes effect on next login; current session may require re-auth; error if user not found or unauthorized edit attempt; bulk role edit not required but future-proofed.

### 13. Page Access Restriction

**As an admin, I want to restrict access to certain pages based on roles so that sensitive features are protected from unauthorized users.**

Subtasks:

- Middleware for route protection
- Unauthorized redirect

**Acceptance Criteria:**

- Middleware checks role on protected routes (e.g., /admin requires admin role); unauthorized users see 403 page or redirect to dashboard/login with error message; all admin routes protected.
- Student/faculty routes allow overlap where appropriate; bypassing via URL manipulation fails; logs unauthorized access attempts.

### 14. Admin Deactivate User

**As an admin, I want to deactivate user accounts so that I can temporarily or permanently revoke access for inactive or problematic users.**

Subtasks:

- Toggle active/inactive
- Block login if inactive

**Acceptance Criteria:**

- Admin toggles status from user list; inactive users cannot login and see "Account deactivated" message; reactivation requires admin action and optional reason log.
- Audit log records deactivation with admin ID and reason; notifications sent to user on deactivation/reactivation; search includes inactive users for admin visibility.

### 15. Authentication Audit Logs

**As an admin, I want to view audit logs for authentication events so that I can track and investigate security incidents.**

Subtasks:

- Save login timestamp
- Save logout timestamp
- Save failed login attempts

**Acceptance Criteria:**

- Logs capture: login/logout/failures with user ID, timestamp, IP, user agent; admin dashboard shows paginated, searchable logs (filter by date/user/event).
- Retention: 90 days; exportable to CSV; alerts for suspicious activity (e.g., >5 failed logins); logs are tamper-proof and accessible only to admins.

---

## EPIC 2 — Resource Catalog Management (15 stories)

_(Admin creates ANY type of resource – fully flexible)_

### 1. Add Resources

**As an admin, I want to add new resources to the catalog so that users can discover and book available campus assets.**

Subtasks:

- Resource name, type, capacity
- Upload optional images

**Acceptance Criteria:**

- Admin form accepts name (required, unique), type (text), capacity (integer >0), and up to 5 images (max 5MB each); successful add sets status to "active" and shows in catalog immediately.
- Validation errors (e.g., duplicate name) prevent save; images stored securely; thumbnails generated for UI; audit log records creation.

### 2. Edit Resources

**As an admin, I want to edit existing resources so that I can update details to reflect changes in availability or specifications.**

Subtasks:

- Update fields
- Validate changes

**Acceptance Criteria:**

- Edit form pre-populates data; updates name, type, capacity, images (add/replace/delete); changes save with version history note; no overlaps with active bookings.
- Validation ensures capacity >0; errors shown inline; post-edit, resource updates in all views/searches; confirmation modal for destructive changes (e.g., image delete).

### 3. Delete/Archive Resources

**As an admin, I want to delete or archive resources so that I can remove outdated items while preserving historical data.**

Subtasks:

- Soft delete
- Keep history

**Acceptance Criteria:**

- "Archive" button soft-deletes (status=inactive); hard delete option for no history; cannot archive if active bookings exist; prompt to cancel first.
- Archived resources hidden from user searches but visible in admin list; history (bookings, edits) retained in database; bulk archive supported for multiple selections.

### 4. Resource Categories (Optional Classification)

**As an admin, I want to categorize resources with tags or types so that users can easily group and filter them in searches.**

Subtasks:

- Admin assigns tags or types
- UI grouping

**Acceptance Criteria:**

- Form allows adding/editing tags (comma-separated, max 10 per resource); tags are searchable; UI shows tag cloud or dropdown filters.
- Predefined tag suggestions (e.g., "lab", "meeting room"); changes propagate to all linked views; tag usage analytics available in future epic.

### 5. Resource Availability Timetable

**As an admin, I want to set availability timetables for resources so that users can only book during operational hours.**

Subtasks:

- Store start/end hours
- Validate timetable

**Acceptance Criteria:**

- Admin sets daily start/end times (e.g., Mon-Fri 9-5); exceptions for holidays; validation ensures end > start; overlaps with bookings blocked.
- UI calendar visualizes timetable; bookings outside auto-rejected; changes apply to future bookings only; default: 24/7 if not set.

### 6. Resource Search

**As a user, I want to search for resources so that I can quickly find the ones that match my needs.**

Subtasks:

- Search by name/type
- Filter by capacity, active only

**Acceptance Criteria:**

- Search bar queries name, type, tags; results in <1 second, sorted by relevance; filters: capacity (>= value), status (active only), tags.
- No results show "No resources found" with suggestions; mobile-responsive; pagination for >20 results; accessible to all authenticated users.

### 7. Resource Detail Page

**As a user, I want to view detailed information about a resource so that I can make informed booking decisions.**

Subtasks:

- Show description
- Show images
- Show availability

**Acceptance Criteria:**

- Page loads resource data: name, type, capacity, images carousel, description, location, instructions; availability calendar shows booked/free slots for next 30 days.
- Images zoomable; alt text for accessibility; "Book Now" button if available; 404 if resource not found or inactive.

### 8. Upload Documents/Blueprints

**As an admin, I want to upload documents or blueprints for resources so that users can reference technical details.**

Subtasks:

- Support PDFs/images
- Preview in UI

**Acceptance Criteria:**

- Upload supports PDF/JPG/PNG (max 10MB, up to 3 files); files linked to resource; UI previews PDFs (first page), images inline.
- Download links secure (auth required); virus scan integration if possible; error on failure; delete option with confirmation.

### 9. Location Mapping

**As an admin, I want to map resources to physical locations so that users know exactly where to find them on campus.**

Subtasks:

- Building name
- Room number

**Acceptance Criteria:**

- Form fields: building (dropdown of campus buildings), room (text, unique per building); validation: required fields, no duplicates.
- UI shows on detail page with optional Google Maps embed (if API available); searchable by location; bulk update for similar resources.

### 10. Resource Instructions

**As an admin, I want to add instructions or guidelines for resources so that users can use them safely and effectively.**

Subtasks:

- Admin adds rules/guidelines
- Display rules in UI

**Acceptance Criteria:**

- Rich text editor for instructions (max 2000 chars); displays as collapsible section on detail page; mandatory for certain types (e.g., equipment).
- Changes versioned; users acknowledge on booking (checkbox); accessible format (e.g., bullet points).

### 11. Quantity-based Equipment

**As an admin, I want to track resources with multiple units so that users can book specific quantities without over-allocation.**

Subtasks:

- Track availability of quantity >1

**Acceptance Criteria:**

- Capacity field allows >1; bookings specify quantity (<= available); availability checks total units; partial bookings update remaining.
- UI shows "X/Y units available"; for quantity=1, behaves as single resource; reports include per-unit usage.

### 12. Temporarily Disable Resource

**As an admin, I want to temporarily disable a resource so that I can mark it unavailable during maintenance or issues.**

Subtasks:

- Mark unavailable
- Add reason

**Acceptance Criteria:**

- Toggle button sets status=maintenance; optional reason/end date; disabled resources hidden from searches; existing bookings notified.
- Auto-reactivate on end date or manual toggle; reason shown in admin logs only; banner on detail page if accessed.

### 13. Resource Tags

**As an admin, I want to assign tags to resources so that users can filter searches by attributes like equipment type.**

Subtasks:

- Multiple tags (AC, Projector, etc.)
- Tag-based filtering

**Acceptance Criteria:**

- Assign up to 10 tags per resource; auto-suggest from global pool; search filters by tag; results grouped by tag.
- Tags lowercase, no duplicates per resource; admin can manage global tag list; analytics on tag popularity.

### 14. Resource Ownership (Admin note only)

**As an admin, I want to note ownership details for resources so that I can track internal accountability without user visibility.**

Subtasks:

- Optional owner text
- Display in details page

**Acceptance Criteria:**

- Private field: owner name/dept (text, max 100 chars); visible only in admin detail view; updatable; changes logged.
- Searchable in admin tools; required for audit compliance.

### 15. Resource Booking History

**As an admin, I want to view a resource's booking history so that I can analyze usage patterns over time.**

Subtasks:

- Retrieve completed bookings
- Show timeline in UI

**Acceptance Criteria:**

- Timeline chart: bookings by date/status (approved/cancelled); filters: date range, user role; export to CSV; details expandable.
- Only past/completed shown; pending in separate view; loads <2 seconds for 1-year history.

---

## EPIC 3 — Proposal & Booking Request System (15 stories)

_(Students & Faculty submit proposals. Admin approves.)_

### 1. Submit Booking Proposal

**As a student or faculty, I want to submit a booking proposal so that I can request access to resources for my activities.**

Subtasks:

- Select resource, date, time
- Add purpose

**Acceptance Criteria:**

- Form requires resource, start/end time (no overlap with unavailable), purpose (min 50 chars); submission sets status=pending; email confirmation sent.
- Quantity specified if applicable (<= available); invalid dates (past, holidays) rejected; success redirects to proposals list.

### 2. View Available Slots

**As a student or faculty, I want to view available time slots for a resource so that I can select a feasible booking time.**

Subtasks:

- Query reserved slots
- Show free timings

**Acceptance Criteria:**

- Calendar UI shows green slots (free) vs red (booked) for selected resource, next 90 days; click to select slot; auto-adjusts end time (e.g., 1-hour default).
- Respects timetable; min 15-min increments; mobile swipe-friendly; real-time updates if concurrent bookings.

### 3. Prevent Overlapping Requests

**As a student or faculty, I want overlapping requests to be prevented so that I avoid conflicts with existing bookings.**

Subtasks:

- Validate requested timeslot
- Reject overlaps

**Acceptance Criteria:**

- On submit, checks against approved/pending bookings for same resource; overlap (>5 min) shows error: "Slot unavailable, try another time."
- Allows same-user overlaps if multi-resource; edge cases (exact start/end) permitted if no conflict; admin overrides possible in approval.

### 4. Proposal Draft Mode

**As a student or faculty, I want to save draft proposals so that I can complete and submit them later without losing progress.**

Subtasks:

- Save partial proposal
- Continue later

**Acceptance Criteria:**

- "Save Draft" button stores incomplete form data tied to user ID; drafts list in dashboard; auto-load on resume.
- Expires after 14 days; max 5 active drafts per user; no email on save; only on submit; deletes on final submission.

### 5. Submit Proposal for Approval

**As a student or faculty, I want to submit my proposal for approval so that it enters the review process.**

Subtasks:

- Change status → pending
- Lock editing after submission

**Acceptance Criteria:**

- "Submit" validates all required fields; sets status=pending, notifies admin via email; post-submit, edit locked (view only); drafts cleared.
- User gets tracking ID and estimated approval time; submission logged with timestamp; bulk submit not supported.

### 6. Cancel Proposal (Pending Only)

**As a student or faculty, I want to cancel a pending proposal so that I can withdraw requests that are no longer needed.**

Subtasks:

- Update status → cancelled

**Acceptance Criteria:**

- Cancel button available only for pending proposals; requires confirmation; sets status=cancelled; notifies admin if >24 hours pending.
- Frees slot for others immediately; reason optional; logged; cannot cancel approved/completed.

### 7. View My Proposals

**As a student or faculty, I want to view my submitted proposals so that I can track their status and history.**

Subtasks:

- Timeline display
- Show statuses

**Acceptance Criteria:**

- Dashboard lists proposals: ID, resource, date, status (color-coded: pending yellow, approved green, etc.); timeline view: chronological events (submitted, approved).
- Filters: status, date range; pagination; search by ID; refresh pulls latest status.

### 8. Proposal Details Page

**As a student or faculty, I want to view details of a specific proposal so that I can review or reference my request.**

Subtasks:

- Show resource
- Show date/time
- Show purpose

**Acceptance Criteria:**

- Page shows full data: resource details, times, purpose, attachments, status history; edit link if pending; download attachments.
- 404 if not owner's proposal; print-friendly view; last updated timestamp.

### 9. Attachments for Proposal

**As a student or faculty, I want to attach files to my proposal so that I can provide supporting documents for approval.**

Subtasks:

- Upload PDFs/images
- File size limit

**Acceptance Criteria:**

- Upload up to 5 files (PDF/JPG/PNG, max 10MB each) during proposal creation/edit; progress bar; virus scan.
- List with previews; delete before submit; stored securely; accessible post-approval; required for certain purposes (e.g., events).

### 10. Multi-Day Proposal Request

**As a student or faculty, I want to request multi-day bookings so that I can secure resources for extended events or projects.**

Subtasks:

- Select date range
- Validate all days

**Acceptance Criteria:**

- Date picker selects start/end (max 7 days); checks availability for entire range; UI shows daily breakdowns; gaps auto-filled.
- Overlap on any day rejects; purpose must justify multi-day; splits into daily entries for tracking.

### 11. Recurring Proposals

**As a student or faculty, I want to submit recurring proposals so that I can automate bookings for regular activities like classes.**

Subtasks:

- Weekly frequency
- Generate multiple entries

**Acceptance Criteria:**

- Options: weekly (e.g., every Mon 10-12 for 10 weeks); max 52 occurrences; validates all slots free before generate.
- Creates linked proposals; cancel one affects series option; purpose template for recurring; admin approves series as bulk.

### 12. Purpose Templates

**As a student or faculty, I want to select from purpose templates so that I can quickly describe common booking reasons.**

Subtasks:

- Predefined purposes
- Quick selection

**Acceptance Criteria:**

- Dropdown: "Class", "Meeting", "Lab Experiment", etc.; editable after select; templates pre-filled text; custom option.
- Role-specific (e.g., faculty: "Research"); admin can add/edit global templates; ensures min char length met.

### 13. Modify Proposal Before Approval

**As a student or faculty, I want to modify a pending proposal so that I can adjust details before final submission.**

Subtasks:

- Edit timings
- Edit purpose

**Acceptance Criteria:**

- Edit button for pending only; re-validates overlaps/fields on save; changes notify admin if >24 hours pending.
- Version history: shows diffs; cannot edit after approval; drafts unaffected.

### 14. Combined Student/Faculty View

**As a student or faculty, I want a unified view of my proposals so that I can manage all requests from one dashboard.**

Subtasks:

- Unified dashboard
- Status filters

**Acceptance Criteria:**

- Single dashboard tab for all proposals; filters by status/resource; cards show key info; click to details.
- Role-agnostic; same UI for student/faculty; real-time status updates via polling; empty state with "Create Proposal" CTA.

### 15. Proposal Comments (Admin Only View)

**As an admin, I want to add internal comments on proposals so that I can collaborate on reviews without user visibility.**

Subtasks:

- Admin receives comments on proposal
- User cannot see internal review

**Acceptance Criteria:**

- Comment box in admin proposal view; threaded, timestamped; visible only to admins; stored per proposal.
- Notifications to other admins on new comment; export includes comments; max 1000 chars per comment.

---

## EPIC 4 — Approval Workflow (Admin Only) (15 stories)

### 1. Approve Proposal

**As an admin, I want to approve proposals so that authorized users can proceed with their bookings.**

Subtasks:

- Change status → approved
- Save timestamp

**Acceptance Criteria:**

- Approve button on pending proposal; sets status=approved, emails user; logs approver ID/timestamp; slot marked booked.
- Rejects conflicting pendings auto; confirmation modal; cannot approve expired/overlapped.

### 2. Reject Proposal

**As an admin, I want to reject proposals with a note so that users understand the reason and can resubmit if needed.**

Subtasks:

- Add rejection note

**Acceptance Criteria:**

- Reject form requires note (min 20 chars); sets status=rejected, emails user with note; frees slot; logs reason.
- User can view note in details; bulk reject with common note; analytics track rejection reasons.

### 3. Approval Dashboard

**As an admin, I want a dashboard for pending approvals so that I can efficiently review and process requests.**

Subtasks:

- Pending list
- Sort by date/resource

**Acceptance Criteria:**

- Lists pendings: sorted by submit date desc; columns: user, resource, time, days pending; search/filter: resource, user, date.
- Cards clickable to details; real-time count badge; empty: "No pending approvals."

### 4. Conflict Verification Before Approval

**As an admin, I want to verify conflicts before approving so that I prevent scheduling overlaps automatically.**

Subtasks:

- Double-check overlap
- Block approval if conflict

**Acceptance Criteria:**

- Pre-approve scan: highlights overlaps with other proposals; if conflict, disable approve; suggest alternatives.
- Logs verification attempt; for recurring/multi-day, checks all instances; manual override with reason required.

### 5. View Full Request Details

**As an admin, I want to view complete proposal details so that I can make informed approval decisions.**

Subtasks:

- Show all proposal data

**Acceptance Criteria:**

- Details page: user info, resource, times, purpose, attachments, comments; timeline of events.
- Related proposals (user's others); print/export option; secure: no edit unless in edit story.

### 6. Approve Multi-day Requests

**As an admin, I want to approve multi-day requests so that I can handle extended bookings across multiple dates.**

Subtasks:

- Validate all days free
- Confirm approval

**Acceptance Criteria:**

- Checks each day for conflicts; approve all or none; emails summary for range; creates separate entries per day.
- Override if partial conflict with note; UI calendar shows full range.

### 7. Approve Recurring Requests

**As an admin, I want to approve recurring requests in bulk so that I can streamline approvals for ongoing schedules.**

Subtasks:

- Approve all generated bookings

**Acceptance Criteria:**

- Series view: approve all, partial (select dates), or none; validates future instances only; emails series summary.
- Cancels series on reject; limit: max 52 approvals at once.

### 8. Edit Proposal Before Approval

**As an admin, I want to edit proposals before approving so that I can correct minor issues on behalf of the user.**

Subtasks:

- Change time/date
- Admin override

**Acceptance Criteria:**

- Admin edit mode: adjust times/purpose; notifies user of changes; re-validates overlaps.
- Logs edits with "Admin modified."; user sees final version post-approval; audit trail required.

### 9. Bulk Approvals

**As an admin, I want to approve multiple proposals at once so that I can handle high-volume requests efficiently.**

Subtasks:

- Select multiple proposals

**Acceptance Criteria:**

- Checkbox select on dashboard; bulk approve with optional note; processes in batch; emails each user.
- Skips conflicts; reports summary; max 50 at once; undo window: 5 mins.

### 10. Approval Logs

**As an admin, I want to log all approval actions so that I can audit decisions for accountability.**

Subtasks:

- Save admin name
- Timestamp logging

**Acceptance Criteria:**

- Every action (approve/reject/edit) logs: proposal ID, admin, action, timestamp, note; searchable log view: filter by date/admin/proposal.
- Export CSV; retention: 2 years; alerts for unusual patterns.

### 11. Filter Requests

**As an admin, I want to filter approval requests so that I can prioritize based on criteria like date or resource.**

Subtasks:

- Filter by date
- Filter by resource
- Filter by role

**Acceptance Criteria:**

- Dashboard filters: date range, resource, user role, status; dynamic update; combines (e.g., student + lab resources).
- Saves user preferences; <1 second load; clear all button.

### 12. Auto-Expire Stale Requests

**As an admin, I want stale pending requests to auto-expire so that the queue remains current and uncluttered.**

Subtasks:

- Pending >7 days → expired

**Acceptance Criteria:**

- Cron job checks daily; sets status=expired if >7 days; emails user: "Proposal expired, resubmit if needed."
- Removes from pending dashboard; configurable threshold (admin setting); logs expiry event.

### 13. View Attachments

**As an admin, I want to view proposal attachments so that I can review supporting materials during approval.**

Subtasks:

- Preview documents

**Acceptance Criteria:**

- Inline preview: PDF first page, image thumbnails; download all as zip; virus scan on view.
- Watermark sensitive docs; delete if invalid (with log).

### 14. Approval History

**As an admin, I want to view the history of all approvals and rejections so that I can track trends and outcomes.**

Subtasks:

- Show all approved/rejected lists

**Acceptance Criteria:**

- Separate tabs: approved (past 30 days), rejected (all); metrics: count, avg time to approve.
- Filter by period/resource; export reports; trends chart (line graph).

### 15. Track Resource Conflicts

**As an admin, I want to track conflicting proposals so that I can resolve scheduling issues proactively.**

Subtasks:

- Show what other proposals overlap

**Acceptance Criteria:**

- On proposal details: list overlapping pendings with links; dashboard alert section for high-conflict resources.
- Auto-suggest resolutions (e.g., shift time); email chain for involved users; resolve button to reject one.

---

## EPIC 5 — Utilization Analytics & Insights (15 stories)

_(Simple analytics, NO machine learning)_

### 1. Daily Utilization Statistics

**As an admin, I want daily utilization statistics so that I can monitor resource usage on a day-to-day basis.**

Subtasks:

- Hours booked per day

**Acceptance Criteria:**

- Dashboard widget: bar chart of booked hours per day (last 7 days); data accurate to minute; % utilization (booked/total available).
- Drill-down to resources; real-time if current day; mobile view stacks.

### 2. Weekly Utilization

**As an admin, I want weekly utilization reports so that I can identify short-term trends in resource demand.**

Subtasks:

- Aggregation queries

**Acceptance Criteria:**

- Weekly summary: total bookings, avg daily use, top resources; line chart: week-over-week comparison.
- Filter by resource type; auto-generate every Sunday; email option.

### 3. Resource Heatmap

**As an admin, I want a heatmap of resource usage so that I can visualize peak hours at a glance.**

Subtasks:

- Hourly usage graph

**Acceptance Criteria:**

- Color-coded grid: rows=resources, cols=hours (Mon-Sun), intensity=bookings; interactive: hover for details, zoom.
- Last 30 days data; export PNG; highlights peaks (>80% use).

### 4. Peak Usage Times

**As an admin, I want to identify peak usage times so that I can optimize scheduling and reduce bottlenecks.**

Subtasks:

- Identify most busy hours

**Acceptance Criteria:**

- Report: top 5 peak slots (e.g., Tue 2-3pm: 90% use); based on last 90 days; per resource or global.
- Suggestions: "Extend hours during peaks."; table + chart; threshold configurable.

### 5. Underused Resources

**As an admin, I want alerts for underused resources so that I can reallocate or promote them to increase efficiency.**

Subtasks:

- Detect low usage

**Acceptance Criteria:**

- Alert if <20% utilization over 30 days; list in dashboard: resource, % use, last booking.
- Email weekly; dismiss option; criteria: avg weekly bookings <2; link to promote (e.g., email users).

### 6. Usage by Role (Student vs Faculty)

**As an admin, I want usage analytics by role so that I can balance access between students and faculty.**

Subtasks:

- Compare booking counts

**Acceptance Criteria:**

- Pie chart: % bookings by role (student/faculty); table: counts, avg duration per role.
- Last month; filter by resource; trends: month-over-month; export data.

### 7. Resource Occupancy Timeline

**As an admin, I want a timeline chart of resource occupancy so that I can forecast future availability.**

Subtasks:

- Chart booked timeline

**Acceptance Criteria:**

- Gantt-like chart: resources horizontal, time vertical (next 14 days); color: booked (red), free (green), pending (yellow).
- Zoom/pan; per resource filter; export PDF; highlights gaps >4 hours.

### 8. Export CSV

**As an admin, I want to export analytics data as CSV so that I can analyze it in external tools like spreadsheets.**

Subtasks:

- Generate downloadable CSV

**Acceptance Criteria:**

- Button on each report: exports raw data (e.g., date, resource, hours); UTF-8, proper headers.
- Max 10k rows; paginated if larger; secure download (auth); filename: "utilization\_[date].csv".

### 9. Export PDF

**As an admin, I want to export analytics as PDF so that I can share summarized reports with stakeholders.**

Subtasks:

- PDF summary generator

**Acceptance Criteria:**

- Generates multi-page PDF: charts, tables, summary stats; custom date range; branded header.
- <5 seconds generate; download or email; includes watermark "Internal Use".

### 10. Monthly Summary Report

**As an admin, I want monthly summary reports so that I can review overall system performance periodically.**

Subtasks:

- Count of proposals
- Approvals/rejections

**Acceptance Criteria:**

- Auto-report: total proposals, approval rate (%), top resources, avg time to approve; table + key metrics cards.
- Last 12 months archive; shareable link; threshold alerts (e.g., rejection >20%).

### 11. Rejection Reason Statistics

**As an admin, I want statistics on rejection reasons so that I can improve processes and reduce future denials.**

Subtasks:

- Aggregate most common reasons

**Acceptance Criteria:**

- Bar chart: top 5 reasons (from notes), count %; last 90 days; filter by resource.
- Suggestions: "Common reason 'Conflict' – improve slot view."; export; anonymized user data.

### 12. Most Demanded Resources

**As an admin, I want a ranking of most demanded resources so that I can prioritize maintenance and expansions.**

Subtasks:

- Ranking system

**Acceptance Criteria:**

- Top 10 list: resource, booking count, % capacity use; last month; sortable table.
- Trends arrow (up/down); threshold: >50 bookings = high demand; link to resource details.

### 13. Multi-Day Usage Chart

**As an admin, I want charts for multi-day usage so that I can understand patterns in long-term bookings.**

Subtasks:

- Visualize long bookings

**Acceptance Criteria:**

- Stacked bar: % multi-day vs single, by duration (1-3, 4-7 days); per resource or global.
- Last year; pie for types; notes low multi-day use; interactive legend.

### 14. Resource Usage vs Capacity

**As an admin, I want comparisons of usage against capacity so that I can assess if resources are over- or under-provisioned.**

Subtasks:

- Compare potential vs actual usage

**Acceptance Criteria:**

- Gauge charts: actual % of max capacity (e.g., 60/100 hours used); per resource; avg over month.
- Color: green <70%, yellow 70-90%, red >90%; table export; recommendations: "Add capacity if >90%."

### 15. Admin Dashboard Analytics View

**As an admin, I want a centralized analytics dashboard so that I can access all insights in one comprehensive view.**

Subtasks:

- Combine all charts
- Quick summaries

**Acceptance Criteria:**

- Single page: widgets for daily/weekly, heatmap, peaks, etc.; draggable/resizable; quick stats: total bookings today, pending count.
- Date picker global; role: admin only; load <3 seconds; lazy load charts.

---

## Additional User Story: Student Dashboard View

**As a student, I want to view my personalized dashboard so that I can quickly see my upcoming bookings, pending proposals, and available resources at a glance.**  
_(This can be integrated into EPIC 3, Story 14, or as a new story under a future EPIC for enhanced user experience.)_

**Acceptance Criteria:**

- Dashboard loads on login: sections for upcoming (next 7 days), pending proposals (list with status), quick search for resources.
- Cards: clickable to details; empty states with CTAs (e.g., "No bookings? Book now"); personalized: filters by user; real-time updates; responsive; accessible; performance: <2 seconds load.
