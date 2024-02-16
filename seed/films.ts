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
  select p.nom,
    p.personne_id,
    l.identifiant,
    count(e.film_id) as count
  from personnes p
  join equipes e on p.personne_id = e.personne_id
  left join links l on p.personne_id = l.id and l.site_id = 1
  where identifiant is not null
  group by p.nom, p.personne_id, l.identifiant
  having count(e.film_id) < 10;`

for (const p of personnes)
{
  const data = await fetch(`https://api.themoviedb.org/3/person/${p.identifiant}/combined_credits?language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const credits: Credits = await data.json();

  credits.cast.filter(f => f.media_type == 'movie' && f.popularity > 10 && f.release_date < '1991-01-01' && f.order < 10)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6)
    .forEach(async f => {
      console.log(`${p.nom} : ${f.title} ${f.id}`);

      const films = await sql`
        select id from links
        where identifiant = ${f.id} and site_id = 1;`;

      if (films.count == 0) {
        try {
          const film_id = await sql`insert into films
          (titre, titre_original, sortie, vote_votants)
          values (${f.title}, ${f.original_title}, ${f.release_date}, ${f.vote_count})
          returning films.film_id`

          await sql`insert into links (id, site_id, identifiant)
            values (${film_id[0].film_id}, 1, ${f.id})`;

          await sql`insert into equipes (film_id, personne_id, role, alias)
            values (${film_id[0].film_id}, ${p.personne_id}, 'acteur', ${f.character})`

          await sql`insert into resumes (film_id, langue_code, resume)
            values (${film_id[0].film_id}, 'fra', ${f.overview})`

          for (const genre_id of f.genre_ids) {
            await sql`insert into films_genres (film_id, genre_id)
              values (${film_id[0].film_id}, ${genre_id})`
          }
        } catch (e) {
          console.log(JSON.stringify(f));
        }
      }
      else {
        const equipe = await sql`select alias from equipes
          where film_id = ${films[0].id} and personne_id = ${p.personne_id} and role = 'acteur'`;

        if (equipe.count == 0) {
          console.log(`  ${films[0].id} ${p.personne_id} ${f.character}`);
          await sql`insert into equipes (film_id, personne_id, role, alias)
            values (${films[0].id}, ${p.personne_id}, 'acteur', ${f.character})`
        }
      }
    });
}
