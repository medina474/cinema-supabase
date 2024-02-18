
create materialized view acteurs as
  select p.personne_id,
  case
    when (p.artiste is not null) then (p.artiste)::text
    else (((p.prenom)::text || ' '::text) || (p.nom)::text)
  end as nom,
  case
    when (p.artiste is not null) then (p.artiste)::text
    else (((p.prenom)::text || ' '::text) || (p.nom)::text)
  end as dmetaphone,
  p.naissance,
  case
    when (p.deces is null) then date_part('year'::text, age((p.naissance)::timestamp with time zone))
    else null::double precision
  end as age,
  p.deces,
  p.nationalite,
  count(distinct c.film_id) as nb_film
  from (equipes c
    join personnes p on (c.personne_id = p.personne_id))
  where (c.role = 'acteur')
  group by p.personne_id
with no data;

refresh materialized view acteurs with data;
