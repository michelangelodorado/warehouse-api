const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Determine the database file path based on the environment or use a default path
const dbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'shared/database/inventory.db');

// Connect to the SQLite database
const db = new sqlite3.Database(dbFilePath, sqlite3.OPEN_READWRITE, err => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Endpoint to get pricing information for an item by ID
app.get('/api/warehouse/pricing/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const sql = 'SELECT * FROM items WHERE id = ?';

  db.get(sql, [itemId], (err, row) => {
    if (err) {
      console.error('Error querying database:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ message: 'Item not found' });
    } else {
      // Return pricing information (assuming price is part of the item)
      res.json({ itemId: row.id, itemName: row.name, itemPrice: row.price });
    }
  });
});

// Endpoint to update the price of an item by ID
app.put('/api/warehouse/pricing/update/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const updatedPrice = req.body.price;

  const sql = 'UPDATE items SET price = ? WHERE id = ?';
  const params = [updatedPrice, itemId];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error updating price in database:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else if (this.changes === 0) {
      res.status(404).json({ message: 'Item not found or price unchanged' });
    } else {
      res.json({ message: 'Price updated for item', itemId, updatedPrice });
    }
  });
});

// Start the server
const PORT = 3001; // Adjust the port as needed
app.listen(PORT, () => {
  console.log(`Pricing service is running on port ${PORT}`);
});

// Close the database connection when the application stops running
process.on('exit', () => {
  db.close();
  console.log('Database connection closed');
});
