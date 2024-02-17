import sql from './db.js'

const films = await sql`select l.identifiant, f.film_id, f.titre
  from films f
  inner join links l on l.id = f.film_id and site_id = 1
  order by annee desc`;

for (const film of films) {
  const data = await fetch(`https://api.themoviedb.org/3/movie/${film.identifiant}?append_to_response=credits&language=fr-FR`, {
    method: 'get',
    headers: new Headers({
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMmE0Y2YxZDUwNzlkOTMwYzA3YmVjYmJhZTBjNDI4YyIsInN1YiI6IjYwM2U5ZjE3ODQ0NDhlMDAzMDBlZWQwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.9CBeYye4C17jp29j77VjChML6ZJLwObLSolQW2GAhU4',
      'accept': 'application/json'
    })
  });

  const json = await data.json();

  if (!json.credits || !json.credits.cast) {
    console.log(`${film.identifiant} ${film.titre} sans équipe`);
    continue;
  }

  json.credits.cast.filter(elt => elt.popularity > 30)
    .sort((a, b) => b.order - a.order)
    .slice(1, 5)
    .forEach(async credit => {

      const personnes = await sql`select * from links l
        inner join personnes p on p.personne_id = l.id
        where identifiant = ${credit.id} and site_id = 1`;

      if (personnes.count == 0) {
        console.log(`${credit.name} : ${credit.character} (${credit.order}) ${credit.popularity}`);

        if (credit.order < 6) {
          const parts = credit.name.split(' ');
          const personne = await sql`insert into personnes (nom, prenom)
            values (${parts[1]}, ${parts[0]})
            returning personnes.personne_id`;
  
          await sql`insert into links (id, site_id, identifiant)
            values (${personne[0].personne_id}, 1,  ${credit.id})`;
  
          await sql`insert into equipes (film_id, personne_id, role, alias, ordre)
            values (${film.film_id}, ${personne[0].personne_id}, 'acteur', ${credit.character}, ${credit.order})`
        }
         
      }
      else
      {
        const personne_id = personnes[0].id
        const equipe = await sql`select alias from equipes
          where film_id = ${film.film_id} and personne_id = ${personne_id} and role = 'acteur'`;
        
          if (equipe.count == 0) {
          try {
            console.log(`${film.titre} -> ${credit.name} as ${credit.character}`);
            await sql`insert into equipes (film_id, personne_id, role, alias, ordre)
                values (${film.film_id}, ${personne_id}, 'acteur', ${credit.character}, ${credit.order})`
          } catch (error) {
            console.log(error)
          }
        }
      }
    });
}
