import sql from './db.js'

interface Personne {
    nom: string
    personne_id: string
    identifiant: number
    count: number
  }

  const personnes = await<Personne[]>sql`
  select p.nom,
    p.personne_id,
    l.identifiant,
    count(e.film_id) as count
  from personnes p
  join equipes e on p.personne_id = e.personne_id
  left join links l on p.personne_id = l.id and l.site_id = 1
  where identifiant is not null
  group by p.nom, p.personne_id, l.identifiant;`

  for (const p of personnes)
{
  const data = await fetch(`https://api.themoviedb.org/3/person/${p.identifiant}?language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const person = await data.json();

  console.log(`${person.name} ${person.popularity}`)

  await sql`update personnes set 
    naissance=${person.birthday}, deces=${person.deathday}
    where personne_id=${p.personne_id}`;

}