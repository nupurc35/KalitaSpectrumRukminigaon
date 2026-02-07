# Project Audit Report

Date: 2026-02-07
Scope: Full repository review (frontend, admin, services, and Supabase usage).

## Executive Summary
- The application is feature-rich and close to launch, but multi-tenant data scoping, admin authorization, and abuse protections are not fully hardened.
- Several integrations are stubbed or partially wired (Gemini, email notifications, placeholder reservation API, and mock BookingForm flow).
- Error handling is inconsistent across the UI, and there is no dedicated test coverage or test runner configured.

## Incomplete Features
- Gemini adapter is stubbed and not used by the chat UI (`src/modules/ai/chat/gemini.adapter.ts`, `src/modules/ai/chat/ChatConcierge.tsx`).
- BookingForm is a mock flow with `setTimeout` and no persistence (`src/components/BookingForm.tsx`).
- Placeholder reservation API remains in the codebase and is not part of the live flow (`src/services/reservationService.ts`).
- Missing `WhatsAppButton` component referenced by Hero (`src/components/Hero.tsx`).

## Missing Integrations
- Email notifications for reservations/leads (no provider or service wired).
- Centralized error reporting/monitoring (only `console.error` usage).
- Abuse protection and rate limiting for public form submissions and chat leads.
- Gemini/AI integration should be server-side to avoid exposing API keys (`src/modules/ai/chat/gemini.adapter.ts`).

## Error Handling Gaps
- Restaurant fetch errors are cached as “loaded” with no retry or user-visible fallback (`src/hooks/useRestaurant.ts`).
- ProtectedRoute has no error state for auth failures and renders a blank screen during loading (`src/components/protectedRoute.tsx`).
- Multiple user flows rely on `alert` instead of inline or toast-based validation feedback (`src/pages/Contact.tsx`, `src/components/ReservationForm.tsx`, `src/modules/ai/chat/ChatConcierge.tsx`, `src/pages/admin/Dashboard.tsx`).
- Reservation fallback helper is disconnected from the primary reservation flow (`src/services/reservationService.ts`, `src/components/ReservationForm.tsx`).

## Route Validation Issues
- No 404/catch-all route for unknown paths (`src/App.tsx`).
- Duplicate route protection on Create Order (route-level and component-level) (`src/App.tsx`, `src/pages/admin/CreateOrder.tsx`).
- `/thank-you` depends only on route state; there is no resilient fallback for page refresh (`src/App.tsx`, `src/pages/ThankYou.tsx`).

## Security Concerns
- Multi-tenant scoping is missing on several Supabase reads/updates (risk of data leakage).
  - Examples: `src/pages/Menu.tsx`, `src/hooks/useRestaurant.ts`, `src/pages/admin/Dashboard.tsx`, `src/pages/admin/AdminDashboardStats.tsx`, `src/pages/admin/CategoryManager.tsx`, `src/services/adminService.ts`.
- Hard-coded restaurant ID fallback risks cross-tenant writes (`src/constants/restaurent.ts`, `src/components/ReservationForm.tsx`).
- Public writes (leads/reservations) rely entirely on Supabase RLS with no in-app rate limiting (`src/components/ReservationForm.tsx`, `src/pages/Contact.tsx`, `src/modules/ai/chat/chat.controller.ts`, `src/services/leadService.ts`).
- Client-side API keys would be exposed if Gemini is enabled (`src/modules/ai/chat/gemini.adapter.ts`).

## Performance Issues
- Unbounded queries in admin and menu views can grow without pagination (`src/services/adminService.ts`, `src/pages/admin/Dashboard.tsx`, `src/pages/Menu.tsx`).
- Dashboard stats run multiple count queries on every mount (`src/pages/admin/AdminDashboardStats.tsx`).
- `index.html` includes CDN Tailwind and importmap React while using Vite bundling, which can duplicate assets (`index.html`, `src/index.css`).

## Testing Gaps
- No test scripts in `package.json` and no test files observed in the repo (`package.json`).
- No unit tests for validation, hooks, or services.
- No integration or end-to-end tests for reservations, leads, or admin flows.

## Priority Classification (Critical / High / Medium / Low)
- Critical: Tenant scoping/RLS enforcement, removal of hard-coded restaurant IDs, admin authorization hardening, abuse protection/rate limiting.
- High: Replace placeholder reservation API, integrate BookingForm with real persistence, add email notifications, wire Gemini server-side or remove, standardize analytics config.
- Medium: Add 404 route, improve `/thank-you` refresh behavior, unify validation UX and error states, add pagination/limits, add centralized logging.
- Low: Clean up unused components/TODOs, optimize asset loading, add performance polish and UI refinements.

## Overall Production Readiness Estimate
- Current status: Not production ready.
- Primary blockers: multi-tenant security scoping, missing abuse protections, and incomplete integrations for reservations/notifications.
- With the critical and high-priority items addressed, the project should be able to reach a stable production-ready state.
