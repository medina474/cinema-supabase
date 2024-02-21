create table sites (
  site_id bigint not null,
  site text not null,
  url text not null
);

insert into sites (site_id,site,url) values
	(1,'TMDB (The Movie Database)','https://www.themoviedb.org/movie/$id'),
	(2,'IMDb (Internet Movie Database)','https://www.imdb.com/title/$id'),
	(3,'Wikipedia','https://fr.wikipedia.org/wiki/$id'),
	(4,'YouTube','https://youtu.be/$id'),
	(5,'Sens Critique','https://www.senscritique.com/film/_/$id'),
	(6,'AlloCiné','https://www.allocine.fr/film/fichefilm_gen_cfilm=$id.html');

alter table sites
  add constraint sites_pkey primary key (site_id);



create table links (
  id uuid not null,
  site_id bigint not null,
  identifiant text not null
);

alter table links
  add constraint links_no_insert_in_parent
  check (false) no inherit;

alter table links
  add constraint links_pkey primary key (id, site_id);

create index links_identifiant_idx on links (identifiant);

-- Links Sociétés

create table links_societes (
) inherits (links);

alter table links_societes
  add constraint links_societes_pkey primary key (id, site_id);

alter table links_societes
  add constraint links_societes_fk foreign key (id) references societes(societe_id) on delete cascade;

-- Links Films

create table links_films (
) inherits (links);

alter table links_films
  add constraint links_films_pkey primary key (id, site_id);

alter table links_films
  add constraint links_films_fk foreign key (id) references films(film_id) on delete cascade;

-- Links Personnes

create table links_personnes (
) inherits (links);

alter table links_personnes
  add constraint links_personnes_pkey primary key (id, site_id);

alter table links_personnes
  add constraint links_personnes_fk foreign key (id) references personnes(personne_id) on delete cascade;
