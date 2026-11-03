# Project rules

- Course access duration lives on courses.access_duration_days (null = lifetime); a BEFORE INSERT trigger on enrollments sets expires_at and turns repeat inserts into renewals (only server/admin/free-course callers may extend) — why: every payment path renews consistently without per-path code.
