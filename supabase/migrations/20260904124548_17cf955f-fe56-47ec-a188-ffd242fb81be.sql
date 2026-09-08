create extension if not exists pgcrypto with schema extensions;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  cover_key text not null default 'cover-classic',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  description text not null default '',
  rating text not null default '',
  words integer,
  price numeric(10,2) not null default 0,
  cover_url text,
  in_stock boolean not null default true,
  is_active boolean not null default true,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  cart_adds integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index books_category_idx on public.books(category_id);
grant select on public.books to anon, authenticated;
grant all on public.books to service_role;
alter table public.books enable row level security;
create policy "books public read" on public.books for select to anon, authenticated using (is_active);

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

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating integer not null default 5,
  comment text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0
);
grant select on public.testimonials to anon, authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "testimonials public read" on public.testimonials for select to anon, authenticated using (is_active);

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

create table public.settings (
  key text primary key,
  value text not null default ''
);
grant select on public.settings to anon, authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "settings public read" on public.settings for select to anon, authenticated using (true);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create table public.admin_auth (
  id integer primary key default 1,
  password_hash text not null
);
grant all on public.admin_auth to service_role;
alter table public.admin_auth enable row level security;

insert into public.admin_auth (id, password_hash)
values (1, extensions.crypt('admin-daralhikma1990', extensions.gen_salt('bf')));

create or replace function public.increment_cart_add(_book_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.books set cart_adds = cart_adds + 1 where id = _book_id;
$$;
grant execute on function public.increment_cart_add(uuid) to anon, authenticated;

insert into public.settings (key,value) values
 ('phone','+218918127948'),
 ('whatsapp','218918127948'),
 ('email','daralhikma123@gmail.com'),
 ('facebook','https://www.facebook.com/profile.php?id=100063840796435'),
 ('maps_url','https://maps.app.goo.gl/VKnafMRJvQV1NRjb9'),
 ('announcement_enabled','true'),
 ('announcement_text','تأسست منذ 1990 — اطلب كتبك الآن عبر واتساب وسنجهّزها لك في أقرب فرع.'),
 ('about_text','بدأت مكتبة دار الحكمة عام 1990 من محل صغير في طرابلس، بحلم بسيط: أن يجد كل قارئ كتابه. مع السنوات كبرت رفوفنا وكبرت معها عائلة قرائنا، حتى صرنا اليوم في أربعة فروع: طرابلس وبنغازي ومسلاتة وسبها. ما زلنا نختار كل كتاب بعناية، من الأدب العالمي والفلسفة إلى المانغا وكتب تطوير الذات، ونؤمن أن المكتبة ليست رفوفًا فقط، بل مكان هادئ يليق بالقراءة.');

insert into public.branches (name,address,phone,maps_url,hours,is_main,sort_order) values
 ('فرع طرابلس','طرابلس – منطقة تقسيم خلدون','+218918127948','https://maps.app.goo.gl/VKnafMRJvQV1NRjb9','الخميس: 8:00ص – 9:00م
الجمعة: 5:00ص – 9:00م
السبت – الأربعاء: 8:00ص – 9:00م',true,0),
 ('فرع بنغازي','بنغازي','+218918127948','','السبت – الخميس: 8:00ص – 9:00م',false,1),
 ('فرع مسلاتة','مسلاتة','+218918127948','','السبت – الخميس: 8:00ص – 9:00م',false,2),
 ('فرع سبها','سبها','+218918127948','','السبت – الخميس: 8:00ص – 9:00م',false,3);

insert into public.testimonials (name,rating,comment,sort_order) values
 ('أحمد المبروك',5,'تشكيلة كتب ممتازة وأسعار مناسبة، وطلبت عبر واتساب ووصلني الرد في دقائق.',0),
 ('سارة العبيدي',5,'أخيرًا مكتبة فيها مانغا أصلية في ليبيا! التعامل راقي جدًا.',1),
 ('محمد الزروق',4,'فرع طرابلس مرتب وهادئ، والموظفون يساعدونك في اختيار الكتاب المناسب.',2),
 ('نور الهدى',5,'اشتريت مجموعة كتب تطوير ذات، الجودة والتغليف ممتازين.',3);

insert into public.faqs (question,answer,sort_order) values
 ('كيف أطلب كتابًا؟','أضف الكتب التي تريدها إلى السلة، ثم اضغط زر "إتمام الطلب عبر واتساب" وسيتم تجهيز رسالة جاهزة بكل تفاصيل طلبك، ونكمل معك الباقي عبر المحادثة.',0),
 ('هل يوجد توصيل؟','نعم، نرتب التوصيل داخل المدن التي بها فروعنا حسب الاتفاق عبر واتساب، ويمكنك أيضًا الاستلام من أي فرع.',1),
 ('هل الأسعار نهائية أم قابلة للتفاوض؟','الأسعار المعروضة تقريبية استرشادية بالدينار الليبي وقد تختلف حسب الطبعة والتوفر، ونؤكد لك السعر النهائي عند الطلب.',2),
 ('كيف أعرف توفر الكتاب في فرعي؟','راسلنا عبر واتساب مع اسم الكتاب والفرع الأقرب لك، ونخبرك بتوفره فورًا. الكتب غير المتوفرة مؤقتًا تظهر عليها علامة "غير متوفر حاليًا".',3);

insert into public.categories (slug,name,cover_key,sort_order) values ('classic','أدب كلاسيكي وروايات عالمية','cover-classic',0);
insert into public.categories (slug,name,cover_key,sort_order) values ('philosophy','فلسفة وتأملات','cover-philosophy',1);
insert into public.categories (slug,name,cover_key,sort_order) values ('fairy','حكايات خرافية وأساطير','cover-fairy',2);
insert into public.categories (slug,name,cover_key,sort_order) values ('oz','مغامرات خيالية (سلسلة أوز)','cover-fantasy',3);
insert into public.categories (slug,name,cover_key,sort_order) values ('selfdev','تطوير الذات وريادة الأعمال','cover-selfdev',4);
insert into public.categories (slug,name,cover_key,sort_order) values ('romance','روايات رومانسية وشبابية','cover-romance',5);
insert into public.categories (slug,name,cover_key,sort_order) values ('manga','مانغا وقصص مصورة','cover-manga',6);
insert into public.categories (slug,name,cover_key,sort_order) values ('puzzles','ألغاز وتسلية ذهنية','cover-puzzles',7);
insert into public.categories (slug,name,cover_key,sort_order) values ('psychology','علم النفس وفهم الذات','cover-psychology',8);
insert into public.books (slug,title,author,category_id,description,rating,price,is_bestseller,is_new,sort_order)
select v.slug,v.title,v.author,c.id,v.descr,v.rating,v.price,v.best,v.newb,v.ord from (values
('pride-and-prejudice','Pride and Prejudice','Jane Austen','classic','','',45,false,false,0),
('sense-and-sensibility','Sense and Sensibility','Jane Austen','classic','','',45,false,false,1),
('emma','Emma','Jane Austen','classic','','',50,false,false,2),
('the-brothers-karamazov','The Brothers Karamazov','Fyodor Dostoyevsky','classic','','',85,false,false,3),
('1984','1984','George Orwell','classic','','',40,true,false,4),
('the-alchemist','The Alchemist','Paulo Coelho','classic','','',35,true,false,5),
('brave-new-world','Brave New World','Aldous Huxley','classic','','',35,false,false,6),
('the-little-prince','The Little Prince','Antoine de Saint-Exupéry','classic','','',25,false,false,7),
('the-count-of-monte-cristo','The Count of Monte Cristo','Alexandre Dumas','classic','','',80,false,false,8),
('crime-and-punishment','Crime and Punishment','Fyodor Dostoyevsky','classic','','',75,false,false,9),
('the-great-gatsby','The Great Gatsby','F. Scott Fitzgerald','classic','','',30,false,false,10),
('to-kill-a-mockingbird','To Kill a Mockingbird','Harper Lee','classic','','',45,false,false,11),
('the-picture-of-dorian-gray','The Picture of Dorian Gray','Oscar Wilde','classic','','',35,false,false,12),
('fahrenheit-451','Fahrenheit 451','Ray Bradbury','classic','','',30,false,false,13),
('the-stranger','The Stranger','Albert Camus','classic','','',28,false,false,14),
('the-prophet','The Prophet','Kahlil Gibran','philosophy','','',25,false,false,15),
('meditations','Meditations','Marcus Aurelius','philosophy','','',35,false,false,16),
('man-s-search-for-meaning','Man''s Search for Meaning','Viktor E. Frankl','philosophy','','',30,false,false,17),
('the-power-of-now','The Power of Now','Eckhart Tolle','philosophy','','',40,false,false,18),
('the-courage-to-be-disliked','The Courage to Be Disliked','Ichiro Kishimi & Fumitake Koga','philosophy','','',40,false,false,19),
('the-blue-fairy-book','The Blue Fairy Book','Andrew Lang','fairy','','',35,false,false,20),
('the-red-fairy-book','The Red Fairy Book','Andrew Lang','fairy','','',35,false,false,21),
('the-green-fairy-book','The Green Fairy Book','Andrew Lang','fairy','','',35,false,false,22),
('the-yellow-fairy-book','The Yellow Fairy Book','Andrew Lang','fairy','','',35,false,false,23),
('the-pink-fairy-book','The Pink Fairy Book','Andrew Lang','fairy','','',35,false,false,24),
('the-grey-fairy-book','The Grey Fairy Book','Andrew Lang','fairy','','',35,false,false,25),
('the-violet-fairy-book','The Violet Fairy Book','Andrew Lang','fairy','','',35,false,false,26),
('the-crimson-fairy-book','The Crimson Fairy Book','Andrew Lang','fairy','','',35,false,false,27),
('the-brown-fairy-book','The Brown Fairy Book','Andrew Lang','fairy','','',35,false,false,28),
('the-olive-fairy-book','The Olive Fairy Book','Andrew Lang','fairy','','',35,false,false,29),
('the-lilac-fairy-book','The Lilac Fairy Book','Andrew Lang','fairy','','',35,false,false,30),
('the-wonderful-wizard-of-oz','The Wonderful Wizard of Oz','L. Frank Baum','oz','','',30,false,false,31),
('the-marvelous-land-of-oz','The Marvelous Land of Oz','L. Frank Baum','oz','','',28,false,false,32),
('ozma-of-oz','Ozma of Oz','L. Frank Baum','oz','','',28,false,false,33),
('dorothy-and-the-wizard-in-oz','Dorothy and the Wizard in Oz','L. Frank Baum','oz','','',28,false,false,34),
('the-road-to-oz','The Road to Oz','L. Frank Baum','oz','','',28,false,false,35),
('the-emerald-city-of-oz','The Emerald City of Oz','L. Frank Baum','oz','','',30,false,false,36),
('the-patchwork-girl-of-oz','The Patchwork Girl of Oz','L. Frank Baum','oz','','',28,false,false,37),
('tik-tok-of-oz','Tik-Tok of Oz','L. Frank Baum','oz','','',28,false,false,38),
('the-scarecrow-of-oz','The Scarecrow of Oz','L. Frank Baum','oz','','',28,false,false,39),
('rinkitink-in-oz','Rinkitink in Oz','L. Frank Baum','oz','','',28,false,false,40),
('the-lost-princess-of-oz','The Lost Princess of Oz','L. Frank Baum','oz','','',28,false,false,41),
('the-tin-woodman-of-oz','The Tin Woodman of Oz','L. Frank Baum','oz','','',28,false,false,42),
('the-magic-of-oz','The Magic of Oz','L. Frank Baum','oz','','',28,false,false,43),
('glinda-of-oz','Glinda of Oz','L. Frank Baum','oz','','',28,false,false,44),
('atomic-habits','Atomic Habits','James Clear','selfdev','','',50,true,false,45),
('good-to-great','Good to Great','Jim Collins','selfdev','','',55,false,false,46),
('the-subtle-art-of-not-giving-a-f-ck','The Subtle Art of Not Giving a F*ck','Mark Manson','selfdev','','',40,false,false,47),
('the-33-strategies-of-war','The 33 Strategies of War','Robert Greene','selfdev','','',60,false,false,48),
('the-daily-laws','The Daily Laws','Robert Greene','selfdev','','',55,false,false,49),
('100m-money-models','$100M Money Models','Alex Hormozi','selfdev','','',55,false,false,50),
('no-matter-what','No Matter What!','Lisa Nichols','selfdev','','',40,false,false,51),
('how-to-win-friends-and-influence-people','How to Win Friends and Influence People','Dale Carnegie','selfdev','','',40,false,false,52),
('the-psychology-of-money','The Psychology of Money','Morgan Housel','selfdev','','',45,true,false,53),
('deep-work','Deep Work','Cal Newport','selfdev','','',45,false,false,54),
('the-7-habits-of-highly-effective-people','The 7 Habits of Highly Effective People','Stephen R. Covey','selfdev','','',50,false,false,55),
('think-and-grow-rich','Think and Grow Rich','Napoleon Hill','selfdev','','',40,false,false,56),
('the-48-laws-of-power','The 48 Laws of Power','Robert Greene','selfdev','','',65,true,false,57),
('mastery','Mastery','Robert Greene','selfdev','','',55,false,false,58),
('the-laws-of-human-nature','The Laws of Human Nature','Robert Greene','selfdev','','',65,false,false,59),
('the-mountain-is-you','The Mountain Is You','Brianna Wiest','selfdev','','',45,false,true,60),
('can-t-hurt-me','Can''t Hurt Me','David Goggins','selfdev','','',50,false,false,61),
('the-5-am-club','The 5 AM Club','Robin Sharma','selfdev','','',45,false,false,62),
('essentialism','Essentialism','Greg McKeown','selfdev','','',45,false,false,63),
('the-one-thing','The One Thing','Gary Keller & Jay Papasan','selfdev','','',40,false,false,64),
('make-your-bed','Make Your Bed','William H. McRaven','selfdev','','',25,false,false,65),
('rival-darling','Rival Darling','','romance','','',40,false,false,66),
('our-secret-summer','Our Secret Summer','','romance','','',40,false,false,67),
('one-piece','One Piece','Eiichiro Oda','manga','','',25,true,false,68),
('dragon-ball','Dragon Ball','Akira Toriyama','manga','','',25,false,false,69),
('one-punch-man','One-Punch Man','ONE / Yusuke Murata','manga','','',25,false,false,70),
('attack-on-titan','Attack on Titan','Hajime Isayama','manga','','',25,false,false,71),
('demon-slayer','Demon Slayer','Koyoharu Gotouge','manga','','',28,false,false,72),
('jujutsu-kaisen','Jujutsu Kaisen','Gege Akutami','manga','','',28,false,false,73),
('tokyo-ghoul','Tokyo Ghoul','Sui Ishida','manga','','',28,false,false,74),
('fullmetal-alchemist','Fullmetal Alchemist','Hiromu Arakawa','manga','','',28,false,false,75),
('spy-family','Spy × Family','Tatsuya Endo','manga','','',28,false,false,76),
('blue-period','Blue Period','Tsubasa Yamaguchi','manga','','',25,false,false,77),
('blue-lock','Blue Lock','Muneyuki Kaneshiro & Yusuke Nomura','manga','','',25,false,false,78),
('haikyu','Haikyu!!','Haruichi Furudate','manga','','',25,false,false,79),
('kaiju-no-8','Kaiju No. 8','Naoya Matsumoto','manga','','',25,false,true,80),
('the-fragrant-flower-blooms-with-dignity','The Fragrant Flower Blooms with Dignity','Saka Mikami','manga','','',25,false,false,81),
('glitch','Glitch','Shūzō Oshimi','manga','','',25,false,false,82),
('a-silent-voice','A Silent Voice','Yoshitoki Ōima','manga','','',25,false,false,83),
('your-name','Your Name','Makoto Shinkai','manga','','',30,false,false,84),
('look-back','Look Back','Tatsuki Fujimoto','manga','','',30,false,true,85),
('detective-conan-case-closed','Detective Conan / Case Closed','Gosho Aoyama','manga','','',25,false,false,86),
('the-little-detective','The Little Detective','','puzzles','','',20,false,false,87),
('brain-game-sudoku','Brain Game Sudoku','','puzzles','','',15,false,false,88),
('puzzle-game','Puzzle Game','','puzzles','','',15,false,false,89),
('surrounded-by-idiots','محاط بالحمقى (Surrounded by Idiots)','توماس إريكسون','psychology','يقدّم نموذجًا بسيطًا من أربعة أنماط سلوكية (أحمر، أصفر، أخضر، أزرق) لفهم طريقة تفكير من حولك، وتحسين التواصل معهم وتجنّب سوء الفهم في العمل والحياة الشخصية.','3.5/5',45,true,true,90),
('surrounded-by-psychopaths','محاط بالمرضى النفسيين (Surrounded by Psychopaths)','توماس إريكسون','psychology','الجزء التالي لكتاب "محاط بالحمقى"، يشرح كيف يتعرّف القارئ على الشخصيات المتلاعبة والاستغلالية من حوله، وكيف يحمي نفسه من التأثير والتلاعب في العمل والعلاقات.','',45,false,true,91),
('jalasat-nafsiya','جلسات نفسية','د. محمد إبراهيم','psychology','كتاب تطوير ذات يتناول موضوعات نفسية يومية مثل القلق، جلد الذات، وضع الحدود، وتقبّل الذات، بأسلوب بسيط وسلس أقرب لجلسة حوار مع القارئ.','4.5/5',30,false,true,92),
('al-daa-wal-dawaa','الداء والدواء','ابن قيم الجوزية','psychology','كتاب تراثي إسلامي كلاسيكي في علاج أمراض القلوب والنفوس، يتناول أثر الذنوب على النفس، وأهمية الدعاء والذكر، ويُعد من أهم المراجع في الطب الروحي والنفسي عند علماء الإسلام.','4.1/5',40,false,true,93)
) as v(slug,title,author,cat,descr,rating,price,best,newb,ord) join public.categories c on c.slug=v.cat;