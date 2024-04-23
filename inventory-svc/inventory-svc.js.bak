const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Sample data for the inventory
let inventory = [
  { id: 1, name: 'Item 1', quantity: 10 },
  { id: 2, name: 'Item 2', quantity: 5 },
  { id: 3, name: 'Item 3', quantity: 15 },
  // Add more items as needed
];

// Endpoint to get all items in the inventory
app.get('/api/warehouse/inventory', (req, res) => {
  res.json(inventory);
});

// Endpoint to add an item to the inventory
app.post('/api/warehouse/inventory/add', (req, res) => {
  const newItem = req.body; // Assuming the request body contains the new item data
  inventory.push(newItem);
  res.status(201).json({ message: 'Item added to inventory', newItem });
});

// Endpoint to delete an item from the inventory by ID
app.delete('/api/warehouse/inventory/delete/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id);
  const indexToDelete = inventory.findIndex(item => item.id === idToDelete);

  if (indexToDelete !== -1) {
    inventory.splice(indexToDelete, 1);
    res.json({ message: 'Item deleted from inventory', deletedItemId: idToDelete });
  } else {
    res.status(404).json({ message: 'Item not found in inventory' });
  }
});

// Endpoint to update an item in the inventory by ID
app.put('/api/warehouse/inventory/update/:id', (req, res) => {
  const idToUpdate = parseInt(req.params.id);
  const updatedItem = req.body; // Assuming the request body contains the updated item data

  const indexToUpdate = inventory.findIndex(item => item.id === idToUpdate);

  if (indexToUpdate !== -1) {
    inventory[indexToUpdate] = { ...inventory[indexToUpdate], ...updatedItem };
    res.json({ message: 'Item updated in inventory', updatedItem });
  } else {
    res.status(404).json({ message: 'Item not found in inventory' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
