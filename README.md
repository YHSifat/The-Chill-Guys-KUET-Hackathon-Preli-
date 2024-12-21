# The-Chill-Guys-KUET-Hackathon-Preli-



how to use

# Add an ingredient
curl -X POST http://localhost:3000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{"name": "flour", "quantity": 200, "unit": "grams"}'

# Update an ingredient (flour)
curl -X PUT http://localhost:3000/api/ingredients/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "flour", "quantity": 400, "unit": "grams"}'

# Add an ingredient (eggs)
curl -X POST http://localhost:3000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{"name": "eggs", "quantity": 3, "unit": "grams"}'

# Add an ingredient (baking-soda)
curl -X POST http://localhost:3000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{"name": "baking-soda", "quantity": 200, "unit": "grams"}'


# Delete ingridient(Optional)
curl -X DELETE http://localhost:3000/api/ingredients/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "flour", "quantity": 400, "unit": "grams"}'



# Checking the sqlite3 db
node db_viewer.js


# Add a recipe
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"name": "Chocolate Cake", "instructions": "Mix and bake", "ingredients": "flour, sugar, cocoa", "tags": "dessert,sweet"}'



# Upload a recipe image
## You can also run the `test.html` file to upload data
curl -X POST http://localhost:3000/api/recipes/upload \
  -F "image=@/path/to/your/recipe-image.jpg"

# Retrieve a recipe with its image
curl http://localhost:3000/api/recipes/1

# Chat with the recipe bot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "I want to make something sweet today"}'