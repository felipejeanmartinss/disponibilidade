begin;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    display_name text not null default '',
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    config jsonb not null default '{}'::jsonb,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
    project_id uuid not null references public.projects(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('admin', 'editor', 'viewer')),
    created_at timestamptz not null default now(),
    primary key (project_id, user_id)
);

create table if not exists public.units (
    project_id uuid not null references public.projects(id) on delete cascade,
    unit_id text not null,
    data jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (project_id, unit_id)
);

create table if not exists public.folder_catalog (
    project_id uuid not null references public.projects(id) on delete cascade,
    folder_number text not null,
    data jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (project_id, folder_number)
);

create table if not exists public.public_maps (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects(id) on delete cascade,
    slug uuid not null unique default gen_random_uuid(),
    snapshot jsonb not null,
    is_active boolean not null default true,
    published_by uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists project_members_user_id_idx
    on public.project_members(user_id);

create index if not exists public_maps_project_id_idx
    on public.public_maps(project_id);

create index if not exists public_maps_active_slug_idx
    on public.public_maps(slug)
    where is_active = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, display_name, avatar_url)
    values (
        new.id,
        coalesce(new.email, ''),
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name',
            split_part(coalesce(new.email, ''), '@', 1)
        ),
        new.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do update set
        email = excluded.email,
        display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        updated_at = now();

    return new;
end;
$$;

create or replace function public.add_project_creator_as_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.project_members (project_id, user_id, role)
    values (new.id, new.created_by, 'admin')
    on conflict (project_id, user_id) do nothing;

    return new;
end;
$$;

create or replace function public.is_project_member(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.project_members
        where project_id = target_project_id
          and user_id = (select auth.uid())
    );
$$;

create or replace function public.can_edit_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.project_members
        where project_id = target_project_id
          and user_id = (select auth.uid())
          and role in ('admin', 'editor')
    );
$$;

create or replace function public.is_project_admin(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.project_members
        where project_id = target_project_id
          and user_id = (select auth.uid())
          and role = 'admin'
    );
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert or update of email, raw_user_meta_data on auth.users
    for each row execute function public.handle_new_user();

drop trigger if exists on_project_created on public.projects;
create trigger on_project_created
    after insert on public.projects
    for each row execute function public.add_project_creator_as_admin();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
    before update on public.projects
    for each row execute function public.set_updated_at();

drop trigger if exists units_set_updated_at on public.units;
create trigger units_set_updated_at
    before update on public.units
    for each row execute function public.set_updated_at();

drop trigger if exists folder_catalog_set_updated_at on public.folder_catalog;
create trigger folder_catalog_set_updated_at
    before update on public.folder_catalog
    for each row execute function public.set_updated_at();

drop trigger if exists public_maps_set_updated_at on public.public_maps;
create trigger public_maps_set_updated_at
    before update on public.public_maps
    for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.units enable row level security;
alter table public.folder_catalog enable row level security;
alter table public.public_maps enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
    on public.profiles for select
    to authenticated
    using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
    on public.profiles for update
    to authenticated
    using (id = (select auth.uid()))
    with check (id = (select auth.uid()));

drop policy if exists "projects_select_members" on public.projects;
create policy "projects_select_members"
    on public.projects for select
    to authenticated
    using (public.is_project_member(id));

drop policy if exists "projects_insert_authenticated" on public.projects;
create policy "projects_insert_authenticated"
    on public.projects for insert
    to authenticated
    with check (created_by = (select auth.uid()));

drop policy if exists "projects_update_editors" on public.projects;
create policy "projects_update_editors"
    on public.projects for update
    to authenticated
    using (public.can_edit_project(id))
    with check (public.can_edit_project(id));

drop policy if exists "projects_delete_admins" on public.projects;
create policy "projects_delete_admins"
    on public.projects for delete
    to authenticated
    using (public.is_project_admin(id));

drop policy if exists "members_select_project_members" on public.project_members;
create policy "members_select_project_members"
    on public.project_members for select
    to authenticated
    using (public.is_project_member(project_id));

drop policy if exists "members_insert_admins" on public.project_members;
create policy "members_insert_admins"
    on public.project_members for insert
    to authenticated
    with check (public.is_project_admin(project_id));

drop policy if exists "members_update_admins" on public.project_members;
create policy "members_update_admins"
    on public.project_members for update
    to authenticated
    using (public.is_project_admin(project_id))
    with check (public.is_project_admin(project_id));

drop policy if exists "members_delete_admins" on public.project_members;
create policy "members_delete_admins"
    on public.project_members for delete
    to authenticated
    using (public.is_project_admin(project_id));

drop policy if exists "units_select_members" on public.units;
create policy "units_select_members"
    on public.units for select
    to authenticated
    using (public.is_project_member(project_id));

drop policy if exists "units_insert_editors" on public.units;
create policy "units_insert_editors"
    on public.units for insert
    to authenticated
    with check (public.can_edit_project(project_id));

drop policy if exists "units_update_editors" on public.units;
create policy "units_update_editors"
    on public.units for update
    to authenticated
    using (public.can_edit_project(project_id))
    with check (public.can_edit_project(project_id));

drop policy if exists "units_delete_editors" on public.units;
create policy "units_delete_editors"
    on public.units for delete
    to authenticated
    using (public.can_edit_project(project_id));

drop policy if exists "folder_catalog_select_members" on public.folder_catalog;
create policy "folder_catalog_select_members"
    on public.folder_catalog for select
    to authenticated
    using (public.is_project_member(project_id));

drop policy if exists "folder_catalog_insert_editors" on public.folder_catalog;
create policy "folder_catalog_insert_editors"
    on public.folder_catalog for insert
    to authenticated
    with check (public.can_edit_project(project_id));

drop policy if exists "folder_catalog_update_editors" on public.folder_catalog;
create policy "folder_catalog_update_editors"
    on public.folder_catalog for update
    to authenticated
    using (public.can_edit_project(project_id))
    with check (public.can_edit_project(project_id));

drop policy if exists "folder_catalog_delete_editors" on public.folder_catalog;
create policy "folder_catalog_delete_editors"
    on public.folder_catalog for delete
    to authenticated
    using (public.can_edit_project(project_id));

drop policy if exists "public_maps_select_active" on public.public_maps;
create policy "public_maps_select_active"
    on public.public_maps for select
    to anon, authenticated
    using (is_active = true);

drop policy if exists "public_maps_select_editors" on public.public_maps;
create policy "public_maps_select_editors"
    on public.public_maps for select
    to authenticated
    using (public.can_edit_project(project_id));

drop policy if exists "public_maps_insert_editors" on public.public_maps;
create policy "public_maps_insert_editors"
    on public.public_maps for insert
    to authenticated
    with check (
        public.can_edit_project(project_id)
        and published_by = (select auth.uid())
    );

drop policy if exists "public_maps_update_editors" on public.public_maps;
create policy "public_maps_update_editors"
    on public.public_maps for update
    to authenticated
    using (public.can_edit_project(project_id))
    with check (public.can_edit_project(project_id));

drop policy if exists "public_maps_delete_editors" on public.public_maps;
create policy "public_maps_delete_editors"
    on public.public_maps for delete
    to authenticated
    using (public.can_edit_project(project_id));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
    public.profiles,
    public.projects,
    public.project_members,
    public.units,
    public.folder_catalog,
    public.public_maps
to authenticated;

grant select on public.public_maps to anon;

revoke all on function public.is_project_member(uuid) from public;
revoke all on function public.can_edit_project(uuid) from public;
revoke all on function public.is_project_admin(uuid) from public;

grant execute on function public.is_project_member(uuid) to authenticated;
grant execute on function public.can_edit_project(uuid) to authenticated;
grant execute on function public.is_project_admin(uuid) to authenticated;

commit;
