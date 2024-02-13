import postgres from 'https://deno.land/x/postgresjs/mod.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
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
    f2.franchise
    from films f
    inner join equipes e on e.film_id = f.film_id
    left join franchises f2 on f2.franchise_id = f.franchise_id
    where e.personne_id = ${body.film_id}`

    for (const film of films) {
      films.genres = await sql`
    select genre
from genres g
inner join films_genres f on f.genre_id = g.genre_id
where f.film_id =  ${film.film_id}`
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
