CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_name TEXT NOT NULL,
    email TEXT NOT NULL,
    cv_url TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    report_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_role_id ON applications(role_id);
CREATE INDEX IF NOT EXISTS idx_reports_application_id ON reports(application_id);

-- ── RLS: Enable on all tables ────────────────────────────────────────────────
ALTER TABLE roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports      ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies: service_role bypasses automatically (no policy needed) ─────
-- ── Allow anon to READ everything (HR Dashboard frontend queries) ─────────────
CREATE POLICY "anon_read_roles"
  ON roles FOR SELECT USING (true);

CREATE POLICY "anon_read_applications"
  ON applications FOR SELECT USING (true);

CREATE POLICY "anon_read_reports"
  ON reports FOR SELECT USING (true);

-- ── Allow anon to INSERT (needed if you ever switch back to anon key) ─────────
CREATE POLICY "anon_insert_roles"
  ON roles FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_insert_applications"
  ON applications FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_insert_reports"
  ON reports FOR INSERT WITH CHECK (true);
