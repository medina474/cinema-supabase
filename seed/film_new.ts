import sql from "./db.ts";
import { addLink } from "./db.ts";

import { Film } from "./film.ts";

const list_ids = ["18"];

for (const tmdb_id of list_ids) {
  const data = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdb_id}?append_to_response=credits,keywords&language=fr-FR`,
    {
      method: "get",
      headers: new Headers({
        "Authorization":
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4",
        "accept": "application/json",
      }),
    },
  );

  const file = `./data/tmdb/movie/${tmdb_id}.json`;
  await Deno.writeTextFile(file, await data.clone().text());

  const film: Film = await data.json();

  const films_ids = await sql`insert into films
          (titre, titre_original, sortie, vote_votants, vote_moyenne)
          values (${film.title}, ${film.original_title}, ${film.release_date}, ${film.vote_count}, ${film.vote_average})
          returning films.film_id`;

  const film_id: string = films_ids[0].film_id;

  addLink(film_id, 1, film.id.toString());

  if (film.external_ids.imdb_id) {
    addLink(film_id, 2, film.external_ids.imdb_id);
  }

  if (film.external_ids.wikidata_id) {
    addLink(film_id, 5, film.external_ids.wikidata_id);
  }

  await sql`insert into resumes (film_id, langue_code, resume)
      values (${film_id}, 'fra', ${film.overview})`;

  for (const genre of film.genres) {
    await sql`insert into films_genres (film_id, genre_id)
          values (${film_id}, ${genre.id})`;
  }
}
