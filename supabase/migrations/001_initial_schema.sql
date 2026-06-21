create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'client')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  company text not null,
  email text not null,
  phone text,
  status text not null default 'Active' check (status in ('Active', 'Pending')),
  health_score int not null default 80 check (health_score between 0 and 100),
  total_revenue numeric not null default 0,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  status text not null default 'Planning' check (status in ('Planning', 'In Progress', 'Review', 'Completed')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  budget numeric not null default 0,
  progress int not null default 0 check (progress between 0 and 100),
  starts_at date,
  due_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'Pending' check (status in ('Pending', 'In Progress', 'In Review', 'Completed')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  assignee_id uuid references public.profiles(id) on delete set null,
  due_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  invoice_number text not null,
  amount numeric not null default 0,
  status text not null default 'Draft' check (status in ('Paid', 'Pending', 'Overdue', 'Draft')),
  issued_at date,
  due_at date,
  paid_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_number)
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  uploaded_by uuid references public.profiles(id) on delete set null,
  shared_with_client boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  sender_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger set_clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger set_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger set_tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(org_id uuid, roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and role = any(roles)
  );
$$;

create or replace function public.shares_org(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members mine
    join public.organization_members theirs
      on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid()
      and theirs.user_id = profile_id
  );
$$;

create or replace function public.ensure_user_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  user_email text := auth.jwt() ->> 'email';
  full_name text := coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', auth.jwt() -> 'user_metadata' ->> 'name', split_part(user_email, '@', 1), 'ClientFlow User');
  workspace_name text := coalesce(nullif(full_name, ''), 'ClientFlow') || '''s Workspace';
  workspace_id uuid;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles (id, full_name, email)
  values (current_user_id, full_name, user_email)
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name);

  select organization_id into workspace_id
  from public.organization_members
  where user_id = current_user_id
  order by created_at asc
  limit 1;

  if workspace_id is null then
    insert into public.organizations (name, slug, owner_id)
    values (
      workspace_name,
      lower(regexp_replace(workspace_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(current_user_id::text, 1, 8),
      current_user_id
    )
    returning id into workspace_id;

    insert into public.organization_members (organization_id, user_id, role)
    values (workspace_id, current_user_id, 'owner');
  end if;

  return workspace_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.invoices enable row level security;
alter table public.files enable row level security;
alter table public.messages enable row level security;
alter table public.activity_logs enable row level security;

create policy "Profiles are visible to self and shared org members"
  on public.profiles for select
  using (id = auth.uid() or public.shares_org(id));
create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Members can read organizations"
  on public.organizations for select
  using (public.is_org_member(id));
create policy "Owners and admins can update organizations"
  on public.organizations for update
  using (public.has_org_role(id, array['owner','admin']))
  with check (public.has_org_role(id, array['owner','admin']));

create policy "Members can read memberships"
  on public.organization_members for select
  using (public.is_org_member(organization_id));
create policy "Owners and admins can manage memberships"
  on public.organization_members for all
  using (public.has_org_role(organization_id, array['owner','admin']))
  with check (public.has_org_role(organization_id, array['owner','admin']));

create policy "Org members can read clients"
  on public.clients for select
  using (public.is_org_member(organization_id));
create policy "Staff can manage clients"
  on public.clients for all
  using (public.has_org_role(organization_id, array['owner','admin','member']))
  with check (public.has_org_role(organization_id, array['owner','admin','member']));

create policy "Org members can read projects"
  on public.projects for select
  using (public.is_org_member(organization_id));
create policy "Staff can manage projects"
  on public.projects for all
  using (public.has_org_role(organization_id, array['owner','admin','member']))
  with check (public.has_org_role(organization_id, array['owner','admin','member']));

create policy "Org members can read tasks"
  on public.tasks for select
  using (public.is_org_member(organization_id));
create policy "Staff can manage tasks"
  on public.tasks for all
  using (public.has_org_role(organization_id, array['owner','admin','member']))
  with check (public.has_org_role(organization_id, array['owner','admin','member']));

create policy "Org members can read invoices"
  on public.invoices for select
  using (public.is_org_member(organization_id));
create policy "Staff can manage invoices"
  on public.invoices for all
  using (public.has_org_role(organization_id, array['owner','admin','member']))
  with check (public.has_org_role(organization_id, array['owner','admin','member']));

create policy "Org members can read files"
  on public.files for select
  using (public.is_org_member(organization_id));
create policy "Staff can manage file metadata"
  on public.files for all
  using (public.has_org_role(organization_id, array['owner','admin','member']))
  with check (public.has_org_role(organization_id, array['owner','admin','member']));

create policy "Org members can read messages"
  on public.messages for select
  using (public.is_org_member(organization_id));
create policy "Org members can send messages"
  on public.messages for insert
  with check (public.is_org_member(organization_id) and sender_id = auth.uid());

create policy "Org members can read activity"
  on public.activity_logs for select
  using (public.is_org_member(organization_id));
create policy "Staff can create activity"
  on public.activity_logs for insert
  with check (public.has_org_role(organization_id, array['owner','admin','member']));

insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do update set public = false;

create policy "Org members can read client file objects"
  on storage.objects for select
  using (
    bucket_id = 'client-files'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

create policy "Staff can upload client file objects"
  on storage.objects for insert
  with check (
    bucket_id = 'client-files'
    and public.has_org_role(((storage.foldername(name))[1])::uuid, array['owner','admin','member'])
  );

create policy "Staff can delete client file objects"
  on storage.objects for delete
  using (
    bucket_id = 'client-files'
    and public.has_org_role(((storage.foldername(name))[1])::uuid, array['owner','admin','member'])
  );
