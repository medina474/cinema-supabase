create table films (
  film_id uuid default gen_random_uuid() not null,
  titre text not null,
  titre_original text,
  annee integer,
  sortie date,
  duree integer,
  serie integer,
  constraint film_pkey primary key (film_id)
);

alter table films
  add constraint films_series_fk foreign key (serie)
    references series (serie_id) match simple
    on update no action
    on delete no action
    not valid;
