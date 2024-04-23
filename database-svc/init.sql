-- Create the items table
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL
);

-- Insert initial data into the items table
INSERT INTO items (name, price, quantity) VALUES ('Product A', 19.99, 100);
INSERT INTO items (name, price, quantity) VALUES ('Product B', 29.99, 50);
INSERT INTO items (name, price, quantity) VALUES ('Product C', 9.99, 200);

