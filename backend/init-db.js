const { Client } = require('pg');
require('dotenv').config();

const initDb = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();

    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (res.rowCount > 0) {
      console.log(`Database "${process.env.DB_NAME}" already exists`);
    } else {
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database "${process.env.DB_NAME}" created`);
    }
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

initDb();
