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

// Function to validate item ID as an integer
function validateItemId(id) {
  const itemId = parseInt(id);
  if (isNaN(itemId)) {
    throw new Error('Invalid item ID');
  }
  return itemId;
}

// Endpoint to get all items in the inventory
app.get('/api/warehouse/inventory', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, quantity FROM items');
    res.json(rows);
  } catch (err) {
    console.error('Error querying database:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get a specific item by ID
app.get('/api/warehouse/inventory/:id', async (req, res) => {
  try {
    const itemId = validateItemId(req.params.id);

    const { rows } = await pool.query('SELECT id, name, quantity FROM items WHERE id = $1', [itemId]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Item not found in inventory' });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error('Error querying database:', err.message);
    res.status(400).json({ error: err.message }); // Return a 400 Bad Request for validation errors
  }
});

// Endpoint to delete an item from the inventory by ID
app.delete('/api/warehouse/inventory/:id', async (req, res) => {
  try {
    const itemId = validateItemId(req.params.id);

    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING id, name, quantity', [itemId]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Item not found in inventory' });
    } else {
      const deletedItem = result.rows[0];
      res.json({ message: 'Item deleted from inventory', deletedItem });
    }
  } catch (err) {
    console.error('Error deleting from database:', err.message);
    res.status(400).json({ error: err.message }); // Return a 400 Bad Request for validation errors
  }
});

// Endpoint to add a new item to the inventory after checking if it already exists
app.post('/api/warehouse/inventory', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const price = 0; // Default price of zero

    // Check if the item already exists in the database
    const checkResult = await pool.query('SELECT id FROM items WHERE name = $1', [name]);
    if (checkResult.rows.length > 0) {
      res.status(400).json({ error: 'Item already exists in inventory' });
      return; // Exit the function early if the item already exists
    }

    // Add the item to the inventory if it doesn't exist
    const result = await pool.query('INSERT INTO items (name, price, quantity) VALUES ($1, $2, $3) RETURNING id, name, quantity', [name, price, quantity]);
    const addedItem = result.rows[0];
    res.status(201).json({ message: 'Item added to inventory', newItem: addedItem });
  } catch (err) {
    console.error('Error inserting into database:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update the quantity of an item in the inventory by ID
app.put('/api/warehouse/inventory/:id', async (req, res) => {
  try {
    const itemId = validateItemId(req.params.id);
    const { quantity } = req.body;
    
    const result = await pool.query('UPDATE items SET quantity = $1 WHERE id = $2 RETURNING id, name, quantity', [quantity, itemId]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Item not found in inventory' });
    } else {
      const updatedItem = result.rows[0];
      res.json({ message: 'Item quantity updated in inventory', updatedItem });
    }
  } catch (err) {
    console.error('Error updating quantity in database:', err.message);
    res.status(400).json({ error: err.message }); // Return a 400 Bad Request for validation errors
  }
});

// Wildcard route to catch unmatched routes
app.all('/api/warehouse/inventory/*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Inventory Service is running on port ${PORT}`);
});

