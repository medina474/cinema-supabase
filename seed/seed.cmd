@echo off

set TABLE=genres
set PK=genre_id
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');SELECT setval(pg_get_serial_sequence('%TABLE%', '%PK%'), (SELECT MAX(%PK%) FROM %TABLE%));"

set TABLE=franchises
set PK=franchise_id
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');SELECT setval(pg_get_serial_sequence('%TABLE%', '%PK%'), (SELECT MAX(%PK%) FROM %TABLE%));"

set TABLE=films
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE%(film_id,titre,titre_original,annee,sortie,duree,franchise_id,vote_votants,vote_moyenne) FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=societes
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=films_genres
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=langues
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=resumes
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=personnes
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=equipes
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=productions
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE%(film_id, societe_id) FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=certifications
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE%(pays,ordre,certification,description) FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=pays
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

set TABLE=links
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE% FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"

psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -f etablissements.sql

set TABLE=salles
psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE%(etablissement_id,salle,sieges) FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"
