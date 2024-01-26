

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(24) NOT NULL UNIQUE,
    password VARCHAR(80) NOT NULL,
    email VARCHAR(60) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_name VARCHAR(24) NOT NULL,
    last_name VARCHAR(24) NOT NULL,
    bio VARCHAR(200),
    profile_pic VARCHAR(200),
    is_admin BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_follows (
    follow_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    follower_id INT REFERENCES users(user_id)
);



CREATE TABLE IF NOT EXISTS recipes (
    recipe_id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    user_id INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image VARCHAR(200),
    tags text[],
    preparation_time INTERVAL NOT NULL,
    cooking_time INTERVAL NOT NULL,
    servings INT NOT NULL,
    difficulty_level VARCHAR(24) NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_tags (
    tag_id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(recipe_id),
    tag VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS lists (
    list_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS list_recipes (
    list_recipe_id SERIAL PRIMARY KEY,
    list_id INT REFERENCES lists(list_id),
    recipe_id INT REFERENCES recipes(recipe_id),
    UNIQUE(list_id, recipe_id)

);

CREATE TABLE IF NOT EXISTS user_stars (
    starred_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    recipe_id INT REFERENCES recipes(recipe_id)
);

CREATE TABLE IF NOT EXISTS user_comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    recipe_id INT REFERENCES recipes(recipe_id),
    reply_to INT REFERENCES user_comments(comment_id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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



CREATE TABLE IF NOT EXISTS recipe_versions (
    version_id SERIAL PRIMARY KEY,
    original_recipe_id INT REFERENCES recipes(recipe_id),
    version_number INT NOT NULL,
    recipe_id INT REFERENCES recipes(recipe_id),
    has_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_carts (
    cart_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    recipe_id INT REFERENCES recipes(recipe_id),
    UNIQUE(user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS recipe_views (
    view_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) NOT NULL,
    recipe_id INT REFERENCES recipes(recipe_id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);


CREATE TABLE IF NOT EXISTS recipe_ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    recipe_id INT REFERENCES recipes(recipe_id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

