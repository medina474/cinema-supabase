/*
 * Complète la liste de films par acteur.
 * Prend les films les mieux notés de l'acteur.
 * Si le film n'existe pas dans la base, le créer et faire la liaison avec l'acteur.
 * Si il existe faire la liason (equipe)
 */

import sql from './db.js'

interface Personne {
  nom: string
  personne_id: string
  identifiant: number
  count: number
}

interface Credits {
  cast: any[]
  crew: any[]
  id: number
}

const personnes = await<Personne[]>sql`
  select p.prenom, p.nom,
    p.personne_id,
    l.identifiant,
    count(e.film_id) as count
  from personnes p
  join equipes e on p.personne_id = e.personne_id
  left join links l on p.personne_id = l.id and l.site_id = 1
  where identifiant is not null
  group by p.personne_id, p.nom, p.prenom, l.identifiant;`

for (const p of personnes)
{
  const file = `./data/tmdb/person/${p.identifiant}.json`

  let fileInfo
  try {
    fileInfo = await Deno.stat(file)
  } catch (_) {
    fileInfo = { isFile: false }
  }

  let credits: Credits

  if (fileInfo.isFile) {
    credits = JSON.parse(await Deno.readTextFile(file));
  }
  else {
    const data = await fetch(`https://api.themoviedb.org/3/person/${p.identifiant}/movie_credits?language=fr-FR`, {
      method: 'GET',
      headers: new Headers({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
        'accept': 'application/json'
      })
    });

    credits = await data.json();

    await Deno.writeTextFile(file, JSON.stringify(credits));
  }
