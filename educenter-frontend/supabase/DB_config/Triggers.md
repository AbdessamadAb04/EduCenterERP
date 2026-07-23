[
  {
    "trigger_name": "classes_updated_at",
    "event_object_table": "classes",
    "action_timing": "BEFORE",
    "event_manipulation": "UPDATE",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "trigger_name": "etablissements_updated_at",
    "event_object_table": "etablissements",
    "action_timing": "BEFORE",
    "event_manipulation": "UPDATE",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "trigger_name": "payments_updated_at",
    "event_object_table": "payments",
    "action_timing": "BEFORE",
    "event_manipulation": "UPDATE",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "trigger_name": "schedule_events_updated_at",
    "event_object_table": "schedule_classes",
    "action_timing": "BEFORE",
    "event_manipulation": "UPDATE",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "trigger_name": "students_updated_at",
    "event_object_table": "students",
    "action_timing": "BEFORE",
    "event_manipulation": "UPDATE",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()"
  },
  {
    "trigger_name": "users_updated_at",
    "event_object_table": "users",
    "action_timing": "BEFORE",
    "event_manipulation": "UPDATE",
    "action_statement": "EXECUTE FUNCTION update_updated_at_column()"
  }
]