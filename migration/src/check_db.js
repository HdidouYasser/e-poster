import mysql from 'mysql2/promise';

async function checkEposter() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'eposter'
    });
    console.log("Connected to eposter!");
    const [tables] = await connection.query('SHOW TABLES');
    console.log("Tables in eposter:", tables.map(r => Object.values(r)[0]));
    
    for (const t of tables.map(r => Object.values(r)[0])) {
      const [[countRow]] = await connection.query(`SELECT COUNT(*) as count FROM \`${t}\``);
      console.log(`- ${t}: ${countRow.count} rows`);
    }
    await connection.end();
  } catch (err) {
    console.log(`Failed: ${err.message}`);
  }
}

checkEposter();
