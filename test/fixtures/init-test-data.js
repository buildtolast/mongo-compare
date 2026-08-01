// Test data initialization script
// Generates test data across many collections, with deliberate
// created/updated/deleted deltas between sourcedb and targetdb so a
// comparison run always exercises all three diff categories per collection.

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

// ---------------------------------------------------------------------
// sourcedb / targetdb: 10 collections, each with a deliberate delta so
// running a comparison across all of them always shows created, updated
// AND deleted documents per collection (not just for "users").
// ---------------------------------------------------------------------

const COLLECTION_SPECS = [
    { name: 'users', count: 30, gen: mkUser },
    { name: 'products', count: 25, gen: mkProduct },
    { name: 'orders', count: 20, gen: mkOrder },
    { name: 'order_items', count: 25, gen: mkOrderItem },
    { name: 'sessions', count: 15, gen: mkSession },
    { name: 'inventory', count: 15, gen: mkInventory },
    { name: 'reviews', count: 20, gen: mkReview },
    { name: 'categories', count: 12, gen: mkCategory },
    { name: 'coupons', count: 10, gen: mkCoupon },
    { name: 'shipments', count: 18, gen: mkShipment },
];

function mkUser(i) {
    return { _id: i, name: `User${i}`, age: 20 + (i % 50), email: `user${i}@example.com`, status: i % 2 === 0 ? 'active' : 'inactive' };
}
function mkProduct(i) {
    return { _id: i, name: `Product${i}`, price: Math.round((5 + i * 3.3) * 100) / 100, in_stock: i % 2 === 0, category: `Category${(i % 5) + 1}` };
}
function mkOrder(i) {
    return { _id: i, customer_id: (i % 10) + 1, total: Math.round(i * 12.5 * 100) / 100, status: ['pending', 'shipped', 'delivered'][i % 3] };
}
function mkOrderItem(i) {
    return { _id: i, order_id: (i % 8) + 1, product_id: (i % 12) + 1, quantity: (i % 5) + 1, unit_price: Math.round(i * 2.2 * 100) / 100 };
}
function mkSession(i) {
    return { _id: i, user_id: (i % 15) + 1, started_at: new Date(Date.now() - i * 3600000), duration_secs: i * 37 };
}
function mkInventory(i) {
    return { _id: i, sku: `SKU-${1000 + i}`, warehouse: `WH${(i % 3) + 1}`, quantity: i * 4 };
}
function mkReview(i) {
    return { _id: i, product_id: (i % 12) + 1, rating: (i % 5) + 1, comment: `Review comment number ${i}` };
}
function mkCategory(i) {
    return { _id: i, name: `Category${i}`, parent_id: i > 3 ? (i % 3) + 1 : null };
}
function mkCoupon(i) {
    return { _id: i, code: `SAVE${i}0`, percent_off: (i % 4 + 1) * 10, active: i % 2 === 0 };
}
function mkShipment(i) {
    return { _id: i, order_id: (i % 10) + 1, carrier: ['UPS', 'FedEx', 'USPS'][i % 3], tracking: `TRK${100000 + i}` };
}

let totalSource = 0;
let totalTarget = 0;
let totalCreated = 0;
let totalUpdated = 0;
let totalDeleted = 0;

db = db.getSiblingDB("sourcedb");
const sdb = db;
db = db.getSiblingDB("targetdb");
const tdb = db;

for (const spec of COLLECTION_SPECS) {
    const sourceDocs = [];
    for (let i = 1; i <= spec.count; i++) {
        sourceDocs.push(spec.gen(i));
    }

    // Target = source minus the last 20% (deleted), first 2 mutated (updated),
    // plus 3 brand-new docs with ids beyond the source range (created).
    const deleteFrom = Math.max(1, Math.floor(spec.count * 0.8));
    const targetDocs = sourceDocs
        .slice(0, deleteFrom)
        .map((doc, idx) => {
            if (idx === 0 || idx === 1) {
                const mutated = { ...doc };
                for (const key of Object.keys(mutated)) {
                    if (key === '_id') continue;
                    if (typeof mutated[key] === 'string') { mutated[key] = mutated[key] + '_updated'; }
                    else if (typeof mutated[key] === 'number') { mutated[key] = mutated[key] + 1000; }
                    else if (typeof mutated[key] === 'boolean') { mutated[key] = !mutated[key]; }
                }
                return mutated;
            }
            return doc;
        });

    for (let i = 0; i < 3; i++) {
        targetDocs.push(spec.gen(spec.count + 1000 + i));
    }

    sdb.getCollection(spec.name).drop();
    sdb.createCollection(spec.name);
    sdb.getCollection(spec.name).insertMany(sourceDocs);

    tdb.getCollection(spec.name).drop();
    tdb.createCollection(spec.name);
    tdb.getCollection(spec.name).insertMany(targetDocs);

    const deleted = sourceDocs.length - deleteFrom;
    const created = 3;
    const updated = 2;

    totalSource += sourceDocs.length;
    totalTarget += targetDocs.length;
    totalCreated += created;
    totalUpdated += updated;
    totalDeleted += deleted;

    print(`  ${spec.name}: source=${sourceDocs.length} target=${targetDocs.length} (created=${created} updated=${updated} deleted=${deleted})`);
}

print(`\nsourcedb/targetdb seeded across ${COLLECTION_SPECS.length} collections`);
print(`Totals: source=${totalSource} target=${totalTarget} created=${totalCreated} updated=${totalUpdated} deleted=${totalDeleted}`);

// Backwards-compat: keep the original large single-collection users fixture
// available too (used by earlier manual testing in this project).
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
    {_id: 403, name: "ExtraUser3", age: 35, email: "extra3@test.com"},
    {_id: 1001, name: "NewUser1", age: 27, email: "newuser1@test.com", status: "active", tags: ["new"], metadata: null, notes: null, empty_field: null, nested: null},
    {_id: 1002, name: "NewUser2", age: 33, email: "newuser2@test.com", status: "inactive", tags: [], metadata: null, notes: null, empty_field: null, nested: null},
    {_id: 1003, name: "NewUser3", age: 41, email: "newuser3@test.com", status: null, tags: ["new", "vip"], metadata: { created: new Date(), score: 99.5 }, notes: null, empty_field: null, nested: null}
]));

print("Test fixtures loaded successfully");
