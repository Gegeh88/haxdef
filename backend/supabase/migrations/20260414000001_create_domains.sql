-- Domains table: stores user's registered domains
CREATE TABLE public.domains (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain          TEXT NOT NULL,
    verification_method  TEXT CHECK (verification_method IN ('dns_txt', 'html_file', 'meta_tag')),
    verification_token   TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    is_verified          BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at          TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, domain)
);

CREATE INDEX idx_domains_user_id ON public.domains(user_id);
CREATE INDEX idx_domains_domain ON public.domains(domain);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own domains"
    ON public.domains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own domains"
    ON public.domains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own domains"
    ON public.domains FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own domains"
    ON public.domains FOR DELETE USING (auth.uid() = user_id);
