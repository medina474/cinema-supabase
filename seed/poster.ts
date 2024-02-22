import sql from './db.js'
import { Destination, download } from "https://deno.land/x/download/mod.ts";

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links_films l on l.id = f.film_id and site_id = 1
  order by annee desc`;

for (const film of films) {
  console.log(`${film.identifiant} ${film.titre}`);

  const data = await fetch(`https://api.themoviedb.org/3/movie/${film.identifiant}/images`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const json = await data.json();

  const poster = json.posters.find(p => p.iso_639_1 == 'en')

  if (poster) {
    const url =
      `https://image.tmdb.org/t/p/w600_and_h900_bestv2${poster.file_path}`

    try {
      // NOTE : You need to ensure that the directory you pass exists.
      const destination: Destination = {
        file: `${film.film_id}.jpg`,
        dir: "./data/poster",
      };

      const fileObj = await download(url, destination);
    } catch (err) {
      console.log(err);
    }
  }
}
