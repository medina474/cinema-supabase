create view view_personne_sans_role as
 select p.personne_id,
    p.prenom,
    p.nom,
    count(e.personne_id) as nb
  from personnes p
    left join equipes e on e.personne_id = p.personne_id
  group by p.personne_id, p.prenom, p.nom
  having count(e.personne_id) = 0;

create view view_film_sans_role as
 select f.titre,
    count(e.film_id) as nb
  from films f
    left join equipes e on e.film_id = f.film_id
  group by f.titre
  having count(e.film_id) = 0;
