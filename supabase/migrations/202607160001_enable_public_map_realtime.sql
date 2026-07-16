begin;

do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'public_maps'
    ) then
        execute
            'alter publication supabase_realtime '
            'add table public.public_maps';
    end if;
end;
$$;

commit;
