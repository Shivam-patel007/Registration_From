-- The student.course column uses a PostgreSQL enum called course_type.
-- Currently only BCA may exist. Add BBA so the registration form can save BBA students.

ALTER TYPE course_type ADD VALUE IF NOT EXISTS 'BBA';
