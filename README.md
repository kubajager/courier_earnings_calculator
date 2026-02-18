This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

**Design (Figma):** See [docs/FIGMA_UI_SPEC.md](docs/FIGMA_UI_SPEC.md) for colors, typography, spacing, and component specs to recreate the UI in Figma.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase (anonymní benchmark)

### 1) Env proměnné

Vytvořte `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2) Přístup k výsledkům a soukromí

- **Žádný veřejný leaderboard** – nikdo nevidí „nejlepšího kurýra“.
- **Přístup MVP:** výsledky jsou zobrazitelné **pouze přes odkaz** `/vysledek?sid=<uuid>`. Odpovídá jednomu odeslání (submission). Odkaz je sdílitelný; kdo má odkaz, vidí dané výsledky.
- **E-mail** je povinný a slouží k: zobrazení výsledků, uložení historie a tvorbě anonymních tržních průměrů. V MVP se odkaz na výsledky e-mailem neposílá (pouze stub „Brzy doplníme“); e-mail ukládáme pro budoucí funkce (historie, odeslání odkazu).
- **RLS:** anon smí pouze **INSERT** do `profiles` a `submissions`. Žádný přímý **SELECT** z těchto tabulek. Čtení benchmarků a jednoho výsledku probíhá výhradně přes RPC.

### 3) SQL: tabulky a RLS

Spusťte v Supabase SQL editoru v pořadí:

**Tabulka `profiles`**

```sql
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  consent_at timestamptz not null,
  city text,
  platform text,
  source text not null default 'calculator'
);

alter table public.profiles enable row level security;

create policy "anon_insert_profiles"
on public.profiles for insert to anon with check (true);
-- Žádný SELECT pro anon.
```

**Tabulka `submissions`** (nová nebo migrace z existující)

Pokud již máte starou tabulku `submissions`, přidejte sloupce a změňte RLS:

```sql
-- Pokud tabulka neexistuje, vytvořte ji celou; jinak jen přidejte sloupce a upravte RLS.
create table if not exists public.submissions (
  id bigserial primary key,
  share_id uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile_id uuid references public.profiles(id),
  city text not null,
  platform text not null,
  hours_week double precision not null check (hours_week > 0),
  deliveries_week integer not null check (deliveries_week > 0),
  earnings_week_czk double precision not null check (earnings_week_czk > 0),
  hourly_rate double precision not null check (hourly_rate > 0),
  earnings_per_delivery double precision not null check (earnings_per_delivery > 0)
);

-- Migrace: přidat sloupce do existující tabulky
alter table public.submissions add column if not exists share_id uuid unique default gen_random_uuid();
alter table public.submissions add column if not exists profile_id uuid references public.profiles(id);
update public.submissions set share_id = gen_random_uuid() where share_id is null;
alter table public.submissions alter column share_id set not null;

alter table public.submissions enable row level security;

drop policy if exists "anon_select_submissions" on public.submissions;
create policy "anon_insert_submissions"
on public.submissions for insert to anon with check (true);
-- Žádný SELECT pro anon; čtení jen přes RPC get_submission(share_id).
```

### 4) SQL: RPC

**Upsert profilu (vrací id pro vložení submission)**

```sql
create or replace function public.upsert_profile(
  p_email text,
  p_consent_at timestamptz,
  p_city text,
  p_platform text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.profiles (email, consent_at, city, platform, source)
  values (lower(trim(p_email)), p_consent_at, p_city, p_platform, 'calculator')
  on conflict (email) do update set
    consent_at = excluded.consent_at,
    city = excluded.city,
    platform = excluded.platform
  returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.upsert_profile(text, timestamptz, text, text) to anon;
```

**Vrácení jednoho výsledku podle sdíleného odkazu**

```sql
create or replace function public.get_submission(p_sid uuid)
returns table (
  id bigint,
  share_id uuid,
  city text,
  platform text,
  hours_week double precision,
  deliveries_week integer,
  earnings_week_czk double precision,
  hourly_rate double precision,
  earnings_per_delivery double precision
)
language sql
security definer
set search_path = public
stable
as $$
  select s.id, s.share_id, s.city, s.platform, s.hours_week, s.deliveries_week,
         s.earnings_week_czk, s.hourly_rate, s.earnings_per_delivery
  from public.submissions s
  where s.share_id = p_sid
  limit 1;
$$;
grant execute on function public.get_submission(uuid) to anon;
```

**Benchmark agregáty (město + platforma)**

```sql
create or replace function public.get_benchmarks(p_city text, p_platform text)
returns table (
  n bigint,
  avg_hourly_rate double precision,
  avg_earnings_per_delivery double precision,
  avg_earnings_week_czk double precision
)
language sql
security definer
set search_path = public
stable
as $$
  select
    count(*)::bigint,
    avg(hourly_rate),
    avg(earnings_per_delivery),
    avg(earnings_week_czk)
  from public.submissions
  where (p_city is null or city = p_city)
    and (p_platform is null or platform = p_platform);
$$;
grant execute on function public.get_benchmarks(text, text) to anon;
```

**Rozsahy hodinových sazeb po platformách (percentily)**

```sql
create or replace function public.get_platform_ranges(p_city text)
returns table (
  platform text,
  n bigint,
  p25_hourly double precision,
  p50_hourly double precision,
  p75_hourly double precision
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.platform,
    count(*)::bigint,
    percentile_cont(0.25) within group (order by s.hourly_rate),
    percentile_cont(0.5) within group (order by s.hourly_rate),
    percentile_cont(0.75) within group (order by s.hourly_rate)
  from public.submissions s
  where p_city is null or s.city = p_city
  group by s.platform;
$$;
grant execute on function public.get_platform_ranges(text) to anon;
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
