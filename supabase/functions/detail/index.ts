import postgres from 'https://deno.land/x/postgresjs/mod.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Apikey, Content-Type',
  'Access-Control-Allow-Methods': 'POST',
}

Deno.serve(async (req) => {
  const { method } = req;

  // This is needed if you're planning to invoke your function from a browser.
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const sql = postgres(`postgres://${Deno.env.get('DB_USER')}:${Deno.env.get('DB_PASSWORD')}@${Deno.env.get('DB_HOSTNAME')}:5432/postgres`)

    const films = await sql`
    select f.film_id, titre, titre_original,
    annee, sortie, duree, vote_votants, vote_moyenne,
    f2.franchise, array_agg(e.alias)
    from films f
    inner join equipes e on e.film_id = f.film_id
    left join franchises f2 on f2.franchise_id = f.franchise_id
    where e.personne_id = ${body.personne_id}
    group by f.film_id, f.titre, f.titre_original, f2.franchise`

    for (const film of films) {

      const genres = await sql`
    select genre
from genres g
inner join films_genres f on f.genre_id = g.genre_id
where f.film_id = ${film.film_id}`;

      film.genres = genres.map(elt => elt.genre);
    }

    return new Response(JSON.stringify(films), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
  catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
