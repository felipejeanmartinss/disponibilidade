begin;

drop policy if exists "projects_select_members"
    on public.projects;

create policy "projects_select_members"
    on public.projects for select
    to authenticated
    using (
        (select auth.uid()) is not null
        and (
            created_by = (select auth.uid())
            or public.is_project_member(id)
        )
    );

drop policy if exists "projects_insert_authenticated"
    on public.projects;

create policy "projects_insert_authenticated"
    on public.projects for insert
    to authenticated
    with check (
        (select auth.uid()) is not null
        and created_by = (select auth.uid())
    );

commit;
