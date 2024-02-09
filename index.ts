import sql from './db.js'

async function insertFilm(personne_id, credit) {
  const result = await sql`
    select id from links
    where identifiant = ${credit.id}
  `
  if (result.count == 0) {
    const film = await sql`
    insert into films (titre, titre_original)
    values (${credit.title}, ${credit.original_title}) returning films.film_id`

    await sql`
    insert into equipes (film_id, personne_id, role, alias)
    values (${film[0].film_id}, ${personne_id},  'acteur', ${credit.character})`

    await sql`
    insert into resumes (film_id, langue_code, resume)
    values (${film[0].film_id}, 'fra',  ${credit.overview})`

    await sql`
    insert into links (id, site, identifiant)
    values (${film[0].film_id}, 1,  ${credit.id})`;

    for (let g of credit.genre_ids) {
      await sql`
      insert into films_genres (film_id, genre_id)
      values (${film[0].film_id}, ${g})`
    }
  }
}

const tmdb = 1100;

const data = await fetch(`https://api.themoviedb.org/3/person/${tmdb}/combined_credits?language=fr-FR`, {
  method: 'get',
  headers: new Headers({
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
    'accept': 'application/json'
  })
});

const json = await data.json();

for (const c of json.cast.filter(e => e.media_type == 'movie' && e.popularity > 10)) {
console.log(`${c.id} ${c.title}`);
  insertFilm('450c6276-60bc-4791-bee4-3152145af6e7', c);
}
