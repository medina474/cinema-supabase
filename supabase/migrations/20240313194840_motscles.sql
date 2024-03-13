create table if not exists motscles (
  motcle_id integer not null primary key,
  motcle text not null
);

create table films_motscles (
  film_id uuid not null,
  motcle_id integer not null
);

CREATE UNIQUE INDEX film_motscles_pkey ON public.films_motscles USING btree (film_id, motcle_id);

alter table "public"."films_motscles"
  add constraint "film_motscles_pkey"
  PRIMARY KEY using index "film_motscles_pkey";

alter table "public"."films_motscles"
  add constraint "public_film_motscles_film_id_fkey"
  FOREIGN KEY (film_id) REFERENCES films(film_id) ON DELETE CASCADE not valid;

alter table "public"."films_motscles"
  validate constraint "public_film_motscles_film_id_fkey";

alter table "public"."films_motscles"
  add constraint "public_film_motscles_motcle_id_fkey"
  FOREIGN KEY (motcle_id) REFERENCES motscles(motcle_id) ON DELETE CASCADE not valid;

alter table "public"."films_motscles"
  validate constraint "public_film_motscles_motcle_id_fkey";

alter table "public"."films_motscles" enable row level security;

alter table "public"."motscles" enable row level security;

create policy "Enable read access for all users"
on "public"."films_motscles"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."motscles"
as permissive
for select
to public
using (true);
