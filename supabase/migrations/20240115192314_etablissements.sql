create extension postgis schema extensions;

create table etablissements (
  etablissement_id bigint not null,
  nom text,
  voie text,
  codepostal text,
  ville text,
  coordonnees extensions.geometry(Point, 4326) default null::geometry
);

alter table etablissements
  add constraint cinemas_pkey primary key (etablissement_id);

create index etablissement_coordonnees_idx
  on etablissements
  using GIST (coordonnees);
