[
  {
    "proname": "create_establishment",
    "pg_get_functiondef": "CREATE OR REPLACE FUNCTION public.create_establishment(p_center_name text, p_center_type text, p_city text, p_address text, p_phone text, p_email text, p_secondary_phone text DEFAULT NULL::text, p_website text DEFAULT NULL::text, p_registration_fee numeric DEFAULT 0, p_logo text DEFAULT NULL::text)\n RETURNS uuid\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nDECLARE\r\n  v_user_id UUID;\r\n  v_etab_id UUID;\r\nBEGIN\r\n  SELECT id\r\n  INTO v_user_id\r\n  FROM public.users\r\n  WHERE auth_user_id = auth.uid();\r\n\r\n  IF NOT FOUND THEN\r\n    RAISE EXCEPTION 'User profile not found. Complete registration first.';\r\n  END IF;\r\n\r\n  INSERT INTO public.etablissements (\r\n    center_name,\r\n    center_type,\r\n    city,\r\n    address,\r\n    phone,\r\n    secondary_phone,\r\n    email,\r\n    website,\r\n    registration_fee,\r\n    logo,\r\n    owner_user_id\r\n  )\r\n  VALUES (\r\n    p_center_name,\r\n    p_center_type,\r\n    p_city,\r\n    p_address,\r\n    p_phone,\r\n    p_secondary_phone,\r\n    p_email,\r\n    p_website,\r\n    p_registration_fee,\r\n    p_logo,\r\n    v_user_id\r\n  )\r\n  RETURNING id INTO v_etab_id;\r\n\r\n  INSERT INTO public.user_etablissements (\r\n    user_id,\r\n    etablissement_id,\r\n    role\r\n  )\r\n  VALUES (\r\n    v_user_id,\r\n    v_etab_id,\r\n    'OWNER'::establishment_role\r\n  );\r\n\r\n  RETURN v_etab_id;\r\nEND;\r\n$function$\n"
  },
  {
    "proname": "current_user_id",
    "pg_get_functiondef": "CREATE OR REPLACE FUNCTION public.current_user_id()\n RETURNS uuid\n LANGUAGE sql\n STABLE SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\n    SELECT id\r\n    FROM public.users\r\n    WHERE auth_user_id = auth.uid();\r\n$function$\n"
  },
  {
    "proname": "handle_new_user",
    "pg_get_functiondef": "CREATE OR REPLACE FUNCTION public.handle_new_user()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nBEGIN\r\n\r\n    INSERT INTO public.users (\r\n        auth_user_id,\r\n        full_name,\r\n        email\r\n    )\r\n    VALUES (\r\n        NEW.id,\r\n        COALESCE(\r\n            NEW.raw_user_meta_data->>'full_name',\r\n            ''\r\n        ),\r\n        NEW.email\r\n    );\r\n\r\n    RETURN NEW;\r\n\r\nEND;\r\n$function$\n"
  },
  {
    "proname": "is_member_of_establishment",
    "pg_get_functiondef": "CREATE OR REPLACE FUNCTION public.is_member_of_establishment(establishment_uuid uuid)\n RETURNS boolean\n LANGUAGE sql\n STABLE SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\n    SELECT EXISTS (\r\n        SELECT 1\r\n        FROM public.user_etablissements ue\r\n        WHERE ue.user_id = public.current_user_id()\r\n          AND ue.etablissement_id = establishment_uuid\r\n    );\r\n$function$\n"
  },
  {
    "proname": "rls_auto_enable",
    "pg_get_functiondef": "CREATE OR REPLACE FUNCTION public.rls_auto_enable()\n RETURNS event_trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'pg_catalog'\nAS $function$\nDECLARE\n  cmd record;\nBEGIN\n  FOR cmd IN\n    SELECT *\n    FROM pg_event_trigger_ddl_commands()\n    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')\n      AND object_type IN ('table','partitioned table')\n  LOOP\n     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN\n      BEGIN\n        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);\n        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;\n      EXCEPTION\n        WHEN OTHERS THEN\n          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;\n      END;\n     ELSE\n        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;\n     END IF;\n  END LOOP;\nEND;\n$function$\n"
  },
  {
    "proname": "update_updated_at_column",
    "pg_get_functiondef": "CREATE OR REPLACE FUNCTION public.update_updated_at_column()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\r\nBEGIN\r\n    NEW.updated_at = NOW();\r\n    RETURN NEW;\r\nEND;\r\n$function$\n"
  },
  {
    "proname": "user_role_in_establishment",
    "pg_get_functiondef": "CREATE OR REPLACE FUNCTION public.user_role_in_establishment(establishment_uuid uuid)\n RETURNS establishment_role\n LANGUAGE sql\n STABLE SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\n    SELECT ue.role\r\n    FROM public.user_etablissements ue\r\n    WHERE ue.user_id = public.current_user_id()\r\n      AND ue.etablissement_id = establishment_uuid\r\n    LIMIT 1;\r\n$function$\n"
  }
]