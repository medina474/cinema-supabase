\copy equipes to '../data/equipes.csv' (format csv, header, encoding 'utf8');

\copy personnes to '../data/personnes.csv' (format csv, header, encoding 'utf8');

\copy films_genres to '../data/films_genres.csv' (format csv, header, encoding 'utf8');

\copy links_societes to '../data/links_societes.csv' (format csv, header, encoding 'utf8');
\copy links_personnes to '../data/links_personnes.csv' (format csv, header, encoding 'utf8');
\copy links_films to '../data/links_films.csv' (format csv, header, encoding 'utf8');

\copy societes to '../data/societes.csv' (format csv, header, encoding 'utf8');
\copy productions to '../data/productions.csv' (format csv, header, encoding 'utf8');

\copy films(film_id,titre,titre_original,annee,sortie,duree,franchise_id,vote_votants,vote_moyenne) to '../data/films.csv' (format csv, header, encoding 'utf8');
\copy resumes to '../data/resumes.csv' (format csv, header, encoding 'utf8');
\copy (select film_id, slogan from films where slogan <> '') to '../data/films-slogan.csv' (format csv, header, delimiter ',', encoding 'utf8');
