[
  {
    "schemaname": "public",
    "tablename": "classes",
    "policyname": "Members can view classes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "is_member_of_establishment(etablissement_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "policyname": "Owners and admins can create classes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(user_role_in_establishment(etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))"
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "policyname": "Owners and admins can delete classes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "(user_role_in_establishment(etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "classes",
    "policyname": "Owners and admins can update classes",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(user_role_in_establishment(etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))",
    "with_check": "(user_role_in_establishment(etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))"
  },
  {
    "schemaname": "public",
    "tablename": "etablissements",
    "policyname": "Members can view their establishments",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "is_member_of_establishment(id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "etablissements",
    "policyname": "Owners and admins can update establishments",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(user_role_in_establishment(id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))",
    "with_check": "(user_role_in_establishment(id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role]))"
  },
  {
    "schemaname": "public",
    "tablename": "payments",
    "policyname": "Collaborators can create payments",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))"
  },
  {
    "schemaname": "public",
    "tablename": "payments",
    "policyname": "Collaborators can update payments",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))",
    "with_check": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))"
  },
  {
    "schemaname": "public",
    "tablename": "payments",
    "policyname": "Members can view payments",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND is_member_of_establishment(c.etablissement_id))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "payments",
    "policyname": "Owners and admins can delete payments",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "(EXISTS ( SELECT 1\n   FROM (students s\n     JOIN classes c ON ((c.id = s.classe_id)))\n  WHERE ((s.id = payments.student_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "schedule_classes",
    "policyname": "Members can view schedules",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND is_member_of_establishment(c.etablissement_id))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "schedule_classes",
    "policyname": "Owners and admins can create schedules",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))"
  },
  {
    "schemaname": "public",
    "tablename": "schedule_classes",
    "policyname": "Owners and admins can delete schedules",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "schedule_classes",
    "policyname": "Owners and admins can update schedules",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))",
    "with_check": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = schedule_classes.class_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "policyname": "Collaborators can create students",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "policyname": "Collaborators can update students",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))",
    "with_check": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role, 'SECRETARY'::establishment_role])))))"
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "policyname": "Members can view students",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND is_member_of_establishment(c.etablissement_id))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "students",
    "policyname": "Owners and admins can delete students",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "(EXISTS ( SELECT 1\n   FROM classes c\n  WHERE ((c.id = students.classe_id) AND (user_role_in_establishment(c.etablissement_id) = ANY (ARRAY['OWNER'::establishment_role, 'ADMIN'::establishment_role])))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_etablissements",
    "policyname": "Users can view their own establishment memberships",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(user_id = current_user_id())",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Users can update their own profile",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(auth_user_id = auth.uid())",
    "with_check": "(auth_user_id = auth.uid())"
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Users can view their own profile",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(auth_user_id = auth.uid())",
    "with_check": null
  }
]