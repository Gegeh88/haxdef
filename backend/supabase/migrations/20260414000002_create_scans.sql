CREATE TYPE scan_type AS ENUM ('quick', 'full');
CREATE TYPE scan_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');

CREATE TABLE public.scans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id       UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scan_type       scan_type NOT NULL,
    status          scan_status NOT NULL DEFAULT 'queued',
    progress        INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_step    TEXT,
    results_summary JSONB,
    results_detail  JSONB,
    critical_count  INTEGER NOT NULL DEFAULT 0,
    high_count      INTEGER NOT NULL DEFAULT 0,
    medium_count    INTEGER NOT NULL DEFAULT 0,
    low_count       INTEGER NOT NULL DEFAULT 0,
    info_count      INTEGER NOT NULL DEFAULT 0,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_message   TEXT,
    worker_id       TEXT
);

CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_domain_id ON public.scans(domain_id);
CREATE INDEX idx_scans_status ON public.scans(status);
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
    ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans"
    ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;
