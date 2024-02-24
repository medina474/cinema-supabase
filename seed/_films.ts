import sql from './db.ts'

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links l on l.id = f.film_id and site_id = 1
  order by annee desc`;

for (const film of films) {

  const file = `./data/tmdb/movie/${film.identifiant}.json`

  let fileInfo
  try {
    fileInfo = await Deno.stat(file)
  } catch (_) {
    fileInfo = { isFile: false }
  }

  let f

  if (fileInfo.isFile) {
    f = JSON.parse(await Deno.readTextFile(file));
  }
  else
  {
    const data = await fetch(`https://api.themoviedb.org/3/movie/${film.identifiant}?language=fr-FR`, {
      method: 'get',
      headers: new Headers({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
        'accept': 'application/json'
      })
    });

    f = await data.json();

    await Deno.writeTextFile(file, JSON.stringify(f));
  }

  console.log(`${film.identifiant} : ${f.title} ${f.popularity}`)

  await sql`update films set
    duree=${f.runtime},
    vote_votants=${f.vote_count}, vote_moyenne=${f.vote_average}
    where film_id=${film.film_id}`

  await sql`update films set
    slogan=${f.tagline}
    where film_id=${film.film_id} and slogan = ''`

  for (const genre of f.genres) {
    await sql`insert into films_genres (film_id, genre_id)
                select ${film.film_id}, ${genre.id}
                where not exists (select genre_id from films_genres
                  where film_id = ${film.film_id} and genre_id=${genre.id}) `
  }

  for (const c of f.production_companies) {

    const company = await sql`select * from links_societes l
        inner join societes s on s.societe_id = l.id
        where identifiant = ${c.id} and site_id = 1`;

    if (company.count == 1) {
      const company_id = company[0].id

      const production = await sql`select societe_id from productions
          where film_id = ${film.film_id} and societe_id = ${company_id}`;

      if (production.count == 0) {
        try {
          console.log(`  + ${film.titre} / ${c.name}`);
          await sql`insert into productions (film_id, societe_id)
                values (${film.film_id}, ${company_id})`
        } catch (error) {
          console.log(error)
        }
      }
    }
  }


}
