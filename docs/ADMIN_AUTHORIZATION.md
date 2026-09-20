# WiTECH admin authorization

Admin access uses the `public.admin_users` UUID allowlist. Supabase Auth identifies the browser user; PostgreSQL RLS and `private.is_admin()` enforce authorization for content and storage writes.

## Bootstrap

1. Apply `supabase/migrations/20260920120000_admin_allowlist_rls.sql`.
2. In Supabase Dashboard, open **Authentication → Users** and copy the existing administrator's **User UID**.
3. In SQL Editor, run:

```sql
INSERT INTO public.admin_users (user_id)
VALUES ('<REAL_ADMIN_AUTH_USER_UUID>');
```

The migration intentionally leaves the allowlist empty. Add or remove administrators only from trusted Supabase tooling; browser users cannot modify memberships.

## Verification order

Apply migration → insert the existing admin UUID → confirm membership → log out/in or refresh → verify admin CRUD and media operations → verify a non-admin cannot write → deploy frontend.
