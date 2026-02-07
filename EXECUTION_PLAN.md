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
- [ ] Establish a test suite (unit + integration + e2e) and add CI coverage gates.

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
