begin;

create or replace function public.sync_staff_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  resolved_role text;
  resolved_name text;
  resolved_job_title text;
  resolved_department_id uuid;
  resolved_can_host_visits boolean;
begin
  resolved_role := case
    when coalesce(new.raw_app_meta_data ->> 'permission_role', new.raw_app_meta_data ->> 'role') = 'admin' then 'admin'
    else 'host'
  end;

  resolved_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    initcap(replace(split_part(coalesce(new.email, 'staff'), '@', 1), '.', ' '))
  );

  resolved_job_title := nullif(new.raw_user_meta_data ->> 'job_title', '');

  select sp.department_id
  into resolved_department_id
  from public.staff_profiles sp
  where sp.id = new.id
  limit 1;

  resolved_can_host_visits := case
    when resolved_role = 'admin' then false
    when resolved_department_id is null then false
    else coalesce((new.raw_user_meta_data ->> 'can_host_visits')::boolean, true)
  end;

  insert into public.staff_profiles (
    id,
    full_name,
    work_email,
    permission_role,
    job_title,
    department_id,
    account_status,
    can_host_visits,
    created_at,
    updated_at
  )
  values (
    new.id,
    resolved_name,
    coalesce(new.email, ''),
    resolved_role,
    resolved_job_title,
    resolved_department_id,
    case when new.email_confirmed_at is not null then 'active' else 'invited' end,
    resolved_can_host_visits,
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      work_email = excluded.work_email,
      permission_role = excluded.permission_role,
      job_title = coalesce(excluded.job_title, public.staff_profiles.job_title),
      account_status = excluded.account_status,
      can_host_visits = excluded.can_host_visits,
      updated_at = now();

  return new;
end;
$function$;

do $$
declare
  v_people_ops_department_id uuid;
begin
  select d.id
  into v_people_ops_department_id
  from public.departments d
  where d.name = 'People Operations'
  limit 1;

  if v_people_ops_department_id is null then
    raise exception 'People Operations department is required for host data repair';
  end if;

  update public.staff_profiles
  set
    department_id = v_people_ops_department_id,
    job_title = coalesce(nullif(trim(job_title), ''), 'Host'),
    can_host_visits = true,
    updated_at = now()
  where work_email = 'wonder.wander19@gmail.com';

  update public.staff_profiles
  set
    can_host_visits = false,
    updated_at = now()
  where permission_role = 'admin'
    and department_id is null;

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('can_host_visits', false)
  where email = 'usmanshakeel235@gmail.com';
end
$$;

commit;
