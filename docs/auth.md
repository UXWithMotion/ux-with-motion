# Supabase Auth and protected routes

Project: `eyaboutrlkgwyitvufxa` (`ux-with-motion`). The existing project already has Google identities and row-level security on all public tables. This integration preserves Google sign-in for the public app and password sign-in for admins.

## Runtime configuration

Configure these in the app host and local environment (never commit actual keys):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://eyaboutrlkgwyitvufxa.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
SUPABASE_SECRET_KEY=<server-only secret for privileged admin mutations>
```

The Supabase ChatGPT connection provides management access; it does not populate environment variables in the running app.

In Supabase Authentication > URL Configuration, set the production Site URL to the actual app origin and allow `/auth/callback` for production, local development, and any trusted preview deployments. Google OAuth must be enabled under Sign In / Providers with its configured Google credentials. Existing Google identities confirm prior use; the plugin does not expose provider/redirect configuration or a live user sign-in session for verification.

## Protection boundaries

- Proxy refreshes and verifies claims and redirects anonymous `/admin` and `/admin/*` requests to `/admin/login?next=...`, preserving session cookies and cache headers. `/admin/login` remains public.
- The protected admin layout and each existing admin data/mutation action call `requireAdmin()`. It verifies the current user with Supabase Auth and checks the stored `user_roles` row. User-editable metadata never grants admin access.
- Use `requireUser('/your/protected/path')` inside future authenticated pages and data/actions. A layout alone does not protect nested data or server actions.
- Subscription APIs retain their server-side identity checks. Webhooks retain their separate provider signature verification.
- Login destinations accept same-origin relative paths only. Admin sign-in also restricts its destination to admin routes. OAuth callbacks ignore forwarded-host headers.
- Logout refreshes the router after successful sign-out. The service client is marked `server-only`; its secret must never use a `NEXT_PUBLIC_` prefix.
- The component library remains public; existing authenticated source-code rules are preserved.

Admin roles must be provisioned through trusted database administration. Do not grant users permission to assign their own role.

## Verification

Run `node --test tests/auth.test.mjs` and `npx tsc --noEmit`. Tests cover anonymous redirects, refresh cookies, auth outages, non-admin denial, unsafe return paths, and OAuth callback success/failure behavior using mocked Auth responses. A browser check confirms anonymous access to an admin URL lands on the login form with its destination retained. Live OAuth/password login still requires a real account and permitted Auth network access.

Database verification found no drafts visible to the anonymous role. The Email Input record is saved with status `draft` and eight customization states; publishing remains an admin action.

Existing project advisories (not changed by this work):

- [Leaked password protection is disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- [Two timestamp trigger functions have mutable search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).
- [The server-managed webhook_events table has RLS enabled without client policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), which denies client access by default.
