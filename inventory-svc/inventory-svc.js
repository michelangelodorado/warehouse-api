const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

// PostgreSQL database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'warehouse_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Endpoint to get all items in the inventory from the database
app.get('/api/warehouse/inventory', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items');
    res.json(rows);
  } catch (err) {
    console.error('Error querying database:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to add an item to the inventory in the database
app.post('/api/warehouse/inventory/add', async (req, res) => {
  const newItem = req.body;
  const { name, price, quantity } = newItem;

  try {
    await pool.query('INSERT INTO items (name, price, quantity) VALUES ($1, $2, $3)', [name, price, quantity]);
    res.status(201).json({ message: 'Item added to inventory', newItem });
  } catch (err) {
    console.error('Error inserting into database:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to delete an item from the inventory in the database by ID
app.delete('/api/warehouse/inventory/delete/:id', async (req, res) => {
  const idToDelete = parseInt(req.params.id);

  try {
    const result = await pool.query('DELETE FROM items WHERE id = $1', [idToDelete]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Item not found in inventory' });
    } else {
      res.json({ message: 'Item deleted from inventory', deletedItemId: idToDelete });
    }
  } catch (err) {
    console.error('Error deleting from database:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update an item in the inventory in the database by ID
app.put('/api/warehouse/inventory/update/:id', async (req, res) => {
  const idToUpdate = parseInt(req.params.id);
  const updatedItem = req.body;
  const { name, price, quantity } = updatedItem;

  try {
    const result = await pool.query('UPDATE items SET name = $1, price = $2, quantity = $3 WHERE id = $4', [name, price, quantity, idToUpdate]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Item not found in inventory' });
    } else {
      res.json({ message: 'Item updated in inventory', updatedItem });
    }
  } catch (err) {
    console.error('Error updating database:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

