[
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
]