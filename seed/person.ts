import sql from './db.js';

export interface Person {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: Date;
  deathday: null;
  gender: number;
  homepage: string;
  id: number;
  imdb_id: string;
  known_for_department: string;
  name: string;
  place_of_birth: string;
  popularity: number;
  profile_path: string;
  credits: Credits;
  external_ids: ExternalIDS;
  images: Images;
}

export interface Credits {
  cast: Cast[];
  crew: Cast[];
}

export interface Cast {
  adult: boolean;
  backdrop_path: null | string;
  genre_ids: number[];
  id: number;
  original_language: OriginalLanguage;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: null | string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  character?: string;
  credit_id: string;
  order?: number;
  department?: Department;
  job?: string;
}

export enum Department {
  Crew = "Crew",
  Directing = "Directing",
  Production = "Production",
}

export enum OriginalLanguage {
  De = "de",
  En = "en",
  Es = "es",
  Fr = "fr",
  Hu = "hu",
  Pt = "pt",
  Ru = "ru",
  Sv = "sv",
}

export interface ExternalIDS {
  freebase_mid: string;
  freebase_id: string;
  imdb_id: string;
  tvrage_id: number;
  wikidata_id: string;
  facebook_id: string;
  instagram_id: string;
  tiktok_id: string;
  twitter_id: string;
  youtube_id: string;
}

export interface Images {
  profiles: Profile[];
}

export interface Profile {
  aspect_ratio: number;
  height: number;
  iso_639_1: null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export async function getCasting(personne_id: string, cast: Cast[]) {

  for (const c of cast) {

    /* Le film est il déja dans la base ? */
    const films = await sql`
        select id from links_films l
        inner join films f on f.film_id = l.id
        where identifiant = ${c.id} and site_id = 1`;

    /* Oui : faire le lien avec equipes */
    if (films.count != 0) {
      const film_id = films[0].id

      /* La relation est elle déja dans la base ? */
      const equipe = await sql`select alias from equipes
          where film_id = ${film_id} and personne_id = ${personne_id} and role = 'acteur'`

      if (equipe.count == 0) {
        try {
          console.log(` -> ${c.character} in ${c.title} (${c.id} ${film_id} ${personne_id})`);
          await sql`insert into equipes (film_id, personne_id, role, alias)
                values (${film_id}, ${personne_id}, 'acteur', ${c.character})`
        } catch (error) {
          console.log(error)
        }
      }
    }
    /* Non : Ajouter le film et faire la liaison */
    else {
      try {
        console.log(`${personne_id} : ${c.title} / ${c.release_date}`);

        const films_ids = await sql`insert into films
            (titre, titre_original, sortie, vote_votants, vote_moyenne)
            values (${c.title}, ${c.original_title}, ${c.release_date}, ${c.vote_count}, ${c.vote_average})
            returning films.film_id`

        const film_id: string = films_ids[0].film_id

        await sql`insert into links_films (id, site_id, identifiant)
            values (${film_id}, 1, ${c.id})`;

        await sql`insert into resumes (film_id, langue_code, resume)
            values (${film_id}, 'fra', ${c.overview})`

        for (const genre_id of c.genre_ids) {
          await sql`insert into films_genres (film_id, genre_id)
              values (${film_id}, ${genre_id})`
        }

        await sql`insert into equipes (film_id, personne_id, role, alias, ordre)
            values (${film_id}, ${personne_id}, 'acteur', ${c.character}, )`

      } catch (_e) {
        console.log(JSON.stringify(c));
      }
    }
  }
}

export async function addLink(personne_id: string, site_id: number, identifiant: string) {
  await sql`insert into links_personnes (id, site_id, identifiant)
            values (${personne_id}, ${site_id},  ${identifiant})
            on conflict (id, site_id)
            do update set identifiant = ${identifiant}`;
}
