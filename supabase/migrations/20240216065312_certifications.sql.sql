alter table "certifications" drop column "certification_id";

alter table "certifications" alter column "certification" set not null;

alter table "certifications" alter column "pays" set not null;

CREATE INDEX certifications_pays_idx ON public.certifications USING btree (pays, ordre);

CREATE UNIQUE INDEX certifications_pk ON public.certifications USING btree (pays, certification);

alter table certifications
  add constraint "certifications_pk"
  PRIMARY KEY using index "certifications_pk";
