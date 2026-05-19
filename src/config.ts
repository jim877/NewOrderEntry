// @ts-nocheck
// Central config loader. All help text, tooltips, and feature flags live in /config.json.
// UI modules import typed views from this file — never inline strings.
import config from "../config.json";

export const DEFAULT_COACHING: Record<string, string> = config.coaching;
