const express = require('express')
const app = express()
const db = require('./config/db')

app.use(express.json())

// GET - Mendapatkan semua order penjemputan
app.get('/orders', (req, res) => {
  const sql = 'SELECT * FROM Orders';

  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    res.json(results);
  });
});

// POST - Menambahkan order penjemputan baru
app.post('/orders', (req, res) => {
  const { namalimbah, kategori, berat, total, tempatdaurulang, alamatpenjemput, catatan } = req.body;
  const sql = 'INSERT INTO Orders (namalimbah, kategori, berat, total, tempatdaurulang, alamatpenjemput, catatan) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [namalimbah, kategori, berat, total, tempatdaurulang, alamatpenjemput, catatan];

  db.query(sql, values, (err, result) => {
    if (err) {
      throw err;
    }
    res.json({ message: 'Transaksi berhasil diproses, lihat detailnya pada halaman transaksi', id: result.insertId });
  });
});

// GET - Mendapatkan detail order penjemputan berdasarkan ID
app.get('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const sql = 'SELECT * FROM Orders WHERE id = ?';

  db.query(sql, orderId, (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      res.status(404).json({ message: 'Order penjemputan tidak ditemukan' });
    } else {
      res.json(result[0]);
    }
  });
});

// PUT - Memperbarui order penjemputan berdasarkan ID
app.put('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const { namalimbah, kategori, berat, total, tempatdaurulang, alamatpenjemput, catatan } = req.body;
  const sql = 'UPDATE Orders SET namalimbah = ?, kategori = ?, berat = ?, total = ?, tempatdaurulang = ?, alamatpenjemput = ?, catatan = ? WHERE id = ?';
  const values = [namalimbah, kategori, berat, total, tempatdaurulang, alamatpenjemput, catatan, orderId];

  db.query(sql, values, (err) => {
    if (err) {
      throw err;
    }
    res.json({ message: 'Transaksi berhasil diperbarui', id: orderId });
  });
});

// PUT - Menyelesaikan transaksi berdasarkan ID
app.put('/orders/:id/complete', (req, res) => {
  const orderId = req.params.id;
  const { amount, transactionDate } = req.body;

  // Periksa apakah transaksi sudah ada untuk order dengan ID yang sama
  db.query('SELECT * FROM Transactions WHERE order_id = ?', [orderId], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length > 0) {
      // Jika transaksi sudah ada, lakukan pembaruan transaksi yang ada
      const transactionId = results[0].id;
      db.query('UPDATE Transactions SET amount = ?, transaction_date = ? WHERE id = ?', [amount, transactionDate, transactionId], (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Transaksi berhasil diperbarui
        return res.status(200).json({ message: 'Transaction updated successfully' });
      });
    } else {
      // Jika tidak ada transaksi yang ada, buat transaksi baru
      db.query('INSERT INTO Transactions (order_id, amount, transaction_date) VALUES (?, ?, ?)', [orderId, amount, transactionDate], (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Transaksi berhasil dibuat
        return res.status(200).json({ message: 'Transaction created successfully' });
      });
    }
  });
});

// DELETE - Menghapus order penjemputan berdasarkan ID
app.delete('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const sql = 'DELETE FROM Orders WHERE id = ?';

  db.query(sql, orderId, (err) => {
    if (err) {
      throw err;
    }
    res.json({ message: 'Order penjemputan berhasil dihapus', id: orderId });
  });
});

/*app.get('/get-mahasiswa', function (req, res) {
  const queryStr = 'SELECT * FROM mahasiswa WHERE deleted_at IS NULL';
  conn.query(queryStr, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})

app.get('/get-mahasiswa-by-id', function (req, res) {
  const param = req.query;
  const id = param.id;
  const queryStr = 'SELECT * FROM mahasiswa WHERE id = ? AND deleted_at IS NULL';
  const values = [id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      res.error(err.sqlMessage, res);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menampilkan data",
        "data" : results
      });
    }
  })
})



app.post('/store-mahasiswa', function (req, res) {
  const param = req.body;
  const name = param.name;
  const jurusan = param.jurusan;
  const queryStr = 'INSERT INTO mahasiswa (name, jurusan) VALUES (?, ?)';
  const values = [name, jurusan];

  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menyimpan data",
        "data" : null
      });
    }
  })
})

app.post('/update-mahasiswa', function (req, res) {
  const param = req.body;
  const id = param.id;
  const name = param.name;
  const jurusan = param.jurusan;
  const queryStr = 'UPDATE mahasiswa SET name = ?, jurusan = ? WHERE id = ? AND deleted_at IS NULL';
  const values = [name, jurusan, id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses mengubah data",
        "data" : null
      });
    }
  })
})

app.post('/delete-mahasiswa', function (req, res) {
  const param = req.body;
  const id = param.id;
  const queryStr = 'UPDATE mahasiswa SET deleted_at = ? WHERE id = ?';
  const now = new Date();
  const values = [now, id];
  conn.query(queryStr, values, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        "success" : true,
        "message" : "Sukses menghapus data",
        "data" : null
      });
    }
  })
}) */
 
app.listen(3000)