-- Drop old document_departments table
DROP TABLE IF EXISTS document_departments;

-- Add department_id column to documents table
ALTER TABLE documents
ADD COLUMN department_id BIGINT;

-- Update the department_id based on the old department name
UPDATE documents d
SET department_id = (
    SELECT id FROM departments dp 
    WHERE dp.name = d.department
    LIMIT 1
);

-- Make department_id NOT NULL and add foreign key
ALTER TABLE documents
ALTER COLUMN department_id SET NOT NULL,
ADD CONSTRAINT fk_document_department
FOREIGN KEY (department_id)
REFERENCES departments(id);

-- Drop old department column
ALTER TABLE documents
DROP COLUMN department;