import sql from './db.js'

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links l on l.id = f.film_id and site_id = 1
  where f.duree is null
  order by annee desc`;

for (const film of films) {
  const data = await fetch(`https://api.themoviedb.org/3/movie/${film.identifiant}?language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const f = await data.json();

  console.log(`${film.identifiant} : ${f.title} ${f.popularity}`)

  await sql`update films set 
    duree=${f.runtime}, vote_votants=${f.vote_count}, vote_moyenne=${f.vote_average}
    where film_id=${film.film_id}`;
}