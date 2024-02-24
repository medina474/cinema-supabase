import sql from './db.js'
import { addLink } from './person.ts';
import { Person } from './person.ts';

const list_ids = ["2231"]

for (const tmdb_id of list_ids) {

  const data = await fetch(`https://api.themoviedb.org/3/person/${tmdb_id}?append_to_response=credits,external_ids,images&language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const person:Person = await data.json();

  const name_parts = person.name.split(' ');
  console.log(`${name_parts.slice(1).join(' ')} ${name_parts[0]}`)

  const personnes_ids = await sql`insert into personnes
    (nom, prenom, naissance, deces, popularite)
    values (${name_parts.slice(1).join(' ')}, ${name_parts[0]}, ${person.birthday}, ${person.deathday}, ${person.popularity})
    returning personnes.personne_id`;

  const personne_id = personnes_ids[0].personne_id

  addLink(personne_id, 1, tmdb_id)

  if (person.external_ids.imdb_id) {
    addLink(personne_id, 2, person.external_ids.imdb_id)
  }

  if (person.external_ids.wikidata_id) {
    addLink(personne_id, 5, person.external_ids.wikidata_id)
  }

  const file = `./data/tmdb/person/${personne_id}.json`

  await Deno.writeTextFile(file, JSON.stringify(person));

  getCasting(personne_id,
    person.credits.cast
      .filter(f => f.release_date < '1996-01-01' && !f.genre_ids.includes(99))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6))
}
