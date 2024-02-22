import sql from './db.js'

interface Cast {
  id: number
  name: string
  character: string
  order: number
}

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links_films l on l.id = f.film_id and site_id = 1
  order by annee desc`

for (const film of films) {

  console.log(`${film.identifiant} ${film.titre}`)

  const data = await fetch(`https://api.themoviedb.org/3/movie/${film.identifiant}?append_to_response=credits&language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const json = await data.json()

  if (!json.credits || !json.credits.cast) {
    console.log(` -- sans équipe`)
    continue
  }

  json.credits.cast
    .filter((c:Cast) => c.order < 10)
    .forEach(async (cast:Cast) => {

      const personnes = await sql`select * from links_personnes l
        inner join personnes p on p.personne_id = l.id
        where identifiant = ${cast.id} and site_id = 1`

      if (personnes.count == 1) {
        const personne_id = personnes[0].id

        const equipe = await sql`select alias from equipes
          where film_id = ${film.film_id} and personne_id = ${personne_id} and role = 'acteur'`;

        if (equipe.count == 0) {
          try {
            console.log(`  + ${cast.name} as ${cast.character}`);
            await sql`insert into equipes (film_id, personne_id, role, alias, ordre)
                values (${film.film_id}, ${personne_id}, 'acteur', ${cast.character}, ${cast.order})`
          } catch (error) {
            console.log(error)
          }
        }
        else {
          await sql`update equipes set ordre = ${cast.order}
            where film_id = ${film.film_id} and personne_id = ${personne_id} and role = 'acteur'`
        }
      }
    })
}
