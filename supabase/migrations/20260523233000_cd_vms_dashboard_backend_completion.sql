begin;

create or replace function public.list_host_visits(
  p_status_group text default 'all',
  p_search text default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  reference_code text,
  visitor_id uuid,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  visitor_organization text,
  host_id uuid,
  host_name text,
  host_email text,
  department_id uuid,
  department_name text,
  purpose text,
  entrance_name text,
  scheduled_for timestamptz,
  status text,
  risk_level text,
  notes text,
  check_in_at timestamptz,
  check_out_at timestamptz,
  pass_token uuid,
  pass_expires_at timestamptz,
  total_count bigint
)
language sql
stable
security definer
set search_path = public
as $function$
  with filtered as (
    select
      v.id,
      v.reference_code,
      vis.id as visitor_id,
      vis.full_name as visitor_name,
      vis.email as visitor_email,
      vis.phone as visitor_phone,
      v.visitor_organization,
      sp.id as host_id,
      sp.full_name as host_name,
      sp.work_email as host_email,
      d.id as department_id,
      d.name as department_name,
      v.purpose,
      coalesce(e.name, 'Main Lobby') as entrance_name,
      v.scheduled_for,
      v.status,
      v.risk_level,
      v.notes,
      v.check_in_at,
      v.check_out_at,
      vp.token as pass_token,
      vp.expires_at as pass_expires_at
    from public.visits v
    join public.visitors vis on vis.id = v.visitor_id
    join public.staff_profiles sp on sp.id = v.host_staff_id
    join public.departments d on d.id = v.department_id
    left join public.entrances e on e.id = v.entrance_id
    left join lateral (
      select p.token, p.expires_at
      from public.visit_passes p
      where p.visit_id = v.id
        and p.status = 'active'
        and p.revoked_at is null
      order by p.issued_at desc
      limit 1
    ) vp on true
    where v.host_staff_id = auth.uid()
      and (
        case
          when p_status_group = 'pending' then v.status = 'pending'
          when p_status_group = 'history' then v.status in ('checked_out', 'rejected', 'expired')
          when p_status_group = 'active' then v.status in ('approved', 'checked_in')
          when p_status_group = 'today' then v.scheduled_for::date = current_date
          when p_status_group = 'upcoming' then v.scheduled_for >= now() and v.status in ('pending', 'approved', 'checked_in')
          when p_status_group = 'exceptions' then v.scheduled_for < now() and v.status in ('pending', 'approved', 'checked_in')
          else true
        end
      )
      and (
        coalesce(nullif(trim(p_search), ''), '') = ''
        or (
          vis.full_name ilike '%' || trim(p_search) || '%'
          or vis.email ilike '%' || trim(p_search) || '%'
          or v.visitor_organization ilike '%' || trim(p_search) || '%'
          or d.name ilike '%' || trim(p_search) || '%'
          or v.purpose ilike '%' || trim(p_search) || '%'
          or v.reference_code ilike '%' || trim(p_search) || '%'
        )
      )
  )
  select
    filtered.*,
    count(*) over() as total_count
  from filtered
  order by filtered.scheduled_for desc
  limit greatest(coalesce(p_limit, 50), 1)
  offset greatest(coalesce(p_offset, 0), 0);
$function$;

create or replace function public.get_host_dashboard_summary()
returns table (
  expected_today integer,
  pending_approvals integer,
  checked_in_today integer,
  overdue_visits integer,
  active_passes integer,
  completed_history integer
)
language sql
stable
security definer
set search_path = public
as $function$
  select
    count(*) filter (where v.scheduled_for::date = current_date and v.status in ('pending', 'approved', 'checked_in', 'checked_out'))::integer as expected_today,
    count(*) filter (where v.status = 'pending')::integer as pending_approvals,
    count(*) filter (where v.scheduled_for::date = current_date and v.status in ('checked_in', 'checked_out'))::integer as checked_in_today,
    count(*) filter (where v.scheduled_for < now() and v.status in ('pending', 'approved', 'checked_in'))::integer as overdue_visits,
    count(*) filter (
      where exists (
        select 1
        from public.visit_passes vp
        where vp.visit_id = v.id
          and vp.status = 'active'
          and vp.revoked_at is null
      )
    )::integer as active_passes,
    count(*) filter (where v.status in ('checked_out', 'rejected', 'expired'))::integer as completed_history
  from public.visits v
  where v.host_staff_id = auth.uid();
$function$;

create or replace function public.list_recent_visit_activity(
  p_limit integer default 10
)
returns table (
  id uuid,
  event_type text,
  title text,
  detail text,
  occurred_at timestamptz,
  visitor_name text,
  department_name text
)
language sql
stable
security definer
set search_path = public
as $function$
  select
    ve.id,
    ve.event_type,
    ve.title,
    coalesce(ve.detail, v.purpose) as detail,
    ve.occurred_at,
    vis.full_name as visitor_name,
    d.name as department_name
  from public.visit_events ve
  join public.visits v on v.id = ve.visit_id
  join public.visitors vis on vis.id = v.visitor_id
  join public.departments d on d.id = v.department_id
  where
    (public.jwt_permission_role() = 'admin' or v.host_staff_id = auth.uid())
  order by ve.occurred_at desc
  limit greatest(coalesce(p_limit, 10), 1);
$function$;

create or replace function public.list_admin_visitor_logs(
  p_query text default null,
  p_status text default 'all',
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  reference_code text,
  visitor_id uuid,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  visitor_organization text,
  host_id uuid,
  host_name text,
  host_email text,
  department_id uuid,
  department_name text,
  purpose text,
  entrance_name text,
  scheduled_for timestamptz,
  status text,
  risk_level text,
  notes text,
  check_in_at timestamptz,
  check_out_at timestamptz,
  pass_token uuid,
  pass_expires_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  if public.jwt_permission_role() <> 'admin' then
    raise exception 'Admin access is required';
  end if;

  return query
  with filtered as (
    select
      v.id,
      v.reference_code,
      vis.id as visitor_id,
      vis.full_name as visitor_name,
      vis.email as visitor_email,
      vis.phone as visitor_phone,
      v.visitor_organization,
      sp.id as host_id,
      sp.full_name as host_name,
      sp.work_email as host_email,
      d.id as department_id,
      d.name as department_name,
      v.purpose,
      coalesce(e.name, 'Main Lobby') as entrance_name,
      v.scheduled_for,
      v.status,
      v.risk_level,
      v.notes,
      v.check_in_at,
      v.check_out_at,
      vp.token as pass_token,
      vp.expires_at as pass_expires_at
    from public.visits v
    join public.visitors vis on vis.id = v.visitor_id
    join public.staff_profiles sp on sp.id = v.host_staff_id
    join public.departments d on d.id = v.department_id
    left join public.entrances e on e.id = v.entrance_id
    left join lateral (
      select p.token, p.expires_at
      from public.visit_passes p
      where p.visit_id = v.id
        and p.status = 'active'
        and p.revoked_at is null
      order by p.issued_at desc
      limit 1
    ) vp on true
    where
      (
        coalesce(nullif(trim(p_status), ''), 'all') = 'all'
        or v.status = lower(trim(p_status))
      )
      and (
        coalesce(nullif(trim(p_query), ''), '') = ''
        or (
          vis.full_name ilike '%' || trim(p_query) || '%'
          or vis.email ilike '%' || trim(p_query) || '%'
          or v.visitor_organization ilike '%' || trim(p_query) || '%'
          or sp.full_name ilike '%' || trim(p_query) || '%'
          or d.name ilike '%' || trim(p_query) || '%'
          or v.purpose ilike '%' || trim(p_query) || '%'
          or v.reference_code ilike '%' || trim(p_query) || '%'
        )
      )
  )
  select
    filtered.*,
    count(*) over() as total_count
  from filtered
  order by filtered.scheduled_for desc
  limit greatest(coalesce(p_limit, 50), 1)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$function$;

create or replace function public.list_staff_directory()
returns table (
  id uuid,
  full_name text,
  work_email text,
  permission_role text,
  job_title text,
  department_name text,
  account_status text,
  assigned_visit_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  if public.jwt_permission_role() <> 'admin' then
    raise exception 'Admin access is required';
  end if;

  return query
  select
    sp.id,
    sp.full_name,
    sp.work_email,
    sp.permission_role,
    sp.job_title,
    coalesce(d.name, 'Unassigned') as department_name,
    sp.account_status,
    count(v.id) as assigned_visit_count
  from public.staff_profiles sp
  left join public.departments d on d.id = sp.department_id
  left join public.visits v on v.host_staff_id = sp.id
  group by sp.id, d.name
  order by sp.full_name;
end;
$function$;

create or replace function public.list_department_coverage()
returns table (
  id uuid,
  name text,
  floor_label text,
  active_hosts bigint,
  total_assigned_visits bigint,
  pending_visits bigint
)
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  if public.jwt_permission_role() <> 'admin' then
    raise exception 'Admin access is required';
  end if;

  return query
  select
    d.id,
    d.name,
    d.floor_label,
    count(distinct sp.id) filter (where sp.account_status = 'active' and sp.can_host_visits) as active_hosts,
    count(v.id) as total_assigned_visits,
    count(v.id) filter (where v.status = 'pending') as pending_visits
  from public.departments d
  left join public.staff_profiles sp on sp.department_id = d.id
  left join public.visits v on v.department_id = d.id
  group by d.id
  order by d.name;
end;
$function$;

create or replace function public.get_admin_report_summary()
returns table (
  total_visits integer,
  pending_count integer,
  approved_or_active_count integer,
  rejected_count integer,
  checked_in_or_out_count integer,
  elevated_risk_count integer,
  approval_rate integer,
  exception_rate integer,
  entrance_distribution jsonb
)
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  if public.jwt_permission_role() <> 'admin' then
    raise exception 'Admin access is required';
  end if;

  return query
  with base as (
    select *
    from public.visits
  ),
  totals as (
    select
      count(*)::integer as total_visits,
      count(*) filter (where status = 'pending')::integer as pending_count,
      count(*) filter (where status in ('approved', 'checked_in', 'checked_out'))::integer as approved_or_active_count,
      count(*) filter (where status = 'rejected')::integer as rejected_count,
      count(*) filter (where status = 'expired')::integer as expired_count,
      count(*) filter (where status in ('checked_in', 'checked_out'))::integer as checked_in_or_out_count,
      count(*) filter (where risk_level in ('medium', 'elevated'))::integer as elevated_risk_count
    from base
  ),
  entrance_counts as (
    select
      coalesce(e.name, 'Main Lobby') as label,
      count(*)::integer as visit_count
    from base b
    left join public.entrances e on e.id = b.entrance_id
    group by coalesce(e.name, 'Main Lobby')
    order by label
  )
  select
    totals.total_visits,
    totals.pending_count,
    totals.approved_or_active_count,
    totals.rejected_count,
    totals.checked_in_or_out_count,
    totals.elevated_risk_count,
    case
      when totals.total_visits = 0 then 0
      else round((totals.approved_or_active_count::numeric / totals.total_visits::numeric) * 100)::integer
    end as approval_rate,
    case
      when totals.total_visits = 0 then 0
      else round((((totals.rejected_count + totals.expired_count)::numeric) / totals.total_visits::numeric) * 100)::integer
    end as exception_rate,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'label', ec.label,
            'value',
              case
                when totals.total_visits = 0 then 0
                else greatest(5, round((ec.visit_count::numeric / totals.total_visits::numeric) * 100)::integer)
              end
          )
          order by ec.label
        )
        from entrance_counts ec
      ),
      '[]'::jsonb
    ) as entrance_distribution
  from totals;
end;
$function$;

create or replace function public.get_visit_detail(
  p_visit_id uuid
)
returns table (
  id uuid,
  reference_code text,
  visitor_id uuid,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  visitor_organization text,
  host_id uuid,
  host_name text,
  host_email text,
  department_id uuid,
  department_name text,
  purpose text,
  entrance_name text,
  scheduled_for timestamptz,
  status text,
  risk_level text,
  notes text,
  check_in_at timestamptz,
  check_out_at timestamptz,
  pass_token uuid,
  pass_status text,
  pass_expires_at timestamptz,
  events jsonb
)
language sql
stable
security definer
set search_path = public
as $function$
  select
    v.id,
    v.reference_code,
    vis.id as visitor_id,
    vis.full_name as visitor_name,
    vis.email as visitor_email,
    vis.phone as visitor_phone,
    v.visitor_organization,
    sp.id as host_id,
    sp.full_name as host_name,
    sp.work_email as host_email,
    d.id as department_id,
    d.name as department_name,
    v.purpose,
    coalesce(e.name, 'Main Lobby') as entrance_name,
    v.scheduled_for,
    v.status,
    v.risk_level,
    v.notes,
    v.check_in_at,
    v.check_out_at,
    vp.token as pass_token,
    vp.status as pass_status,
    vp.expires_at as pass_expires_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', ve.id,
            'type', ve.event_type,
            'title', ve.title,
            'detail', ve.detail,
            'actorLabel', ve.actor_label,
            'occurredAt', ve.occurred_at
          )
          order by ve.occurred_at asc
        )
        from public.visit_events ve
        where ve.visit_id = v.id
      ),
      '[]'::jsonb
    ) as events
  from public.visits v
  join public.visitors vis on vis.id = v.visitor_id
  join public.staff_profiles sp on sp.id = v.host_staff_id
  join public.departments d on d.id = v.department_id
  left join public.entrances e on e.id = v.entrance_id
  left join lateral (
    select p.token, p.status, p.expires_at
    from public.visit_passes p
    where p.visit_id = v.id
    order by
      case when p.status = 'active' then 0 else 1 end,
      p.issued_at desc
    limit 1
  ) vp on true
  where v.id = p_visit_id
    and (
      public.jwt_permission_role() = 'admin'
      or v.host_staff_id = auth.uid()
    );
$function$;

create or replace function public.check_in_visit(
  p_visit_id uuid
)
returns table (
  visit_status text,
  pass_token uuid
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  visit_record public.visits%rowtype;
begin
  select *
  into visit_record
  from public.visits
  where id = p_visit_id
  for update;

  if not found then
    raise exception 'Visit not found';
  end if;

  if public.jwt_permission_role() <> 'admin' and visit_record.host_staff_id <> auth.uid() then
    raise exception 'You do not have access to check in this visit';
  end if;

  if visit_record.status <> 'approved' then
    raise exception 'Only approved visits can be checked in';
  end if;

  pass_token := public.issue_visit_pass(p_visit_id);

  update public.visits
  set status = 'checked_in',
      check_in_at = now(),
      updated_at = now()
  where id = p_visit_id;

  visit_status := 'checked_in';
  return next;
end;
$function$;

create or replace function public.check_out_visit(
  p_visit_id uuid
)
returns table (
  visit_status text
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  visit_record public.visits%rowtype;
begin
  select *
  into visit_record
  from public.visits
  where id = p_visit_id
  for update;

  if not found then
    raise exception 'Visit not found';
  end if;

  if public.jwt_permission_role() <> 'admin' and visit_record.host_staff_id <> auth.uid() then
    raise exception 'You do not have access to check out this visit';
  end if;

  if visit_record.status <> 'checked_in' then
    raise exception 'Only checked-in visits can be checked out';
  end if;

  update public.visits
  set status = 'checked_out',
      check_out_at = now(),
      updated_at = now()
  where id = p_visit_id;

  visit_status := 'checked_out';
  return next;
end;
$function$;

revoke all on function public.list_host_visits(text, text, integer, integer) from public;
revoke all on function public.get_host_dashboard_summary() from public;
revoke all on function public.list_recent_visit_activity(integer) from public;
revoke all on function public.list_admin_visitor_logs(text, text, integer, integer) from public;
revoke all on function public.list_staff_directory() from public;
revoke all on function public.list_department_coverage() from public;
revoke all on function public.get_admin_report_summary() from public;
revoke all on function public.get_visit_detail(uuid) from public;
revoke all on function public.check_in_visit(uuid) from public;
revoke all on function public.check_out_visit(uuid) from public;

grant execute on function public.list_host_visits(text, text, integer, integer) to authenticated;
grant execute on function public.get_host_dashboard_summary() to authenticated;
grant execute on function public.list_recent_visit_activity(integer) to authenticated;
grant execute on function public.list_admin_visitor_logs(text, text, integer, integer) to authenticated;
grant execute on function public.list_staff_directory() to authenticated;
grant execute on function public.list_department_coverage() to authenticated;
grant execute on function public.get_admin_report_summary() to authenticated;
grant execute on function public.get_visit_detail(uuid) to authenticated;
grant execute on function public.check_in_visit(uuid) to authenticated;
grant execute on function public.check_out_visit(uuid) to authenticated;

commit;
