import sql from './db.ts'
import { Film } from './film.ts'

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links_films l on l.id = f.film_id and site_id = 1
  where slogan is null
  order by annee desc`;

for (const f of films) {

const file = `./data/tmdb/movie/${f.identifiant}.json`

  let fileInfo
  try {
    fileInfo = await Deno.stat(file)
  } catch (_) {
    fileInfo = { isFile: false }
  }

  let film: Film

  if (fileInfo.isFile) {
    film = JSON.parse(await Deno.readTextFile(file));
  }
  else {
    const data = await fetch(`https://api.themoviedb.org/3/movie/${f.identifiant}?append_to_response=credits,keywords,external_ids&language=fr-FR`, {
      method: 'get',
      headers: new Headers({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
        'accept': 'application/json'
      })
    });

    await Deno.writeTextFile(file, await data.clone().text());
    film = await data.json();
  }

  console.log(`${film.title} ${film.release_date} ${f.film_id}`)

  /*
  await sql`update films set
    annee=date_part('year', sortie)
    where film_id = ${f.film_id}`;
    */

    await sql`update films set
    slogan=${film.tagline}
    where film_id = ${f.film_id}`;
}
