create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, anon;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon_key text not null default 'library',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();

create table public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  description text not null default '',
  price numeric(10,2),
  isbn text,
  cover_url text,
  status text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index books_category_idx on public.books(category_id);
create index books_title_idx on public.books(title);
grant select on public.books to anon, authenticated;
grant all on public.books to service_role;
alter table public.books enable row level security;
create policy "books public read" on public.books for select to anon, authenticated using (is_active);
create policy "books admin write" on public.books for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger books_touch before update on public.books for each row execute function public.touch_updated_at();

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  phone text not null default '',
  maps_url text not null default '',
  hours text not null default '',
  is_main boolean not null default false,
  sort_order integer not null default 0
);
grant select on public.branches to anon, authenticated;
grant all on public.branches to service_role;
alter table public.branches enable row level security;
create policy "branches public read" on public.branches for select to anon, authenticated using (true);
create policy "branches admin write" on public.branches for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0
);
grant select on public.faqs to anon, authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "faqs public read" on public.faqs for select to anon, authenticated using (is_active);
create policy "faqs admin write" on public.faqs for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.settings (
  key text primary key,
  value text not null default ''
);
grant select on public.settings to anon, authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "settings public read" on public.settings for select to anon, authenticated using (true);
create policy "settings admin write" on public.settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
grant all on public.orders to service_role;
grant select on public.orders to authenticated;
alter table public.orders enable row level security;
create policy "orders admin read" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.settings (key,value) values
 ('phone','+218918127948'),
 ('whatsapp','218918127948'),
 ('email','daralhikma123@gmail.com'),
 ('facebook','https://www.facebook.com/profile.php?id=100063840796435'),
 ('maps_url','https://maps.app.goo.gl/VKnafMRJvQV1NRjb9'),
 ('announcement_enabled','true'),
 ('announcement_text','تأسست منذ 1990 — اطلب كتبك الآن عبر واتساب وسنجهّزها لك في أقرب فرع.'),
 ('about_text','بدأت مكتبة دار الحكمة عام 1990 من محل صغير في طرابلس، بحلم بسيط: أن يجد كل قارئ كتابه. مع السنوات كبرت رفوفنا وكبرت معها عائلة قرائنا، حتى صرنا اليوم في أربعة فروع: طرابلس وبنغازي ومسلاتة وسبها.');

insert into public.branches (name,address,phone,maps_url,hours,is_main,sort_order) values
 ('فرع طرابلس','طرابلس – منطقة تقسيم خلدون','+218918127948','https://maps.app.goo.gl/VKnafMRJvQV1NRjb9','الخميس: 8:00ص – 9:00م
الجمعة: 5:00ص – 9:00م
السبت – الأربعاء: 8:00ص – 9:00م',true,0),
 ('فرع بنغازي','بنغازي','+218918127948','','السبت – الخميس: 8:00ص – 9:00م',false,1),
 ('فرع مسلاتة','مسلاتة','+218918127948','','السبت – الخميس: 8:00ص – 9:00م',false,2),
 ('فرع سبها','سبها','+218918127948','','السبت – الخميس: 8:00ص – 9:00م',false,3);

insert into public.faqs (question,answer,sort_order) values
 ('كيف أطلب كتابًا؟','أضف الكتب التي تريدها إلى السلة، ثم اضغط زر «إتمام الطلب عبر واتساب» وسيتم تجهيز رسالة جاهزة بتفاصيل طلبك.',0),
 ('هل يوجد توصيل؟','نرتب التوصيل داخل المدن التي بها فروعنا حسب الاتفاق عبر واتساب، ويمكنك أيضًا الاستلام من أي فرع.',1),
 ('هل الأسعار نهائية؟','الأسعار المعروضة بالدينار الليبي وقد تتغير حسب الطبعة والتوفر، ونؤكد لك السعر النهائي عند الطلب.',2),
 ('ماذا لو لم يظهر سعر الكتاب؟','بعض العناوين لا يتوفر لها سعر محدّث حاليًا، راسلنا عبر واتساب ونخبرك بالسعر والتوفر.',3);