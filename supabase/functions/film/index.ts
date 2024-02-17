/*
 * supabase functions deploy film --no-verify-jwt
 */
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

    const film = await sql`
    select f.titre, vote_votants, vote_moyenne, r.resume 
      , array_agg(distinct p.nom) as acteurs
      , array_agg(distinct g.genre) as genres
    from films f
      left join equipes e on e.film_id = f.film_id and alias is not null
      inner join personnes p on p.personne_id = e.personne_id 
      left join films_genres fg on fg.film_id = f.film_id 
      inner join genres g on g.genre_id = fg.genre_id 
      left join franchises f2 on f2.franchise_id = f.franchise_id
      left join resumes r on r.film_id = f.film_id 
    where f.film_id = ${body.film_id}
    group by f.titre, f.vote_votants, f.vote_moyenne, r.resume `

    return new Response(JSON.stringify(film), {
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
