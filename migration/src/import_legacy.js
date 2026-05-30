import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function importLegacy() {
  const sqlFilePath = 'd:/STAGEBACHELOR/scratch_eval/publications/devstter_congres_ampic.sql';
  console.log(`Reading SQL file: ${sqlFilePath}...`);
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  console.log("Connecting to MySQL to create database if not exists...");
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root'
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS `congres_ampic` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  console.log("Database `congres_ampic` created/verified.");
  await connection.end();

  console.log("Connecting directly to `congres_ampic` database...");
  const dbConnection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'congres_ampic',
    multipleStatements: true
  });

  console.log("Executing SQL script...");
  await dbConnection.query(sql);
  console.log("SQL script executed successfully!");

  const [tables] = await dbConnection.query('SHOW TABLES');
  console.log("Tables in `congres_ampic`:", tables.map(r => Object.values(r)[0]));

  await dbConnection.end();
}

importLegacy().catch(console.error);
