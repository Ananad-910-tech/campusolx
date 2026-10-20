-- Run this entire file in Supabase Dashboard > SQL Editor.
-- This is a starter schema. Review policies before production deployment.

create type public.listing_status as enum ('available', 'sold', 'removed');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 90),
  category text not null check (category in ('Books','Electronics','Cycles','Hostel essentials','Calculators','Clothing')),
  price integer not null check (price >= 0 and price <= 10000000),
  condition text not null check (condition in ('Like new','Good','Used','For parts')),
  location text not null default 'Campus pickup' check (char_length(location) <= 80),
  description text not null default '' check (char_length(description) <= 1200),
  image_url text,
  status public.listing_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_created_at_idx on public.listings(status, created_at desc);
create index listings_category_idx on public.listings(category);

alter table public.listings enable row level security;

-- Anyone can read currently available listings. No seller email is exposed publicly.
create policy "Anyone can view available listings"
on public.listings for select
using (status = 'available' or auth.uid() = seller_id);

-- Signed-in users can only create listings for themselves.
create policy "Users can create their own listings"
on public.listings for insert
to authenticated
with check (auth.uid() = seller_id);

-- Sellers can update only their own listings.
create policy "Users can update their own listings"
on public.listings for update
to authenticated
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

create policy "Users can delete their own listings"
on public.listings for delete
to authenticated
using (auth.uid() = seller_id);

-- Image bucket: public read for images; authenticated users can upload only
-- inside a folder named with their own auth user UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "Anyone can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Users upload images to their own folder"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update images in their own folder"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete images in their own folder"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
