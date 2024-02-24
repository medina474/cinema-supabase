import postgres from 'https://deno.land/x/postgresjs/mod.js'

const sql = postgres('postgres://postgres:postgres@localhost:54322/postgres')

export async function addLink(
  id: string,
  site_id: number,
  identifiant: string,
) {
  await sql`insert into links_personnes (id, site_id, identifiant)
            values (${id}, ${site_id},  ${identifiant})
            on conflict (id, site_id)
            do update set identifiant = ${identifiant}`;
}

export default sql
