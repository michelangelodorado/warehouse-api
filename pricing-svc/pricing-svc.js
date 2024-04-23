const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = 3001;

// PostgreSQL database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'warehouse_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Endpoint to get the price of an item by ID
app.get('/api/warehouse/pricing/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const { rows } = await pool.query('SELECT price FROM items WHERE id = $1', [itemId]);
    if (rows.length > 0) {
      res.json({ price: rows[0].price });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error('Error querying database:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to list all item pricing
app.get('/api/warehouse/pricing', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, price FROM items');
    res.json(rows);
  } catch (err) {
    console.error('Error querying database:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/warehouse/pricing/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { price } = req.body;

    const result = await pool.query('UPDATE items SET price = $1 WHERE id = $2 RETURNING id, name, price', [price, itemId]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Item not found' });
    } else {
      const updatedItem = result.rows[0];
      res.json({ message: 'Price updated successfully', updatedItem });
    }
  } catch (err) {
    console.error('Error updating price in database:', err.message);
    res.status(400).json({ error: err.message }); // Return a 400 Bad Request for validation errors
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Pricing service is running on port ${port}`);
});

