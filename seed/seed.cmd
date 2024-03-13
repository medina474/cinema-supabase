@echo off

set PGHOST=localhost
set PGPORT=54322
set PGUSER=postgres
set PGPASSWORD=postgres

psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -f seed.sql

psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -f rating.sql

psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -f etablissements.sql

::set TABLE=salles
::psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE%(etablissement_id,salle,sieges) FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"
