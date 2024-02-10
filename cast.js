import sql from './db.js'

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links l on l.id = f.film_id and site = 1
  order by annee desc`;

for (let film of films) {
  const data = await fetch(`https://api.themoviedb.org/3/movie/${film.identifiant}?append_to_response=credits&language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const json = await data.json();

  if (!json.credits || !json.credits.cast) {
    console.log(`${film.identifiant} ${film.titre}`);
    continue;
  }

  json.credits.cast.filter(elt => elt.popularity > 30)
    .sort((a, b) => b.order - a.order)
    .slice(1, 5)
    .forEach(async credit => {

      const link = await sql`select * from links l
where identifiant = ${credit.id} and site = 1`;

      if (link.count == 0) {
        console.log(`${credit.id} ${credit.name} : ${credit.order} ${credit.character} ${credit.popularity}`);

          const parts = credit.name.split(' ');
        const personne = await sql`insert into personnes (nom, prenom)
      values (${parts[0]}, ${parts[1]})
      returning personnes.personne_id`;

        await sql`insert into links (id, site, identifiant)
      values (${personne[0].personne_id}, 1,  ${credit.id})`;

        await sql`insert into equipes (film_id, personne_id, role, alias)
      values (${film.film_id}, ${personne[0].personne_id}, 'acteur', ${credit.character})`
      }
    });
}
