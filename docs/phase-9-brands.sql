BEGIN;

-- Create/ensure brand rows (safe upsert)
INSERT INTO public.brands (slug, name) VALUES
 ('yale','Yale'),('crown','Crown'),('clark','Clark'),('cat','CAT'),
 ('komatsu','Komatsu'),('mitsubishi','Mitsubishi'),('doosan','Doosan'),
 ('linde','Linde'),('jungheinrich','Jungheinrich'),('unicarriers','UniCarriers'),
 ('raymond','Raymond'),('bobcat','Bobcat')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
