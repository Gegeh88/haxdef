CREATE TABLE public.reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id         UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path    TEXT NOT NULL,
    file_size_bytes BIGINT,
    executive_summary   TEXT,
    technical_details   TEXT,
    remediation_steps   JSONB,
    gemini_model_used   TEXT,
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_scan_id ON public.reports(scan_id);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
    ON public.reports FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE public.scan_quotas (
    user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_quick_scans   INTEGER NOT NULL DEFAULT 0,
    daily_full_scans    INTEGER NOT NULL DEFAULT 0,
    last_reset_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    max_daily_quick     INTEGER NOT NULL DEFAULT 10,
    max_daily_full      INTEGER NOT NULL DEFAULT 3
);

ALTER TABLE public.scan_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotas"
    ON public.scan_quotas FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.scan_quotas (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

CREATE POLICY "Users can read own reports"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text);
