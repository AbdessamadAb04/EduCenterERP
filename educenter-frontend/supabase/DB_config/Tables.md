[
  {
    "table_name": "classes",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "classes",
    "ordinal_position": 2,
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "classes",
    "ordinal_position": 3,
    "column_name": "subject",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "classes",
    "ordinal_position": 4,
    "column_name": "level",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "classes",
    "ordinal_position": 6,
    "column_name": "teacher",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "classes",
    "ordinal_position": 7,
    "column_name": "max_capacity",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "classes",
    "ordinal_position": 8,
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'ACTIVE'::class_status"
  },
  {
    "table_name": "classes",
    "ordinal_position": 9,
    "column_name": "tarif_amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "classes",
    "ordinal_position": 10,
    "column_name": "tarif_period",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "classes",
    "ordinal_position": 14,
    "column_name": "color",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "classes",
    "ordinal_position": 15,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "classes",
    "ordinal_position": 16,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "classes",
    "ordinal_position": 17,
    "column_name": "etablissement_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 2,
    "column_name": "center_name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 3,
    "column_name": "center_type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 4,
    "column_name": "city",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 5,
    "column_name": "address",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 6,
    "column_name": "phone",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 7,
    "column_name": "secondary_phone",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 8,
    "column_name": "email",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 9,
    "column_name": "website",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 10,
    "column_name": "registration_fee",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": "0"
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 11,
    "column_name": "logo",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 12,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 13,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "etablissements",
    "ordinal_position": 14,
    "column_name": "owner_user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "payments",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "payments",
    "ordinal_position": 2,
    "column_name": "student_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "payments",
    "ordinal_position": 3,
    "column_name": "amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "payments",
    "ordinal_position": 4,
    "column_name": "due_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "payments",
    "ordinal_position": 5,
    "column_name": "payment_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "payments",
    "ordinal_position": 6,
    "column_name": "method",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "payments",
    "ordinal_position": 7,
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'PENDING'::payment_status"
  },
  {
    "table_name": "payments",
    "ordinal_position": 8,
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "payments",
    "ordinal_position": 9,
    "column_name": "days_late",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": "0"
  },
  {
    "table_name": "payments",
    "ordinal_position": 10,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "payments",
    "ordinal_position": 11,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "payments",
    "ordinal_position": 12,
    "column_name": "payment_category",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'TUITION'::payment_category"
  },
  {
    "table_name": "payments",
    "ordinal_position": 13,
    "column_name": "period_start_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "payments",
    "ordinal_position": 14,
    "column_name": "period_end_date",
    "data_type": "date",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "schedule_classes",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "schedule_classes",
    "ordinal_position": 2,
    "column_name": "class_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "schedule_classes",
    "ordinal_position": 6,
    "column_name": "day",
    "data_type": "smallint",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "schedule_classes",
    "ordinal_position": 7,
    "column_name": "start_time",
    "data_type": "time without time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "schedule_classes",
    "ordinal_position": 8,
    "column_name": "end_time",
    "data_type": "time without time zone",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "schedule_classes",
    "ordinal_position": 11,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "schedule_classes",
    "ordinal_position": 12,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "schedule_classes",
    "ordinal_position": 13,
    "column_name": "duration",
    "data_type": "interval",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "students",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "students",
    "ordinal_position": 2,
    "column_name": "full_name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "students",
    "ordinal_position": 3,
    "column_name": "phone",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "students",
    "ordinal_position": 4,
    "column_name": "classe_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "students",
    "ordinal_position": 5,
    "column_name": "enrollment_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "students",
    "ordinal_position": 6,
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'ACTIVE'::student_status"
  },
  {
    "table_name": "students",
    "ordinal_position": 7,
    "column_name": "tuition_fee",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "students",
    "ordinal_position": 8,
    "column_name": "tuition_fee_status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'PENDING'::student_tuition_fee_status"
  },
  {
    "table_name": "students",
    "ordinal_position": 9,
    "column_name": "registration_fee",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "students",
    "ordinal_position": 10,
    "column_name": "registration_fee_paid",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'PENDING'::student_registration_fee_status"
  },
  {
    "table_name": "students",
    "ordinal_position": 11,
    "column_name": "notes",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "students",
    "ordinal_position": 12,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "students",
    "ordinal_position": 13,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "students",
    "ordinal_position": 14,
    "column_name": "email",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "user_etablissements",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "user_etablissements",
    "ordinal_position": 2,
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "user_etablissements",
    "ordinal_position": 3,
    "column_name": "etablissement_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "user_etablissements",
    "ordinal_position": 4,
    "column_name": "role",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "user_etablissements",
    "ordinal_position": 5,
    "column_name": "joined_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "users",
    "ordinal_position": 1,
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "users",
    "ordinal_position": 2,
    "column_name": "auth_user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "users",
    "ordinal_position": 3,
    "column_name": "full_name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "users",
    "ordinal_position": 4,
    "column_name": "email",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "users",
    "ordinal_position": 6,
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "users",
    "ordinal_position": 7,
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  }
]