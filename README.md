# The Chill Guys - KUET Hackathon (Preliminary)

Welcome to **The Chill Guys** project repository! This guide will help you interact with the backend APIs of our project, including managing ingredients, recipes, and engaging with a recipe bot. Below are detailed instructions and examples for using the API.

---

## API Endpoints and Usage

### 1. **Ingredients Management**

#### Add an Ingredient
```bash
curl -X POST http://localhost:3000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{"name": "flour", "quantity": 200, "unit": "grams"}'
```

#### Update an Ingredient
```bash
curl -X PUT http://localhost:3000/api/ingredients/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "flour", "quantity": 400, "unit": "grams"}'
```

#### Add Another Ingredient (Example: Eggs)
```bash
curl -X POST http://localhost:3000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{"name": "eggs", "quantity": 3, "unit": "pieces"}'
```

#### Delete an Ingredient (Optional)
```bash
curl -X DELETE http://localhost:3000/api/ingredients/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "flour", "quantity": 400, "unit": "grams"}'
```

#### Check the SQLite3 Database
To view the database contents, run:
```bash
node db_viewer.js
```

---

### 2. **Recipe Management**

#### Add a Recipe
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"name": "Chocolate Cake", "instructions": "Mix and bake", "ingredients": "flour, sugar, cocoa", "tags": "dessert,sweet"}'
```

#### Upload a Recipe Image
You can upload an image for your recipe using the following command:
```bash
curl -X POST http://localhost:3000/api/recipes/upload \
  -F "image=@/path/to/your/recipe-image.jpg"
```
Alternatively, you can use the `test.html` file in the repository for image uploads.

#### Retrieve a Recipe with Its Image
```bash
curl http://localhost:3000/api/recipes/1
```

---

### 3. **Chat with the Recipe Bot**

The recipe bot allows you to get suggestions and ideas for recipes. For example:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "I want to make something sweet today"}'
```

---

## Additional Notes
- Replace `http://localhost:3000` with the appropriate server address if hosted remotely.
- Ensure that the server is running before making any API requests.
- Use `test.html` for a graphical interface to test file uploads.

---

## Dependencies
- **Node.js** for server operations
- **SQLite3** as the database
- **curl** for testing API endpoints

---

## License
This project is licensed under the [MIT License](LICENSE).

---

## Contributors
Special thanks to **The Chill Guys** team for developing this project!
