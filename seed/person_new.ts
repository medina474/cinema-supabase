import sql from './db.js'
import { Person, getPersonInfo, getCasting} from './person.ts';

const list_ids = ["1733"]

for (const tmdb_id of list_ids) {

  const data = await fetch(`https://api.themoviedb.org/3/person/${tmdb_id}?append_to_response=credits,external_ids,images&language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const file = `./data/tmdb/person/${tmdb_id}.json`
  await Deno.writeTextFile(file, await data.clone().text());

  const person: Person = await data.json();

  const name_parts = person.name.split(' ');
  console.log(`${name_parts.slice(1).join(' ')} ${name_parts[0]}`)

  const personnes_ids = await sql`insert into personnes
    (nom, prenom, naissance, deces, popularite)
    values (${name_parts.slice(1).join(' ')}, ${name_parts[0]}, ${person.birthday}, ${person.deathday}, ${person.popularity})
    returning personnes.personne_id`;

  const personne_id = personnes_ids[0].personne_id

  getPersonInfo(personne_id, person)
}
