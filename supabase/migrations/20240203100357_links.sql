create table sites (
  site_id bigint not null,
  site text not null,
  url text not null
);

alter table sites
  add constraint sites_pkey primary key (site_id);



create table links (
  id uuid not null,
  site bigint not null,
  identifiant text not null
);

alter table links
  add constraint links_pkey primary key (id, site);
