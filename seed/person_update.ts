import sql from './db.ts'
import { Person, getPersonInfo } from './person.ts';

interface Personne {
  prenom: string
  nom: string
  personne_id: string
  identifiant: number
  count: number
}

const personnes = await<Personne[]>sql`
  select p.prenom, p.nom,
    p.personne_id,
    l.identifiant,
    count(e.film_id) as count
  from personnes p
  left join equipes e on p.personne_id = e.personne_id
  left join links l on p.personne_id = l.id and l.site_id = 1
  where identifiant is not null
  group by p.prenom, p.nom, p.personne_id, l.identifiant`

for (const p of personnes)
{
  const file = `./data/tmdb/person/${p.identifiant}.json`

  let fileInfo
  try {
    fileInfo = await Deno.stat(file)
  } catch (_) {
    fileInfo = { isFile: false }
  }

  let person: Person

  if (fileInfo.isFile) {
    person = JSON.parse(await Deno.readTextFile(file));
  }
  else {
    const data = await fetch(`https://api.themoviedb.org/3/person/${p.identifiant}?append_to_response=credits,external_ids,images&language=fr-FR`, {
      method: 'get',
      headers: new Headers({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
        'accept': 'application/json'
      })
    });

    await Deno.writeTextFile(file, await data.clone().text());
    person = await data.json();
  }

  console.log(`${person.name} ${person.popularity}`)

  getPersonInfo(p.personne_id, person)

  await sql`update personnes set
    naissance=${person.birthday}, deces=${person.deathday}, popularite=${person.popularity}
    where personne_id = ${p.personne_id}`;

}
