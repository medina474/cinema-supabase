@echo off

psql -h %PGHOST% -p %PGPORT% -d postgres -U %PGUSER% -f backup.sql
