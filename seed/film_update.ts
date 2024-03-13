import sql from './db.ts'
import { Film } from './film.ts'

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links_films l on l.id = f.film_id and site_id = 1
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

  console.log(`${film.title} ${film.release_date}  ${f.film_id}`)

  /*
  await sql`update films set
    annee=date_part('year', sortie)
    where film_id = ${f.film_id}`;
  */

  /*
  await sql`update films set
    pays=${film.production_countries.map(elt => elt.iso_3166_1.toLowerCase() )}
    where film_id = ${f.film_id}`;
  */

  /*
  if (film.keywords.keywords.length > 0) {
    await sql`insert into motscles  ${sql(film.keywords.keywords.map(elt => ({ 'motcle_id': elt.id, 'motcle': elt.name })))}
      on conflict (motcle_id) do nothing`;

    await sql`insert into films_motscles  ${sql(film.keywords.keywords.map(elt => ({ 'film_id': f.film_id, 'motcle_id': elt.id })))}
      on conflict (film_id, motcle_id) do nothing`;
  }
  */

  if (film.belongs_to_collection != null) {
    await sql`insert into franchises values (${film.belongs_to_collection.id}, ${film.belongs_to_collection.name.replace(' - Saga', '')})
      on conflict (franchise_id) do nothing`;

    await sql`update films set franchise_id = ${film.belongs_to_collection.id}
      where film_id = ${f.film_id}`;
  }
}
