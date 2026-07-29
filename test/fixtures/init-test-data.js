// Test data initialization script
db = db.getSiblingDB("test");
db.createCollection("users");
db.users.insertMany([
  {_id: 1, name: "Alice", age: 30, email: "alice@example.com"},
  {_id: 2, name: "Bob", age: 25, email: "bob@example.com"},
  {_id: 3, name: "Charlie", age: 35, email: "charlie@example.com"},
  {_id: 4, name: "David", age: 40, email: "david@example.com"}
]);

db.createCollection("products");
db.products.insertMany([
  {_id: 1, name: "Laptop", price: 1000, in_stock: true},
  {_id: 2, name: "Phone", price: 500, in_stock: false},
  {_id: 3, name: "Tablet", price: 750, in_stock: true}
]);

print("Test fixtures loaded successfully");
