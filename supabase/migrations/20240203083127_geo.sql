create table pays (
  code_2 character varying(2) not null primary key,
  code_3 character varying(3) not null,
  code_num integer not null,
  pays text not null,
  drapeau_unicode character(2),
  drapeau_svg text
);

comment on column pays.code_2
  is 'iso 3166-1 alpha 2';

comment on column pays.code_3
  is 'iso 3166-1 alpha 3';

comment on column pays.code_num
  is 'iso 3166-1 numeric';

create index pays_nom
  on pays using btree (pays asc nulls last);

-- langues

create table langues (
  langue_code character(3) not null primary key,
  langue character varying(20),
  "français" character varying(20),
  ltr boolean
);

-- codes postaux

create table if not exists codepostaux (
  code_insee character(5),
  codepostal character varying(10),
  commune character varying(40),
  libelle_acheminement character varying(40),
  ligne_5 character varying(40),
  coordonnes extensions.geometry(point, 4326) default null::geometry,
  primary key(code_insee, codepostal)
);
