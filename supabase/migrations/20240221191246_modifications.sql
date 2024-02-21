alter table equipes add ordre int2 null default 0;

create or replace function films_with_texte(mot text)
returns table (film_id films.film_id%TYPE
  , tritre films.titre%TYPE)
language sql
as $function$
	select f.film_id, f.titre from films f
    inner join resumes r on f.film_id = r.film_id
  where ts @@ to_tsquery('french', mot);
$function$;
