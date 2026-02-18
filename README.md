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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase (anonymní benchmark)

### 1) Env proměnné

Vytvořte `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2) SQL pro tabulku `submissions`

Spusťte v Supabase SQL editoru:

```sql
create table if not exists public.submissions (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  city text not null,
  platform text not null,
  hours_week double precision not null check (hours_week > 0),
  deliveries_week integer not null check (deliveries_week > 0),
  earnings_week_czk double precision not null check (earnings_week_czk > 0),
  hourly_rate double precision not null check (hourly_rate > 0),
  earnings_per_delivery double precision not null check (earnings_per_delivery > 0)
);

alter table public.submissions enable row level security;

-- Anonymní vkládání a čtení agregací (bez auth)
create policy "anon_insert_submissions"
on public.submissions
for insert
to anon
with check (true);

create policy "anon_select_submissions"
on public.submissions
for select
to anon
using (true);
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
