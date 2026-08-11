[
  {
    "export_database_documentation": {
      "enums": [
        {
          "typname": "class_status",
          "enumlabel": "ACTIVE"
        },
        {
          "typname": "class_status",
          "enumlabel": "PAUSED"
        },
        {
          "typname": "class_status",
          "enumlabel": "ARCHIVED"
        },
        {
          "typname": "establishment_role",
          "enumlabel": "OWNER"
        },
        {
          "typname": "establishment_role",
          "enumlabel": "SECRETARY"
        },
        {
          "typname": "establishment_role",
          "enumlabel": "ADMIN"
        },
        {
          "typname": "payment_category",
          "enumlabel": "TUITION"
        },
        {
          "typname": "payment_category",
          "enumlabel": "REGISTRATION"
        },
        {
          "typname": "payment_method",
          "enumlabel": "CIH"
        },
        {
          "typname": "payment_method",
          "enumlabel": "Espèces"
        },
        {
          "typname": "payment_method",
          "enumlabel": "Attijari"
        },
        {
          "typname": "payment_method",
          "enumlabel": "Virement"
        },
        {
          "typname": "payment_method",
          "enumlabel": "Autre"
        },
        {
          "typname": "payment_status",
          "enumlabel": "ARCHIVED"
        },
        {
          "typname": "payment_status",
          "enumlabel": "PAID"
        },
        {
          "typname": "payment_status",
          "enumlabel": "PENDING"
        },
        {
          "typname": "payment_status",
          "enumlabel": "OVERDUE"
        },
        {
          "typname": "student_registration_fee_status",
          "enumlabel": "PAID"
        },
        {
          "typname": "student_registration_fee_status",
          "enumlabel": "PENDING"
        },
        {
          "typname": "student_registration_fee_status",
          "enumlabel": "OVERDUE"
        },
        {
          "typname": "student_status",
          "enumlabel": "DROPPED"
        },
        {
          "typname": "student_status",
          "enumlabel": "ON_HOLD"
        },
        {
          "typname": "student_status",
          "enumlabel": "ACTIVE"
        },
        {
          "typname": "student_tuition_fee_status",
          "enumlabel": "PAID"
        },
        {
          "typname": "student_tuition_fee_status",
          "enumlabel": "PENDING"
        },
        {
          "typname": "student_tuition_fee_status",
          "enumlabel": "OVERDUE"
        },
        {
          "typname": "user_role",
          "enumlabel": "Secrétaire"
        },
        {
          "typname": "user_role",
          "enumlabel": "Administrateur"
        }
      ],
      "tables": [
        {
          "data_type": "uuid",
          "table_name": "classes",
          "column_name": "id",
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()",
          "ordinal_position": 1
        },
        {
          "data_type": "character varying",
          "table_name": "classes",
          "column_name": "name",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 2
        },
        {
          "data_type": "character varying",
          "table_name": "classes",
          "column_name": "subject",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 3
        },
        {
          "data_type": "character varying",
          "table_name": "classes",
          "column_name": "level",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 4
        },
        {
          "data_type": "character varying",
          "table_name": "classes",
          "column_name": "teacher",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 6
        },
        {
          "data_type": "integer",
          "table_name": "classes",
          "column_name": "max_capacity",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 7
        },
        {
          "data_type": "USER-DEFINED",
          "table_name": "classes",
          "column_name": "status",
          "is_nullable": "NO",
          "column_default": "'ACTIVE'::class_status",
          "ordinal_position": 8
        },
        {
          "data_type": "numeric",
          "table_name": "classes",
          "column_name": "tarif_amount",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 9
        },
        {
          "data_type": "character varying",
          "table_name": "classes",
          "column_name": "tarif_period",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 10
        },
        {
          "data_type": "character varying",
          "table_name": "classes",
          "column_name": "color",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 14
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "classes",
          "column_name": "created_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 15
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "classes",
          "column_name": "updated_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 16
        },
        {
          "data_type": "uuid",
          "table_name": "classes",
          "column_name": "etablissement_id",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 17
        },
        {
          "data_type": "uuid",
          "table_name": "etablissements",
          "column_name": "id",
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()",
          "ordinal_position": 1
        },
        {
          "data_type": "character varying",
          "table_name": "etablissements",
          "column_name": "center_name",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 2
        },
        {
          "data_type": "character varying",
          "table_name": "etablissements",
          "column_name": "center_type",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 3
        },
        {
          "data_type": "character varying",
          "table_name": "etablissements",
          "column_name": "city",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 4
        },
        {
          "data_type": "text",
          "table_name": "etablissements",
          "column_name": "address",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 5
        },
        {
          "data_type": "character varying",
          "table_name": "etablissements",
          "column_name": "phone",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 6
        },
        {
          "data_type": "character varying",
          "table_name": "etablissements",
          "column_name": "secondary_phone",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 7
        },
        {
          "data_type": "character varying",
          "table_name": "etablissements",
          "column_name": "email",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 8
        },
        {
          "data_type": "character varying",
          "table_name": "etablissements",
          "column_name": "website",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 9
        },
        {
          "data_type": "numeric",
          "table_name": "etablissements",
          "column_name": "registration_fee",
          "is_nullable": "NO",
          "column_default": "0",
          "ordinal_position": 10
        },
        {
          "data_type": "text",
          "table_name": "etablissements",
          "column_name": "logo",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 11
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "etablissements",
          "column_name": "created_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 12
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "etablissements",
          "column_name": "updated_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 13
        },
        {
          "data_type": "uuid",
          "table_name": "etablissements",
          "column_name": "owner_user_id",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 14
        },
        {
          "data_type": "uuid",
          "table_name": "payments",
          "column_name": "id",
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()",
          "ordinal_position": 1
        },
        {
          "data_type": "uuid",
          "table_name": "payments",
          "column_name": "student_id",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 2
        },
        {
          "data_type": "numeric",
          "table_name": "payments",
          "column_name": "amount",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 3
        },
        {
          "data_type": "date",
          "table_name": "payments",
          "column_name": "due_date",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 4
        },
        {
          "data_type": "date",
          "table_name": "payments",
          "column_name": "payment_date",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 5
        },
        {
          "data_type": "USER-DEFINED",
          "table_name": "payments",
          "column_name": "method",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 6
        },
        {
          "data_type": "USER-DEFINED",
          "table_name": "payments",
          "column_name": "status",
          "is_nullable": "NO",
          "column_default": "'PENDING'::payment_status",
          "ordinal_position": 7
        },
        {
          "data_type": "text",
          "table_name": "payments",
          "column_name": "notes",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 8
        },
        {
          "data_type": "integer",
          "table_name": "payments",
          "column_name": "days_late",
          "is_nullable": "NO",
          "column_default": "0",
          "ordinal_position": 9
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "payments",
          "column_name": "created_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 10
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "payments",
          "column_name": "updated_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 11
        },
        {
          "data_type": "USER-DEFINED",
          "table_name": "payments",
          "column_name": "payment_category",
          "is_nullable": "NO",
          "column_default": "'TUITION'::payment_category",
          "ordinal_position": 12
        },
        {
          "data_type": "date",
          "table_name": "payments",
          "column_name": "period_start_date",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 13
        },
        {
          "data_type": "date",
          "table_name": "payments",
          "column_name": "period_end_date",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 14
        },
        {
          "data_type": "uuid",
          "table_name": "schedule_classes",
          "column_name": "id",
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()",
          "ordinal_position": 1
        },
        {
          "data_type": "uuid",
          "table_name": "schedule_classes",
          "column_name": "class_id",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 2
        },
        {
          "data_type": "smallint",
          "table_name": "schedule_classes",
          "column_name": "day",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 6
        },
        {
          "data_type": "time without time zone",
          "table_name": "schedule_classes",
          "column_name": "start_time",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 7
        },
        {
          "data_type": "time without time zone",
          "table_name": "schedule_classes",
          "column_name": "end_time",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 8
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "schedule_classes",
          "column_name": "created_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 11
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "schedule_classes",
          "column_name": "updated_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 12
        },
        {
          "data_type": "interval",
          "table_name": "schedule_classes",
          "column_name": "duration",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 13
        },
        {
          "data_type": "uuid",
          "table_name": "students",
          "column_name": "id",
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()",
          "ordinal_position": 1
        },
        {
          "data_type": "character varying",
          "table_name": "students",
          "column_name": "full_name",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 2
        },
        {
          "data_type": "character varying",
          "table_name": "students",
          "column_name": "phone",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 3
        },
        {
          "data_type": "uuid",
          "table_name": "students",
          "column_name": "classe_id",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 4
        },
        {
          "data_type": "date",
          "table_name": "students",
          "column_name": "enrollment_date",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 5
        },
        {
          "data_type": "USER-DEFINED",
          "table_name": "students",
          "column_name": "status",
          "is_nullable": "NO",
          "column_default": "'ACTIVE'::student_status",
          "ordinal_position": 6
        },
        {
          "data_type": "numeric",
          "table_name": "students",
          "column_name": "tuition_fee",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 7
        },
        {
          "data_type": "USER-DEFINED",
          "table_name": "students",
          "column_name": "tuition_fee_status",
          "is_nullable": "NO",
          "column_default": "'PENDING'::student_tuition_fee_status",
          "ordinal_position": 8
        },
        {
          "data_type": "numeric",
          "table_name": "students",
          "column_name": "registration_fee",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 9
        },
        {
          "data_type": "USER-DEFINED",
          "table_name": "students",
          "column_name": "registration_fee_paid",
          "is_nullable": "NO",
          "column_default": "'PENDING'::student_registration_fee_status",
          "ordinal_position": 10
        },
        {
          "data_type": "text",
          "table_name": "students",
          "column_name": "notes",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 11
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "students",
          "column_name": "created_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 12
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "students",
          "column_name": "updated_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 13
        },
        {
          "data_type": "character varying",
          "table_name": "students",
          "column_name": "email",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 14
        },
        {
          "data_type": "uuid",
          "table_name": "user_etablissements",
          "column_name": "id",
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()",
          "ordinal_position": 1
        },
        {
          "data_type": "uuid",
          "table_name": "user_etablissements",
          "column_name": "user_id",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 2
        },
        {
          "data_type": "uuid",
          "table_name": "user_etablissements",
          "column_name": "etablissement_id",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 3
        },
        {
          "data_type": "USER-DEFINED",
          "table_name": "user_etablissements",
          "column_name": "role",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 4
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "user_etablissements",
          "column_name": "joined_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 5
        },
        {
          "data_type": "uuid",
          "table_name": "users",
          "column_name": "id",
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()",
          "ordinal_position": 1
        },
        {
          "data_type": "uuid",
          "table_name": "users",
          "column_name": "auth_user_id",
          "is_nullable": "YES",
          "column_default": null,
          "ordinal_position": 2
        },
        {
          "data_type": "character varying",
          "table_name": "users",
          "column_name": "full_name",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 3
        },
        {
          "data_type": "character varying",
          "table_name": "users",
          "column_name": "email",
          "is_nullable": "NO",
          "column_default": null,
          "ordinal_position": 4
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "users",
          "column_name": "created_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 6
        },
        {
          "data_type": "timestamp with time zone",
          "table_name": "users",
          "column_name": "updated_at",
          "is_nullable": "NO",
          "column_default": "now()",
          "ordinal_position": 7
        }
      ],
      "indexes": [
        {
          "indexdef": "CREATE UNIQUE INDEX classes_pkey ON public.classes USING btree (id)",
          "indexname": "classes_pkey",
          "tablename": "classes",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX etablissements_email_key ON public.etablissements USING btree (email)",
          "indexname": "etablissements_email_key",
          "tablename": "etablissements",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX etablissements_pkey ON public.etablissements USING btree (id)",
          "indexname": "etablissements_pkey",
          "tablename": "etablissements",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id)",
          "indexname": "payments_pkey",
          "tablename": "payments",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX schedule_events_pkey ON public.schedule_classes USING btree (id)",
          "indexname": "schedule_events_pkey",
          "tablename": "schedule_classes",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX students_email_key ON public.students USING btree (email)",
          "indexname": "students_email_key",
          "tablename": "students",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX students_pkey ON public.students USING btree (id)",
          "indexname": "students_pkey",
          "tablename": "students",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX unique_user_etablissement ON public.user_etablissements USING btree (user_id, etablissement_id)",
          "indexname": "unique_user_etablissement",
          "tablename": "user_etablissements",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX user_etablissements_pkey ON public.user_etablissements USING btree (id)",
          "indexname": "user_etablissements_pkey",
          "tablename": "user_etablissements",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX users_auth_user_id_key ON public.users USING btree (auth_user_id)",
          "indexname": "users_auth_user_id_key",
          "tablename": "users",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)",
          "indexname": "users_email_key",
          "tablename": "users",
          "schemaname": "public"
        },
        {
          "indexdef": "CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)",
          "indexname": "users_pkey",
          "tablename": "users",
          "schemaname": "public"
        }
      ],
      "triggers": [
        {
          "trigger_name": "classes_updated_at",
          "action_timing": "BEFORE",
          "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
          "event_manipulation": "UPDATE",
          "event_object_table": "classes"
        },
        {
          "trigger_name": "etablissements_updated_at",
          "action_timing": "BEFORE",
          "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
          "event_manipulation": "UPDATE",
          "event_object_table": "etablissements"
        },
        {
          "trigger_name": "payments_updated_at",
          "action_timing": "BEFORE",
          "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
          "event_manipulation": "UPDATE",
          "event_object_table": "payments"
        },
        {
          "trigger_name": "schedule_events_updated_at",
          "action_timing": "BEFORE",
          "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
          "event_manipulation": "UPDATE",
          "event_object_table": "schedule_classes"
        },
        {
          "trigger_name": "students_updated_at",
          "action_timing": "BEFORE",
          "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
          "event_manipulation": "UPDATE",
          "event_object_table": "students"
        },
        {
          "trigger_name": "users_updated_at",
          "action_timing": "BEFORE",
          "action_statement": "EXECUTE FUNCTION update_updated_at_column()",
          "event_manipulation": "UPDATE",
          "event_object_table": "users"
        }
      ],
      "functions": [
        {
          "proname": "create_establishment",
          "definition": "CREATE OR REPLACE FUNCTION public.create_establishment(p_center_name text, p_center_type text, p_city text, p_address text, p_phone text, p_email text, p_secondary_phone text DEFAULT NULL::text, p_website text DEFAULT NULL::text, p_registration_fee numeric DEFAULT 0, p_logo text DEFAULT NULL::text)\n RETURNS uuid\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nDECLARE\r\n  v_user_id UUID;\r\n  v_etab_id UUID;\r\nBEGIN\r\n  SELECT id\r\n  INTO v_user_id\r\n  FROM public.users\r\n  WHERE auth_user_id = auth.uid();\r\n\r\n  IF NOT FOUND THEN\r\n    RAISE EXCEPTION 'User profile not found. Complete registration first.';\r\n  END IF;\r\n\r\n  INSERT INTO public.etablissements (\r\n    center_name,\r\n    center_type,\r\n    city,\r\n    address,\r\n    phone,\r\n    secondary_phone,\r\n    email,\r\n    website,\r\n    registration_fee,\r\n    logo,\r\n    owner_user_id\r\n  )\r\n  VALUES (\r\n    p_center_name,\r\n    p_center_type,\r\n    p_city,\r\n    p_address,\r\n    p_phone,\r\n    p_secondary_phone,\r\n    p_email,\r\n    p_website,\r\n    p_registration_fee,\r\n    p_logo,\r\n    v_user_id\r\n  )\r\n  RETURNING id INTO v_etab_id;\r\n\r\n  INSERT INTO public.user_etablissements (\r\n    user_id,\r\n    etablissement_id,\r\n    role\r\n  )\r\n  VALUES (\r\n    v_user_id,\r\n    v_etab_id,\r\n    'OWNER'::establishment_role\r\n  );\r\n\r\n  RETURN v_etab_id;\r\nEND;\r\n$function$\n"
        },
        {
          "proname": "current_user_id",
          "definition": "CREATE OR REPLACE FUNCTION public.current_user_id()\n RETURNS uuid\n LANGUAGE sql\n STABLE SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\n    SELECT id\r\n    FROM public.users\r\n    WHERE auth_user_id = auth.uid();\r\n$function$\n"
        },
        {
          "proname": "export_database_documentation",
          "definition": "CREATE OR REPLACE FUNCTION public.export_database_documentation()\n RETURNS jsonb\n LANGUAGE plpgsql\nAS $function$\r\nBEGIN\r\n    RETURN jsonb_build_object(\r\n\r\n        'tables',\r\n        (\r\n            SELECT jsonb_agg(t)\r\n            FROM (\r\n                SELECT\r\n                    table_name,\r\n                    ordinal_position,\r\n                    column_name,\r\n                    data_type,\r\n                    is_nullable,\r\n                    column_default\r\n                FROM information_schema.columns\r\n                WHERE table_schema = 'public'\r\n                ORDER BY table_name, ordinal_position\r\n            ) t\r\n        ),\r\n\r\n        'foreign_keys',\r\n        (\r\n            SELECT jsonb_agg(fk)\r\n            FROM (\r\n                SELECT\r\n                    tc.table_name,\r\n                    kcu.column_name,\r\n                    ccu.table_name AS referenced_table,\r\n                    ccu.column_name AS referenced_column\r\n                FROM information_schema.table_constraints tc\r\n                JOIN information_schema.key_column_usage kcu\r\n                    ON tc.constraint_name = kcu.constraint_name\r\n                JOIN information_schema.constraint_column_usage ccu\r\n                    ON ccu.constraint_name = tc.constraint_name\r\n                WHERE tc.constraint_type = 'FOREIGN KEY'\r\n                AND tc.table_schema='public'\r\n                ORDER BY tc.table_name\r\n            ) fk\r\n        ),\r\n\r\n        'enums',\r\n        (\r\n            SELECT jsonb_agg(e)\r\n            FROM (\r\n                SELECT\r\n                    t.typname,\r\n                    enumlabel\r\n                FROM pg_type t\r\n                JOIN pg_enum\r\n                    ON pg_enum.enumtypid=t.oid\r\n                JOIN pg_namespace n\r\n                    ON n.oid=t.typnamespace\r\n                WHERE n.nspname='public'\r\n                ORDER BY t.typname\r\n            ) e\r\n        ),\r\n\r\n        'indexes',\r\n        (\r\n            SELECT jsonb_agg(idx)\r\n            FROM (\r\n                SELECT\r\n                    schemaname,\r\n                    tablename,\r\n                    indexname,\r\n                    indexdef\r\n                FROM pg_indexes\r\n                WHERE schemaname = 'public'\r\n                ORDER BY tablename, indexname\r\n            ) idx\r\n        ),\r\n\r\n        'constraints',\r\n        (\r\n            SELECT jsonb_agg(c)\r\n            FROM (\r\n                SELECT\r\n                    tc.table_name,\r\n                    tc.constraint_name,\r\n                    tc.constraint_type\r\n                FROM information_schema.table_constraints tc\r\n                WHERE tc.table_schema = 'public'\r\n                ORDER BY tc.table_name, tc.constraint_name\r\n            ) c\r\n        ),\r\n\r\n        'functions',\r\n        (\r\n            SELECT jsonb_agg(f)\r\n            FROM (\r\n                SELECT\r\n                    proname,\r\n                    pg_get_functiondef(p.oid) AS definition\r\n                FROM pg_proc p\r\n                JOIN pg_namespace n\r\n                    ON n.oid = p.pronamespace\r\n                WHERE n.nspname = 'public'\r\n                ORDER BY proname\r\n            ) f\r\n        ),\r\n\r\n        'triggers',\r\n        (\r\n            SELECT jsonb_agg(t)\r\n            FROM (\r\n                SELECT\r\n                    trigger_name,\r\n                    event_object_table,\r\n                    action_timing,\r\n                    event_manipulation,\r\n                    action_statement\r\n                FROM information_schema.triggers\r\n                WHERE trigger_schema = 'public'\r\n                ORDER BY event_object_table, trigger_name\r\n            ) t\r\n        ),\r\n\r\n        'rls_policies',\r\n        (\r\n            SELECT jsonb_agg(p)\r\n            FROM (\r\n                SELECT\r\n                    schemaname,\r\n                    tablename,\r\n                    policyname,\r\n                    permissive,\r\n                    roles,\r\n                    cmd,\r\n                    qual,\r\n                    with_check\r\n                FROM pg_policies\r\n                WHERE schemaname = 'public'\r\n                ORDER BY tablename, policyname\r\n            ) p\r\n        )\r\n\r\n    );\r\nEND;\r\n$function$\n"
        },
        {
          "proname": "handle_new_user",
          "definition": "CREATE OR REPLACE FUNCTION public.handle_new_user()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\nBEGIN\r\n\r\n    INSERT INTO public.users (\r\n        auth_user_id,\r\n        full_name,\r\n        email\r\n    )\r\n    VALUES (\r\n        NEW.id,\r\n        COALESCE(\r\n            NEW.raw_user_meta_data->>'full_name',\r\n            ''\r\n        ),\r\n        NEW.email\r\n    );\r\n\r\n    RETURN NEW;\r\n\r\nEND;\r\n$function$\n"
        },
        {
          "proname": "is_member_of_establishment",
          "definition": "CREATE OR REPLACE FUNCTION public.is_member_of_establishment(establishment_uuid uuid)\n RETURNS boolean\n LANGUAGE sql\n STABLE SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\n    SELECT EXISTS (\r\n        SELECT 1\r\n        FROM public.user_etablissements ue\r\n        WHERE ue.user_id = public.current_user_id()\r\n          AND ue.etablissement_id = establishment_uuid\r\n    );\r\n$function$\n"
        },
        {
          "proname": "rls_auto_enable",
          "definition": "CREATE OR REPLACE FUNCTION public.rls_auto_enable()\n RETURNS event_trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\n SET search_path TO 'pg_catalog'\nAS $function$\nDECLARE\n  cmd record;\nBEGIN\n  FOR cmd IN\n    SELECT *\n    FROM pg_event_trigger_ddl_commands()\n    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')\n      AND object_type IN ('table','partitioned table')\n  LOOP\n     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN\n      BEGIN\n        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);\n        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;\n      EXCEPTION\n        WHEN OTHERS THEN\n          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;\n      END;\n     ELSE\n        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;\n     END IF;\n  END LOOP;\nEND;\n$function$\n"
        },
        {
          "proname": "update_updated_at_column",
          "definition": "CREATE OR REPLACE FUNCTION public.update_updated_at_column()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\r\nBEGIN\r\n    NEW.updated_at = NOW();\r\n    RETURN NEW;\r\nEND;\r\n$function$\n"
        },
        {
          "proname": "user_role_in_establishment",
          "definition": "CREATE OR REPLACE FUNCTION public.user_role_in_establishment(establishment_uuid uuid)\n RETURNS establishment_role\n LANGUAGE sql\n STABLE SECURITY DEFINER\n SET search_path TO 'public'\nAS $function$\r\n    SELECT ue.role\r\n    FROM public.user_etablissements ue\r\n    WHERE ue.user_id = public.current_user_id()\r\n      AND ue.etablissement_id = establishment_uuid\r\n    LIMIT 1;\r\n$function$\n"
        }
      ],
      "constraints": [
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_10_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_14_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_15_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_16_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_17_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_1_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_2_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_3_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_4_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_6_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_7_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_8_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "2200_17753_9_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_color_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_etablissement_id_fkey",
          "constraint_type": "FOREIGN KEY"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_max_capacity_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_name_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_pkey",
          "constraint_type": "PRIMARY KEY"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_subject_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_tarif_amount_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_tarif_period_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "classes",
          "constraint_name": "classes_teacher_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_10_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_12_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_13_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_14_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_1_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_2_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_3_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_4_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_5_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_6_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "2200_17673_8_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "etablissements_email_key",
          "constraint_type": "UNIQUE"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "etablissements_owner_user_id_fkey",
          "constraint_type": "FOREIGN KEY"
        },
        {
          "table_name": "etablissements",
          "constraint_name": "etablissements_pkey",
          "constraint_type": "PRIMARY KEY"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_10_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_11_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_12_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_1_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_2_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_3_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_4_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_6_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_7_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "2200_17823_9_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "payments",
          "constraint_name": "payments_pkey",
          "constraint_type": "PRIMARY KEY"
        },
        {
          "table_name": "payments",
          "constraint_name": "payments_student_id_fkey",
          "constraint_type": "FOREIGN KEY"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "2200_17785_11_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "2200_17785_12_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "2200_17785_13_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "2200_17785_1_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "2200_17785_2_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "2200_17785_6_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "2200_17785_7_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "2200_17785_8_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "schedule_events_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "schedule_events_classe_id_fkey",
          "constraint_type": "FOREIGN KEY"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "schedule_events_day_check",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "schedule_classes",
          "constraint_name": "schedule_events_pkey",
          "constraint_type": "PRIMARY KEY"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_10_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_12_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_13_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_1_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_2_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_3_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_4_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_5_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_6_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_7_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_8_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "2200_17765_9_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "students",
          "constraint_name": "students_classe_id_fkey",
          "constraint_type": "FOREIGN KEY"
        },
        {
          "table_name": "students",
          "constraint_name": "students_email_key",
          "constraint_type": "UNIQUE"
        },
        {
          "table_name": "students",
          "constraint_name": "students_pkey",
          "constraint_type": "PRIMARY KEY"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "2200_18079_1_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "2200_18079_2_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "2200_18079_3_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "2200_18079_4_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "2200_18079_5_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "unique_user_etablissement",
          "constraint_type": "UNIQUE"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "user_etablissements_etablissement_fkey",
          "constraint_type": "FOREIGN KEY"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "user_etablissements_pkey",
          "constraint_type": "PRIMARY KEY"
        },
        {
          "table_name": "user_etablissements",
          "constraint_name": "user_etablissements_user_fkey",
          "constraint_type": "FOREIGN KEY"
        },
        {
          "table_name": "users",
          "constraint_name": "2200_17651_1_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "users",
          "constraint_name": "2200_17651_3_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "users",
          "constraint_name": "2200_17651_4_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "users",
          "constraint_name": "2200_17651_6_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "users",
          "constraint_name": "2200_17651_7_not_null",
          "constraint_type": "CHECK"
        },
        {
          "table_name": "users",
          "constraint_name": "users_auth_user_id_fkey",
          "constraint_type": "FOREIGN KEY"
        },
        {
          "table_name": "users",
          "constraint_name": "users_auth_user_id_key",
          "constraint_type": "UNIQUE"
        },
        {
          "table_name": "users",
          "constraint_name": "users_email_key",
          "constraint_type": "UNIQUE"
        },
        {
          "table_name": "users",
          "constraint_name": "users_pkey",
          "constraint_type": "PRIMARY KEY"
        }
      ],
      "foreign_keys": [
        {
          "table_name": "classes",
          "column_name": "etablissement_id",
          "referenced_table": "etablissements",
          "referenced_column": "id"
        },
        {
          "table_name": "etablissements",
          "column_name": "owner_user_id",
          "referenced_table": "users",
          "referenced_column": "id"
        },
        {
          "table_name": "payments",
          "column_name": "student_id",
          "referenced_table": "students",
          "referenced_column": "id"
        },
        {
          "table_name": "schedule_classes",
          "column_name": "class_id",
          "referenced_table": "classes",
          "referenced_column": "id"
        },
        {
          "table_name": "students",
          "column_name": "classe_id",
          "referenced_table": "classes",
          "referenced_column": "id"
        },
        {
          "table_name": "user_etablissements",
          "column_name": "user_id",
          "referenced_table": "users",
          "referenced_column": "id"
        },
        {
          "table_name": "user_etablissements",
          "column_name": "etablissement_id",
          "referenced_table": "etablissements",
          "referenced_column": "id"
        }
      ],
      "rls_policies": [
        {
          "cmd": "SELECT",
          "qual": "is_member_of_establishment(etablissement_id)",
          "roles": [
            "authenticated"
          ],
          "tablename": "classes",
          "permissive": "PERMISSIVE",
          "policyname": "Members can view classes",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "INSERT",
          "qual": null,
          "roles": [
            "authenticated"
          ],
          "tablename": "classes",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can create classes",
          "schemaname": "public",
          "with_check": "(user_role_in_establishment(etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))"
        },
        {
          "cmd": "DELETE",
          "qual": "(user_role_in_establishment(etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))",
          "roles": [
            "authenticated"
          ],
          "tablename": "classes",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can delete classes",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "UPDATE",
          "qual": "(user_role_in_establishment(etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))",
          "roles": [
            "authenticated"
          ],
          "tablename": "classes",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can update classes",
          "schemaname": "public",
          "with_check": "(user_role_in_establishment(etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))"
        },
        {
          "cmd": "SELECT",
          "qual": "is_member_of_establishment(id)",
          "roles": [
            "authenticated"
          ],
          "tablename": "etablissements",
          "permissive": "PERMISSIVE",
          "policyname": "Members can view their establishments",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "UPDATE",
          "qual": "(user_role_in_establishment(id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))",
          "roles": [
            "authenticated"
          ],
          "tablename": "etablissements",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can update establishments",
          "schemaname": "public",
          "with_check": "(user_role_in_establishment(id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))"
        },
        {
          "cmd": "INSERT",
          "qual": null,
          "roles": [
            "authenticated"
          ],
          "tablename": "payments",
          "permissive": "PERMISSIVE",
          "policyname": "Collaborators can create payments",
          "schemaname": "public",
          "with_check": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))"
        },
        {
          "cmd": "UPDATE",
          "qual": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "payments",
          "permissive": "PERMISSIVE",
          "policyname": "Collaborators can update payments",
          "schemaname": "public",
          "with_check": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))"
        },
        {
          "cmd": "SELECT",
          "qual": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND is_member_of_establishment(c.etablissement_id))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "payments",
          "permissive": "PERMISSIVE",
          "policyname": "Members can view payments",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "DELETE",
          "qual": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "payments",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can delete payments",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "SELECT",
          "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND is_member_of_establishment(c.etablissement_id))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "schedule_classes",
          "permissive": "PERMISSIVE",
          "policyname": "Members can view schedules",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "INSERT",
          "qual": null,
          "roles": [
            "authenticated"
          ],
          "tablename": "schedule_classes",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can create schedules",
          "schemaname": "public",
          "with_check": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))"
        },
        {
          "cmd": "DELETE",
          "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "schedule_classes",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can delete schedules",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "UPDATE",
          "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "schedule_classes",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can update schedules",
          "schemaname": "public",
          "with_check": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))"
        },
        {
          "cmd": "INSERT",
          "qual": null,
          "roles": [
            "authenticated"
          ],
          "tablename": "students",
          "permissive": "PERMISSIVE",
          "policyname": "Collaborators can create students",
          "schemaname": "public",
          "with_check": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))"
        },
        {
          "cmd": "UPDATE",
          "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "students",
          "permissive": "PERMISSIVE",
          "policyname": "Collaborators can update students",
          "schemaname": "public",
          "with_check": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))"
        },
        {
          "cmd": "SELECT",
          "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND is_member_of_establishment(c.etablissement_id))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "students",
          "permissive": "PERMISSIVE",
          "policyname": "Members can view students",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "DELETE",
          "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))",
          "roles": [
            "authenticated"
          ],
          "tablename": "students",
          "permissive": "PERMISSIVE",
          "policyname": "Owners and admins can delete students",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "SELECT",
          "qual": "(user_id = current_user_id())",
          "roles": [
            "authenticated"
          ],
          "tablename": "user_etablissements",
          "permissive": "PERMISSIVE",
          "policyname": "Users can view their own establishment memberships",
          "schemaname": "public",
          "with_check": null
        },
        {
          "cmd": "UPDATE",
          "qual": "(auth_user_id = auth.uid())",
          "roles": [
            "authenticated"
          ],
          "tablename": "users",
          "permissive": "PERMISSIVE",
          "policyname": "Users can update their own profile",
          "schemaname": "public",
          "with_check": "(auth_user_id = auth.uid())"
        },
        {
          "cmd": "SELECT",
          "qual": "(auth_user_id = auth.uid())",
          "roles": [
            "authenticated"
          ],
          "tablename": "users",
          "permissive": "PERMISSIVE",
          "policyname": "Users can view their own profile",
          "schemaname": "public",
          "with_check": null
        }
      ]
    }
  }
]


