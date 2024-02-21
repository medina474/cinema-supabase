\copy langues from '../data/langues.csv' (format csv, header, encoding 'utf8');

\copy pays from '../data/pays.csv' (format csv, header, encoding 'utf8');

\copy certifications (pays, ordre, certification, description) from '../data/certifications.csv' (format csv, header, encoding 'utf8');

\copy societes from '../data/societes.csv' (format csv, header, encoding 'utf8');

\copy genres from '../data/genres.csv' (format csv, header, encoding 'utf8');
select setval(pg_get_serial_sequence('genres', 'genre_id'), (select max(genre_id) from genres));

\copy franchises from '../data/franchises.csv' (format csv, header, encoding 'utf8');
select setval(pg_get_serial_sequence('franchises', 'franchise_id'), (select max(franchise_id) from franchises));


\copy films(film_id,titre,titre_original,annee,sortie,duree,franchise_id,vote_votants,vote_moyenne) from '../data/films.csv' (format csv, header, encoding 'utf8');

create temporary table slogan_tmp (
  film_id uuid,
  slogan text);

\copy slogan_tmp from '../data/films-slogan.csv' (format csv, header, delimiter ',', encoding 'utf8');
update films set slogan = (select slogan from slogan_tmp where slogan_tmp.film_id = films.film_id);
drop table slogan_tmp;

\copy films_genres from '../data/films_genres.csv' (format csv, header, encoding 'utf8');

\copy resumes from '../data/resumes.csv' (format csv, header, encoding 'utf8');

\copy productions(film_id, societe_id) from '../data/productions.csv' (format csv, header, encoding 'utf8');


\copy personnes from '../data/personnes.csv' (format csv, header, encoding 'utf8');

\copy equipes from '../data/equipes.csv' (format csv, header, encoding 'utf8');

refresh materialized view acteurs with data;

\copy links_personnes from '../data/links_personnes.csv' (format csv, header, encoding 'utf8');
\copy links_societes from '../data/links_societes.csv' (format csv, header, encoding 'utf8');
\copy links_films from '../data/links_films.csv' (format csv, header, encoding 'utf8');
