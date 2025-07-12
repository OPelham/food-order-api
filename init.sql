-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for ingredient category
CREATE TYPE ingredient_category AS ENUM ('FRESH', 'FROZEN', 'DRY');

-- Create ingredients table with UUID default and enum type
CREATE TABLE ingredients (
     ingredientId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     quantity INTEGER NOT NULL CHECK (quantity >= 0),
     category ingredient_category NOT NULL
);

-- Insert initial data with explicit UUIDs
INSERT INTO ingredients (ingredientId, name, quantity, category)
VALUES
    ('e60c517b-2f86-4ece-bd1a-83191bb34ba4', 'Tomato', 10, 'FRESH'),
    ('fd093f46-b6c6-4cf6-a5c7-40f8a9deecad', 'Frozen Peas', 5, 'FROZEN'),
    (uuid_generate_v4(), 'Onion', 8, 'FRESH');
