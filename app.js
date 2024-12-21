const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


const geminiAPIKey = process.env.GEMINI_API_KEY;


// Initialize Gemini
const genAI = new GoogleGenerativeAI(geminiAPIKey);
const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper function to convert image to base64
function fileToGenerativePart(path, mimeType) {
    const fileData = fs.readFileSync(path);
    return {
        inlineData: {
            data: fileData.toString('base64'),
            mimeType
        }
    };
}

// Database Setup
const db = new sqlite3.Database('recipe_management.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to database');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Create ingredients table
        db.run(`
            CREATE TABLE IF NOT EXISTS ingredients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                quantity FLOAT,
                unit TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create recipes table with image support
        db.run(`
            CREATE TABLE IF NOT EXISTS recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                instructions TEXT,
                ingredients TEXT,
                tags TEXT,
                image_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    });
}

// Ingredient Management Routes
app.post('/api/ingredients', (req, res) => {
    const { name, quantity, unit } = req.body;

    db.run(
        'INSERT INTO ingredients (name, quantity, unit) VALUES (?, ?, ?)',
        [name, quantity, unit],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            console.log('Ingredient added with ID:', this.lastID);
            res.json({
                message: 'Ingredient added successfully',
                id: this.lastID
            });
        }
    );
});

//delete ingredient
app.delete('/api/ingredients/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM ingredients WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('Ingredient deleted with ID:', id);
        res.json({ message: 'Ingredient deleted successfully', changes: this.changes });
    });
});


//update ingredient
app.put('/api/ingredients/:id', (req, res) => {
    const { name, quantity, unit } = req.body;
    const { id } = req.params;

    db.run(
        'UPDATE ingredients SET name = ?, quantity = ?, unit = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [name, quantity, unit, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            console.log('Ingredient updated with ID:', id);
            res.json({
                message: 'Ingredient updated successfully',
                changes: this.changes
            });
        }
    );
});

//get all ingredients
app.get('/api/ingredients', (req, res) => {
    db.all('SELECT * FROM ingredients', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('Ingredients retrieved:');
        res.json(rows);
    });
});

// Recipe Management Routes with Image Support
app.post('/api/recipes', (req, res) => {
    const { name, instructions, ingredients, tags } = req.body;

    db.run(
        'INSERT INTO recipes (name, instructions, ingredients, tags) VALUES (?, ?, ?, ?)',
        [name, instructions, ingredients, tags],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            console.log('Recipe added with Image and ID:', this.lastID);
            res.json({
                message: 'Recipe added successfully',
                id: this.lastID
            });
        }
    );
});

// Recipe Image Upload and Processing
app.post('/api/recipes/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Prepare the image for Gemini
        const imagePart = fileToGenerativePart(
            req.file.path,
            req.file.mimetype
        );

        // Prompt for Gemini to extract recipe information
        const prompt = "Extract the recipe information from this image. Please provide: 1. Recipe name 2. Ingredients list 3. Cooking instructions 4. Any additional notes or tips";

        const result = await visionModel.generateContent([prompt, imagePart]);
        const response = await result.response;
        const recipeInfo = response.text();

        // Parse the recipe information (you might want to add more sophisticated parsing)
        const recipeName = recipeInfo.split('\n')[0] || 'Recipe from Image';

        db.run(
            'INSERT INTO recipes (name, instructions, ingredients, image_path) VALUES (?, ?, ?, ?)',
            [recipeName, recipeInfo, 'Extracted from image', req.file.path],
            function (err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: err.message });
                }
                console.log('Recipe with image processed and stored with ID:', this.lastID);
                res.json({
                    message: 'Recipe processed and stored successfully',
                    recipeId: this.lastID,
                    extractedInfo: recipeInfo
                });
            }
        );

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all recipes
app.get('/api/recipes', (req, res) => {
    db.all('SELECT * FROM recipes', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Add image data if available
        rows = rows.map(row => {
            if (row.image_path && fs.existsSync(row.image_path)) {
                row.image_data = fs.readFileSync(row.image_path).toString('base64');
            }
            return row;
        });

        res.json(rows);
    });
});


// Get a specific recipe
app.get('/api/recipes/:id', (req, res) => {
    db.get('SELECT * FROM recipes WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(404).json({ error: 'Recipe not found' });
            return;
        }

        if (row.image_path && fs.existsSync(row.image_path)) {
            row.image_data = fs.readFileSync(row.image_path).toString('base64');
        }
        console.log('Recipe retrieved with ID:', req.params.id);
        res.json(row);
    });
});

// Chatbot Route
app.post('/api/chat', async (req, res) => {
    try {
        const { query } = req.body;

        // Get available ingredients
        const ingredients = await new Promise((resolve, reject) => {
            db.all('SELECT name FROM ingredients', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows.map(row => row.name));
            });
        });

        // Get stored recipes
        const recipes = await new Promise((resolve, reject) => {
            db.all('SELECT name, ingredients, instructions FROM recipes', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        // Prepare context for Gemini
        const context = `
            Available ingredients: ${ingredients.join(', ')}
            User query: ${query}
            
            Based on the available ingredients and stored recipes, suggest appropriate recipes.
            If no exact matches are found, suggest alternatives or modifications.
        `;

        const result = await textModel.generateContent(context);
        const response = await result.response;

        res.json({ response: response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Clean up database connection on exit
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit();
    });
});