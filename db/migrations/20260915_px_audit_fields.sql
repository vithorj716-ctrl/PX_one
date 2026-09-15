-- PXOne — auditoria completa: empresa, sistema/módulo e resultado da operação.
alter table public.px_audit_log add column if not exists empresa_id uuid;
alter table public.px_audit_log add column if not exists sistema_key text;
alter table public.px_audit_log add column if not exists modulo_key text;
alter table public.px_audit_log add column if not exists resultado text not null default 'sucesso';
create index if not exists px_audit_log_entity_idx on public.px_audit_log (entity_type, entity_id, created_at desc);
create index if not exists px_audit_log_user_idx on public.px_audit_log (user_id, created_at desc);
