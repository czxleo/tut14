# Tutorial 14: PostgreSQL Books CRUD application

This app demonstrates listing, creating, updating, and deleting book records with Express, EJS, and PostgreSQL.

## Set up the database

1. Create or choose a Neon PostgreSQL database.
2. Run setup.sql in the Neon SQL Editor or with psql.
3. Replace the value in .env with your Neon connection string. Keep the variable name DATABASE_URL.
4. Install dependencies and start the app:

    npm install
    npm start

Open http://localhost:3000, then choose Books.

The .env file is ignored by Git. Add your actual connection string to .env before creating the Canvas ZIP, and include that file in the ZIP. Do not commit the connection string to GitHub.
