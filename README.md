# Recipe.collab

Currently a temporary name, recipe.collab is a work-in-progress recipe site that lets you collaboratively build recipes by cloning others and collaboratively working on them. Built with the PERN stack, in its final form it will be a fullstack application serving users.



> ⚠️ At the moment Recipe.collab is very early in development there is not much documentation as it is not in a running state. This readme will be updated as progress is made.


## Installation 

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
