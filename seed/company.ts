import sql from './db.js'

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links_films l on l.id = f.film_id and site_id = 1
  order by annee desc`;

for (const film of films) {

  console.log(`${film.identifiant} ${film.titre}`);

  const data = await fetch(`https://api.themoviedb.org/3/movie/${film.identifiant}?append_to_response=keywords&language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const json = await data.json();

  if (!json.production_companies) {
    console.log(` - sans compagnies`);
    continue;
  }

  json.production_companies.forEach(async c => {

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
  });
}
