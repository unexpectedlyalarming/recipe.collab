# Recipe.collab

Currently a temporary name, recipe.collab is a work-in-progress recipe site thats goal is to streamline recipe sharing and add collaborative tools to perfect recipes. Built with the PERN stack, its final form will be a fullstack application serving chefs all over the world.



> ⚠️ At the moment Recipe.collab is early in development there is not much documentation as it is not finished. This readme will be updated as progress is made.


# Table of contents

1. [Installation](#installation)
2. [Features](#features)
3. [License](#license)


# Installation 

### Server

> Prerequisites: Node and npm, postgreSQL, only 16 and higher have been tested.

It is HIGHLY recommended to check the server and db files for environmental variables and to set a .env first. By default, the server goes to the dev environment, so if you run the setup multiple times it may prompt to delete your DB.

There are also variables for your database, secret keys, etc.

Currently only the API has been developed. To run it clone the repo and do the following:


```bash
cd recipe.collab
cd server

# If you want to seed for a development environment

npm run seed

# If you want to just set it up with no seeding

npm run setup

# To run integration tests

npm run test

# To start the server in dev mode

npm run dev

# To start the server in production

npm run start
```

### Client

> Prerequisites: Node and npm.

Add a .env file and set VITE_APP_SERVER_URL to it with your server url

```bash
cd client
npm i
npm run dev
```

# Features

### Full fledged recipe editor
No more markdown or janky outdated editor. Just a simple editor that makes it hard to format the recipe wrong.

### Recipe forking
A key feature, forking (like in Git) lets you copy and modify a recipe for yourself. May the best recipe win.

### Carts
Carts let you save recipes for your next meal plan. In the current roadmap, the cart will calculate and aggregate measurements, saving you time when planning your meals.

### Various user features
Along with these, you can expect plenty of useful features like filtering by tags; stars, comments, lists, etc.


# License

This project is licensed under the terms of the [MIT license.](https://opensource.org/license/mit/)

