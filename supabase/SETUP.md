# Supabase setup

1. Create a Supabase project and open its SQL Editor.
2. Run `migrations/001_create_appointments.sql`.
3. In **Authentication → Providers → Email**, enable email/password sign-in. Turn off public sign-ups; this app has no administrator registration page.
4. In **Project Settings → API**, copy the Project URL and the publishable key (or the legacy `anon` key). Put them in Replit Secrets/environment variables as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. For a local checkout, copy `.env.example` to `.env.local` and fill in those values. Never put a service-role or secret key in the app.
5. In **Authentication → Users**, create the first administrator with the clinic email and a strong password. Then run this in the SQL Editor, replacing the email:

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where lower(email) = lower('admin@example.com')
   on conflict (user_id) do nothing;
   ```

6. Test public booking and `/admin` after configuring the values. A visitor can create an appointment but cannot read it. Only an authenticated user whose UUID is in `admin_users` can read, update status, or delete appointments. Keep the `admin_users` table and `is_clinic_admin()` function as created by the migration.

The project intentionally does not claim a live Supabase connection until these project-specific values are set and a booking/login has been tested.
