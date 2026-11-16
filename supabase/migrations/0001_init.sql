-- Camada Criativa Convites: estrutura inicial
-- Tabelas do catálogo, pedidos, configurações e permissões do admin.

create extension if not exists pgcrypto;

/* ---------------- Admin ---------------- */

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admin lê admins" on public.admins;
create policy "admin lê admins" on public.admins for select using (public.is_admin());

/* ---------------- Catálogo ---------------- */

create table if not exists public.formats (
  id text primary key,
  name text not null,
  short text not null,
  price numeric(10,2) not null check (price >= 0),
  old_price numeric(10,2) check (old_price is null or old_price >= 0),
  file text not null default '',
  description text not null default '',
  tag text not null default '',
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists public.extras (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  theme text not null default '',
  event text not null default 'Aniversário',
  motif text not null default 'stars'
    check (motif in ('stars','clouds','balloons','flowers','waves','rainbow','hearts','confetti')),
  palette jsonb not null default '{"bg":"#E6E4FB","soft":"#F5F4FF","accent":"#8B7FD6","ink":"#3D3654"}',
  badge text check (badge in ('Novo','Destaque')),
  rating numeric(2,1) not null default 5 check (rating between 0 and 5),
  reviews int not null default 0 check (reviews >= 0),
  sold int not null default 0 check (sold >= 0),
  sample_name text not null default 'Nome',
  sample_age int,
  sample_event_line text not null default 'Aniversário de',
  description text not null default '',
  images text[] not null default '{}',
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  whatsapp text not null default '5500000000000',
  instagram text not null default '@camadacriativa',
  email text not null default 'contato@camadacriativa.com.br',
  hours text not null default 'Seg. a sex., 9h às 18h',
  delivery_days int not null default 3
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.formats enable row level security;
alter table public.extras enable row level security;
alter table public.products enable row level security;
alter table public.settings enable row level security;

-- leitura pública
drop policy if exists "público lê formatos" on public.formats;
create policy "público lê formatos" on public.formats for select using (active or public.is_admin());
drop policy if exists "público lê extras" on public.extras;
create policy "público lê extras" on public.extras for select using (active or public.is_admin());
drop policy if exists "público lê produtos" on public.products;
create policy "público lê produtos" on public.products for select using (active or public.is_admin());
drop policy if exists "público lê config" on public.settings;
create policy "público lê config" on public.settings for select using (true);

-- escrita só do admin
drop policy if exists "admin escreve formatos" on public.formats;
create policy "admin escreve formatos" on public.formats for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin escreve extras" on public.extras;
create policy "admin escreve extras" on public.extras for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin escreve produtos" on public.products;
create policy "admin escreve produtos" on public.products for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin escreve config" on public.settings;
create policy "admin escreve config" on public.settings for all using (public.is_admin()) with check (public.is_admin());

/* ---------------- Pedidos ---------------- */

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code bigint generated always as identity (start with 1001) unique,
  created_at timestamptz not null default now(),
  status text not null default 'novo'
    check (status in ('novo','em_producao','previa_enviada','aprovado','entregue','cancelado')),
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  format_id text not null,
  format_name text not null,
  format_price numeric(10,2) not null,
  extras jsonb not null default '[]',
  total numeric(10,2) not null,
  party jsonb not null default '{}',
  customer_name text not null,
  customer_whatsapp text not null,
  customer_email text,
  notes text,
  has_photo boolean not null default false,
  admin_notes text
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;
drop policy if exists "admin gerencia pedidos" on public.orders;
create policy "admin gerencia pedidos" on public.orders for all using (public.is_admin()) with check (public.is_admin());

-- Cria o pedido calculando os preços no banco (o visitante não consegue alterar o total).
create or replace function public.create_order(payload jsonb)
returns table (id uuid, code bigint, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products;
  v_format public.formats;
  v_extras jsonb;
  v_extras_total numeric;
  v_total numeric;
  v_party jsonb := coalesce(payload->'party', '{}'::jsonb);
begin
  select * into v_product from public.products p where p.slug = payload->>'product_slug' and p.active;
  if not found then raise exception 'Produto inválido'; end if;

  select * into v_format from public.formats f where f.id = payload->>'format_id' and f.active;
  if not found then raise exception 'Formato inválido'; end if;

  if coalesce(trim(payload->>'customer_name'), '') = '' then raise exception 'Nome obrigatório'; end if;
  if length(regexp_replace(coalesce(payload->>'customer_whatsapp', ''), '\D', '', 'g')) < 10 then
    raise exception 'WhatsApp inválido';
  end if;
  if coalesce(trim(v_party->>'nome'), '') = '' then raise exception 'Nome do homenageado obrigatório'; end if;
  if length(payload::text) > 8000 then raise exception 'Pedido muito grande'; end if;

  select coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'name', e.name, 'price', e.price) order by e.sort), '[]'::jsonb),
         coalesce(sum(e.price), 0)
    into v_extras, v_extras_total
    from public.extras e
   where e.active
     and e.id in (select jsonb_array_elements_text(coalesce(payload->'extras', '[]'::jsonb)));

  v_total := v_format.price + v_extras_total;

  return query
  insert into public.orders as o (
    product_id, product_name, format_id, format_name, format_price, extras, total, party,
    customer_name, customer_whatsapp, customer_email, notes, has_photo
  ) values (
    v_product.id, v_product.name, v_format.id, v_format.short, v_format.price, v_extras, v_total, v_party,
    left(trim(payload->>'customer_name'), 120),
    left(payload->>'customer_whatsapp', 30),
    nullif(left(trim(coalesce(payload->>'customer_email', '')), 160), ''),
    nullif(left(trim(coalesce(payload->>'notes', '')), 1000), ''),
    coalesce((payload->>'has_photo')::boolean, false)
  )
  returning o.id, o.code, o.total;
end $$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

/* ---------------- Imagens ---------------- */

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "admin envia imagens" on storage.objects;
create policy "admin envia imagens" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin altera imagens" on storage.objects;
create policy "admin altera imagens" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin remove imagens" on storage.objects;
create policy "admin remove imagens" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
