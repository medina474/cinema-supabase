import sql from './db.js'

async function insertFilm(identifiant:string, uuid, credit) {

  const result = await sql`
    select id from links
    where identifiant = ${credit.id} and site_id = 1`;

  if (result.count == 0) {
    try {
      const film = await sql`insert into films (titre, titre_original, sortie, vote_votants)
      values (${credit.title}, ${credit.original_title}, ${credit.release_date}, ${credit.vote_count})
      returning films.film_id`

      await sql`insert into equipes (film_id, personne_id, role, alias)
      values (${film[0].film_id}, ${uuid}, 'acteur', ${credit.character})`

      await sql`insert into resumes (film_id, langue_code, resume)
      values (${film[0].film_id}, 'fra', ${credit.overview})`

      await sql`insert into links (id, site_id, identifiant)
      values (${film[0].film_id}, 1,  ${credit.id})`;

      for (let g of credit.genre_ids) {
        await sql`insert into films_genres (film_id, genre_id)
        values (${film[0].film_id}, ${g})`
      }
    } catch (e) {
      console.log(JSON.stringify(credit));
    }
  }
  else {
    const equipe = await sql`select alias from equipes
    where film_id = ${result[0].id} and personne_id = ${uuid} and role = 'acteur'`;

    if (equipe.count == 0) {
      console.log(`${result[0].id} ${uuid}`);
      await sql`insert into equipes (film_id, personne_id, role, alias)
      values (${result[0].id}, ${uuid}, 'acteur', ${credit.character})`
    }
  }
}


const personne = await sql`
    SELECT p.nom,
    p.personne_id,
    l.identifiant,
    count(e.film_id) AS count
   FROM personnes p
     JOIN equipes e ON p.personne_id = e.personne_id
     LEFT JOIN links l ON p.personne_id = l.id AND l.site_id = 1
     where identifiant is not null
  GROUP BY p.nom, p.personne_id, l.identifiant
  having count(e.film_id) < 10;`
for (const p of personne)
{
  const data = await fetch(`https://api.themoviedb.org/3/person/${p.identifiant}/combined_credits?language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const json = await data.json();

  json.cast.filter(e => e.media_type == 'movie' && e.popularity > 10 && e.release_date < '1991-01-01' && e.order < 10)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6)
    .forEach(async element => {
      console.log(`${p.nom} ${element.title}`);
      await insertFilm(p.identifiant, p.personne_id, element);
    });
  }
