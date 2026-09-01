# Changelog

All notable changes to this project will be documented in this file.


## [3.0.0] - 2026-09-01



### Bug Fixes

- Fix spinner anim not showing (1785ee1)
- Routing issues with resolve() (3b710b7)

### Features

- Add error page for various response code (b8c017d)
- Add skeleton loaders for instant feedback to users (1a60ea4)
- New ci pipeline (7efc349)
- Add posthog client and server and hooks.client.ts for posthog initialization (a541a06)
- Add posthog-js and node inside package.json (8b15232)
- Add posthog integration across the codebase (ce1f706)

## [2.2.2] - 2026-08-16



### Bug Fixes

- Fix turnstile token and widget not rotating after failed attempt (366b952)
- Fix redirect after successful password change (1a3ca80)

## [2.2.1] - 2026-08-13



### Bug Fixes

- Fix reset password failing (0877d8a)

### Features

- Add changelog popup for update understanding (dedf663)

## [2.2.0] - 2026-08-10



### Bug Fixes

- Added a fix to show "TAHNIAH" banner for newly paid users! (64da684)
- Fixed locals.supabase policy scope to be able to read announcements (2480eec)

### Features

- New notes reader! for extra text docs or pdfs that en ayub wants (9599456)
- Announcements now show newly added videos (0286d87)
- Missed one more page server (4a05644)
- Added new stuff on the landing page! (e104f09)
- New admin dashboards! announcements, notes, orders, users and sidebar is now in the folder (management) for new layouts to enable back button and show email of the logged in admin (b19f70f)
- Added an admin button for admin users and markdown rendering in announcement block (cdd6ed3)
- Consolidated ordersDashboard with users so its only one tile to control it all (9314749)
- Commiting profile to stage for a future feature release (3a87a6c)
- Added turnstile for bots mitigation and gating logins to improve security (9e31692)
- Added turnstile via explicit rendering to have control over turnstile box rendering (0a9439c)
- Profile page is released! (1b05b03)
- Added a second cta block at the bottom of the page (6e56713)

## [1.0.0] - 2026-07-02



