## Code Refactoring & Structural Improvements

### What was refactored

- Multiple service files were refactored to achieve a cleaner separation of business logic.
- The Supabase integration structure was improved for consistency and maintainability.
- The reservation submission flow was streamlined and redundant logic was removed.
- Lead creation and intent handling processes were enhanced for clarity and robustness.
- Admin dashboard logic was refactored for better modularity and code reuse.
- Logout functionality was fixed to ensure reliable session termination.
- Error handling and console debugging were improved across the codebase.
- Unused code was removed and overall code readability was enhanced.
- The modular structure of components and services was strengthened.

### Why it was refactored

- To reduce code duplication and centralize business logic for easier updates.
- To improve the clarity and maintainability of the codebase.
- To address technical debt and remove obsolete or redundant code.
- To enhance the reliability of user flows and backend integration.
- To ensure a more consistent developer experience across the project.

### Architectural improvement achieved

- Business logic is now more clearly separated from presentation and API layers.
- Supabase integration points are standardized, reducing coupling and potential errors.
- The codebase is more modular, with reusable components and services.
- Error handling is more consistent, improving debuggability and reliability.
- The overall project structure is cleaner, making onboarding and future development easier.

### Impact on scalability and maintainability

- The improved modularity and separation of concerns make it easier to scale features and onboard new developers.
- Centralized business logic reduces the risk of inconsistencies and simplifies future enhancements.
- Enhanced error handling and debugging facilitate faster issue resolution.
- The cleaned and refactored codebase is more maintainable, reducing long-term technical debt and supporting sustainable growth.
# Execution Plan

## Critical (Immediate Fix)
- [ ] Enforce tenant scoping on all Supabase queries/mutations (add `restaurant_id` filters and verify RLS).
- [ ] Remove hard-coded restaurant ID fallback and fail fast when `VITE_RESTAURANT_ID` is missing.
- [ ] Add admin role validation beyond session presence (gate `/admin` access by role/claim).
- [ ] Add abuse protection and rate limiting for public reservation/lead endpoints (Supabase policies or edge function).

## High Priority
- [ ] Replace placeholder reservation API with real persistence and align all reservation flows.
- [x] Integrate `BookingForm` with the live reservations table or remove it if unused.
- [x] Implement email notifications for reservations (customer + admin).
- [ ] Implement SMS notifications for reservations and lead callbacks.
- [ ] Normalize analytics config to environment variables and avoid duplicate GA injection.

## Medium Priority
- [ ] Add 404/catch-all route and polish route guard behavior for `/thank-you` refresh scenarios.
- [ ] Standardize input validation UX (replace alerts with inline errors/toasts; confirm all forms use shared validation).
- [ ] Add pagination/limits for admin lists and menu pages; optimize dashboard queries.
- [ ] Add centralized logging from ErrorBoundary to a monitoring endpoint.

## Low Priority
- [x] Clean up unused components and stale TODOs (e.g., unused Hero/WhatsAppButton refs).
- [x] Optimize asset loading (images, fonts) and remove redundant CDN dependencies.
- [x] Establish a test suite (unit + integration + e2e) and add CI coverage gates.

## Completed (2026-02-07)
- Implemented global ErrorBoundary and wrapped the app to prevent crashes.
- Added `/thank-you` guard logic to block direct navigation without state.
- Created shared validation utilities and refactored key forms to use them.
- Removed unused components (Hero, BookingForm) and stale TODOs.
- Removed redundant CDN dependencies and wired Tailwind via project config.
- Improved image loading behavior with lazy/async decoding and prioritized the hero image.
- Implemented email-only reservation confirmations via Supabase Edge Function + Resend.
- Updated reservation flow to collect email and display a clean success message UI.
- Removed WhatsApp confirmation link logic from the reservation confirmation flow.
- Restored Tailwind v3 configuration to ensure utility classes compile reliably.
- Added Playwright E2E coverage with a reservation form test.
- Updated Playwright config with Chromium-only and dev webServer settings.

## Completed (2026-02-09)
- Completed full CRM lifecycle for Leads:
  - Implemented lead statuses: "New", "Contacted", "Reservation Created", "Closed Won", "Closed Lost".
  - Updated `LeadsPage` action logic:
    - `New` → "Mark Contacted" / "Close Lost"
    - `Contacted` → "Convert" / "Close Lost"
    - `Reservation Created` and closed states are locked (read-only)
  - Implemented `convertLeadToReservation` in `adminService` and linked `reservation_id` on leads.
  - Fixed a 400 Bad Request by removing an unsafe `restaurant_id` filter during lead updates.

- Completed Reservation workflow simplification:
  - Removed the `confirmed` stage; reservation default status is `pending`.
  - `pending` → `completed` | `cancelled`; once `completed`/`cancelled` the reservation is read-only.
  - Reservation status transitions are synchronized with lead lifecycle:
    - reservation `completed` → lead `Closed Won`
    - reservation `cancelled` → lead `Closed Lost`

- Stabilized service-layer responsibilities:
  - Centralized business logic in `adminService` (conversion + lead-closing operations).
  - UI components (e.g., `LeadsPage`, `ReservationsPage`) now only render and trigger services.
  - Preserved pagination, delete logic, and existing error handling; changes are TypeScript-safe.
