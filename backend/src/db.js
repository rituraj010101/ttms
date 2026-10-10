const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionConfig = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : {
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'ttms_user',
      password: process.env.MYSQL_PASSWORD || 'ttms_password',
      database: process.env.MYSQL_DATABASE || 'ttms',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
    };

const pool = mysql.createPool(connectionConfig);

module.exports = {
  query: async (text, params = []) => {
    const [rows, fields] = await pool.query(text, params);
    return { rows, fields };
  },
  pool,
};
