-- np_plugins: plugin installation registry
-- Created by nself build (idempotent — safe to re-run on existing stacks).
CREATE TABLE IF NOT EXISTS np_plugins (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL,
    version     TEXT        NOT NULL DEFAULT '',
    tier        TEXT        NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'internal')),
    enabled     BOOLEAN     NOT NULL DEFAULT true,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT np_plugins_name_unique UNIQUE (name)
);

-- Index for fast enabled-plugin lookups (used by the plugin loader at startup).
CREATE INDEX IF NOT EXISTS np_plugins_enabled_idx ON np_plugins (enabled) WHERE enabled = true;
