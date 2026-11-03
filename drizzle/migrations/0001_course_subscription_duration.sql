ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS access_duration_days integer;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_enrollment_expiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _days integer;
  _is_free boolean;
  _existing public.enrollments%ROWTYPE;
BEGIN
  SELECT access_duration_days, coalesce(is_free, false) INTO _days, _is_free
  FROM public.courses WHERE id = NEW.course_id;

  SELECT * INTO _existing FROM public.enrollments
  WHERE user_id = NEW.user_id AND course_id = NEW.course_id;

  IF FOUND THEN
    -- Renewal: only trusted callers (server, admin) or free courses may extend access
    IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') OR _is_free THEN
      UPDATE public.enrollments
      SET enrolled_at = now(),
          expires_at = CASE WHEN _days IS NULL OR _days <= 0 THEN NULL
                            ELSE greatest(now(), coalesce(_existing.expires_at, now())) + make_interval(days => _days) END
      WHERE id = _existing.id;
    END IF;
    RETURN NULL;
  END IF;

  IF NEW.expires_at IS NULL AND _days IS NOT NULL AND _days > 0 THEN
    NEW.expires_at := now() + make_interval(days => _days);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_enrollment_expiry_trigger ON public.enrollments;
CREATE TRIGGER set_enrollment_expiry_trigger
BEFORE INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.set_enrollment_expiry();