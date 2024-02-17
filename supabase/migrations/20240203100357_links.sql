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
  add constraint links_pkey primary key (id, site_id);

create index links_identifiant_idx on links (identifiant);

create table links_societes (
) inherits (links);

create table links_films (
) inherits (links);
