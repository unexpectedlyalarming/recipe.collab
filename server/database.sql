CREATE DATABASE IF NOT EXISTS recipecollabdb;

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    bio VARCHAR(200) NOT NULL,
    profile_pic VARCHAR(200),
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_stars (
    starred_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    recipe_id INT REFERENCES recipes(recipe_id),
);

CREATE TABLE IF NOT EXISTS user_comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    recipe_id INT REFERENCES recipes(recipe_id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE IF NOT EXISTS recipes (
    recipe_id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description TEXT,
    user_id INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image VARCHAR(200),
    tags VARCHAR[],
    preparation_time INTERVAL,
    cooking_time INTERVAL,
    servings INT,
    difficulty_level VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(recipe_id),
    name VARCHAR(80) NOT NULL,
    quantity NUMERIC NOT NULL,
    unit VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS instructions (
    instruction_id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(recipe_id),
    step_number INT NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS recipe_interactions (
    interaction_id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(recipe_id),
    user_id INT REFERENCES users(user_id),
    interaction_type VARCHAR(20) NOT NULL, -- 'star', 'comment', 'fork'
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS recipe_version (
    version_id SERIAL PRIMARY KEY,
    original_recipe_id INT REFERENCES recipes(recipe_id),
    version_number INT NOT NULL
    recipe_id INT REFERENCES recipes(recipe_id),
);

