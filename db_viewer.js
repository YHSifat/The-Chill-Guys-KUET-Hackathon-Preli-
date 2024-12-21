// db-viewer.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('recipe_management.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to database');
});

// View all ingredients
function viewIngredients() {
    console.log('\nIngredients:');
    console.log('------------');
    db.all('SELECT * FROM ingredients', [], (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.table(rows);
        viewRecipes(); // Chain to view recipes next
    });
}

// View all recipes
function viewRecipes() {
    console.log('\nRecipes:');
    console.log('--------');
    db.all('SELECT * FROM recipes', [], (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.table(rows);
        db.close(); // Close connection when done
    });
}

// Start viewing data
viewIngredients();