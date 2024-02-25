import sql from "./db.ts";
import { Film, getFilmInfo } from "./film.ts";

const list_ids = ["63150", "138659", "616", "101", "35797", "10732", "50796", "4274", "71055", "178297", "78032", "18457", "18419", "902", "4481",
  "13727", "4480", "11657", "23483", "41402", "133805", "59161", "197537", "60744", "44706", "62822", "18298", "100075", "51257", "68946",
  "72833", "571940", "338703", "150736", "31789", "4482", "37652", "61405", "66635", "54471", "76597", "62087", "62134", "57944",
"11479", "84644", "4484", "11684", "78159", "10806", "12111", "55976", "603", "604", "605", "180", "745", "644", "37165", "1417", "637"];

for (const tmdb_id of list_ids) {
  const data = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdb_id}?append_to_response=credits,keywords,external_ids&language=fr-FR`,
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

  console.log(film.title)

  const film_id: string = films_ids[0].film_id;

  getFilmInfo(film_id, film)
}
