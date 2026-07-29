// Test data initialization script
// Generates 1000+ rows with edge cases for comprehensive testing

const users = [];
const products = [];

// Generate 500 users with various edge cases
for (let i = 1; i <= 500; i++) {
    users.push({
        _id: i,
        name: `User${i}`,
        age: 20 + (i % 50),
        email: `user${i}@test${(i % 5) + 1}.com`,
        status: i % 3 === 0 ? null : (i % 2 === 0 ? 'active' : 'inactive'),
        tags: i % 4 === 0 ? [`tag${i % 10}`, `tag${(i % 10) + 1}`] : [],
        metadata: i % 5 === 0 ? { created: new Date(Date.now() - i * 86400000), score: i * 1.5 } : null,
        notes: i % 7 === 0 ? `Note with special chars: @#$%^&*()_+{}|[]\\:";'<>,.?/~\`` : null,
        empty_field: i % 10 === 0 ? '' : null,
        nested: i % 8 === 0 ? {
            level1: {
                level2: {
                    value: i * 2
                }
            }
        } : null
    });
}

// Generate 500 products with various edge cases
for (let i = 1; i <= 500; i++) {
    products.push({
        _id: i,
        name: `Product${i}`,
        price: Math.round((10 + (i % 1000)) * 100) / 100,
        in_stock: i % 2 === 0,
        category: `Category${(i - 1) % 10 + 1}`,
        rating: i % 5 === 0 ? null : (i % 3 === 0 ? 0 : Math.round((i % 5 + 1) * 10) / 10),
        tags: i % 6 === 0 ? [`tag${i % 20}`, `tag${(i % 20) + 1}`, `tag${(i % 20) + 2}`] : [],
        metadata: i % 9 === 0 ? { 
            supplier: `Supplier${i % 50 + 1}`,
            last_updated: new Date(Date.now() - i * 3600000) 
        } : null,
        description: i % 11 === 0 ? `Description with unicode: café résumé naïve 日本語 中文 한국어` : null,
        discount: i % 12 === 0 ? 0 : (i % 15 === 0 ? null : Math.round((i % 30) * 100) / 100),
        inventory: i % 13 === 0 ? [] : { warehouse: i, shelf: i % 100 }
    });
}

// Drop and recreate collections to ensure clean state
db = db.getSiblingDB("testdb");
db.users.drop();
db.products.drop();

db.createCollection("users");
db.users.insertMany(users);

db.createCollection("products");
db.products.insertMany(products);

print(`Inserted ${users.length} users and ${products.length} products`);

// Also populate test database for backwards compatibility
db = db.getSiblingDB("test");
db.users.drop();
db.products.drop();

db.createCollection("users");
db.users.insertMany(users.slice(0, 100));

db.createCollection("products");
db.products.insertMany(products.slice(0, 100));

print(`Inserted ${users.slice(0, 100).length} users and ${products.slice(0, 100).length} products into test database`);

// Populate sourcedb and targetdb for cross-database comparison testing
db = db.getSiblingDB("sourcedb");
db.users.drop();
db.createCollection("users");
db.users.insertMany(users);

db = db.getSiblingDB("targetdb");
db.users.drop();
db.createCollection("users");
db.users.insertMany(users.slice(0, 400).concat([
    {_id: 401, name: "ExtraUser1", age: 25, email: "extra1@test.com"},
    {_id: 402, name: "ExtraUser2", age: 30, email: "extra2@test.com"},
    {_id: 403, name: "ExtraUser3", age: 35, email: "extra3@test.com"}
]));

print("Test fixtures loaded successfully");
print(`Total users: ${db.getSiblingDB("sourcedb").users.countDocuments()}`);
print(`Target users: ${db.getSiblingDB("targetdb").users.countDocuments()}`);
