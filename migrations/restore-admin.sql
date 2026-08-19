-- =====================================================================
--  Restore the EZMoov super admin account
--  Project: icpqdnkbhdavpcaievdz
--
--  Safe to run ANY number of times. It creates what's missing and leaves
--  what already exists alone, so you can paste it into the SQL Editor
--  whenever /admin stops letting you in.
--
--  Login after running:
--      admin@ezmoov.com
--      EZm!EBlzgzgrfdtD77#Ad
--
--  WHY YOU NEED THIS
--  Something in your workflow keeps clearing auth.users — I've had to
--  recreate this account three times. Observed counts over a few days:
--
--      auth.users : 3  ->  14  ->  3  ->  7
--      bookings   : 25 ->  18  ->  5
--
--  That pattern is a reset/reseed script, a restored backup, or a manual
--  clear — not something the app does on its own. Until you find it, this
--  file is the one-step recovery.
--
--  The admin lives in TWO places, and both must exist:
--    1. auth.users        -> the credentials
--    2. public.users.role -> the 'admin' role that is_admin() reads
--  Losing #1 gives "Incorrect email or password".
--  Losing #2 gives "This account is not an EZMoov administrator".
-- =====================================================================

with upsert_auth as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  select '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
         'authenticated', 'authenticated', 'admin@ezmoov.com',
         extensions.crypt('EZm!EBlzgzgrfdtD77#Ad', extensions.gen_salt('bf')),
         now(), now(), now(),
         '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
         '{"full_name":"EZMoov Super Admin"}'::jsonb,
         '', '', '', ''
  where not exists (select 1 from auth.users where email = 'admin@ezmoov.com')
  returning id, email, created_at
),
admin_row as (
  select id, email, created_at from upsert_auth
  union all
  select id, email, created_at from auth.users
   where email = 'admin@ezmoov.com'
     and not exists (select 1 from upsert_auth)
),
ident as (
  -- Supabase needs a matching identity row or email sign-in fails.
  insert into auth.identities (id, user_id, provider_id, identity_data, provider,
                               last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), ar.id, ar.id::text,
         jsonb_build_object('sub', ar.id::text, 'email', ar.email,
                            'email_verified', true, 'phone_verified', false),
         'email', now(), now(), now()
  from admin_row ar
  where not exists (
    select 1 from auth.identities i where i.user_id = ar.id and i.provider = 'email'
  )
  returning user_id
)
insert into public.users (id, email, full_name, role, created_at)
select ar.id, ar.email, 'EZMoov Super Admin', 'admin'::public.user_role, ar.created_at
from admin_row ar
on conflict (id) do update
  set role = 'admin'::public.user_role, email = excluded.email;


-- ---------------------------------------------------------------------
-- Also restore any customers who lost their public.users profile row.
-- handle_new_user() only fires on INSERT into auth.users, so deleting
-- from public.users leaves those accounts profile-less permanently.
-- ---------------------------------------------------------------------
insert into public.users (id, phone_number, email, full_name, role, created_at)
select a.id, a.phone, a.email,
       coalesce(nullif(trim(a.raw_user_meta_data->>'full_name'), ''), 'New User'),
       coalesce((a.raw_app_meta_data->>'role')::public.user_role, 'customer'::public.user_role),
       a.created_at
from auth.users a
where not exists (select 1 from public.users u where u.id = a.id);


-- ---------------------------------------------------------------------
-- Verify — expect one admin, and the two counts equal.
-- ---------------------------------------------------------------------
select (select count(*) from auth.users)                        as auth_users,
       (select count(*) from public.users)                      as public_users,
       (select count(*) from public.users where role = 'admin') as admins;
