import postgres from 'https://deno.land/x/postgresjs/mod.js'

const sql = postgres('postgres://postgres:postgres@localhost:54322/postgres')

export default sql
