@echo off

set PGHOST=aws-0-eu-central-1.pooler.supabase.com
set PGPORT=5432
set PGUSER=postgres.morseweiswlpykaugwtd
set PGPASSWORD=b0cwTkLS3YRCzVTHLJDW

psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -f seed.sql

psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -f rating.sql

psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -f etablissements.sql

::set TABLE=salles
::psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -c "\COPY %TABLE%(etablissement_id,salle,sieges) FROM '../data/%TABLE%.csv' (FORMAT CSV, header, ENCODING 'UTF8');"
