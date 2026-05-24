begin;

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
    updated_at = now()
  where work_email = 'wonder.wander19@gmail.com'
    and department_id is null;

  update public.staff_profiles
  set
    can_host_visits = false,
    updated_at = now()
  where permission_role = 'admin'
    and department_id is null
    and can_host_visits = true;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'staff_profiles_hostable_requires_department'
  ) then
    alter table public.staff_profiles
      add constraint staff_profiles_hostable_requires_department
      check (not can_host_visits or department_id is not null);
  end if;
end
$$;

commit;
