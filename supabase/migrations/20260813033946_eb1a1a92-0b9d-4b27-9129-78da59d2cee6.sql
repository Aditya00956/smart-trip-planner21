REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.validate_trip_dates() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_trip_dates() FROM anon;
REVOKE ALL ON FUNCTION public.validate_trip_dates() FROM authenticated;