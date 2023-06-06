const mysql = require('mysql');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"",
    database:"sampah_erd3",
    charset: "utf8mb4",
    timezone: "+00:00"
});

db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('DB Connection');
});

module.exports = db;