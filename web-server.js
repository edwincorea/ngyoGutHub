var express     = require("express")
    , mongoose  = require('mongoose')
    , http      = require("http")
    , app       = express()
    , port      = parseInt(process.env.PORT, 10) || 8080;

app.configure(function(){
  app.use(express.static(__dirname + '/app'));
  app.use(express.logger('dev')); 				        // log every request to the console
  app.use(express.urlencoded());
  app.use(express.methodOverride()); 				        // simulate DELETE and PUT
  app.use(express.bodyParser());
  app.use(app.router);
});

mongoose.connect('mongodb://localhost/guthub');

//=============Recipe Model=============
// define schema =================
var ingredientSchema = new mongoose.Schema({
    amount: Number,
    amountUnits: String,
    ingredientName: String
});

var recipeSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    ingredients: [ingredientSchema],
    instructions: String
});

// Compile a 'Recipe' model using the recipeSchema as the structure.
// Mongoose also creates a MongoDB collection called 'Recipes' for these documents.

var Ingredient = mongoose.model('Recipe', recipeSchema);
var Recipe = mongoose.model('Recipe', recipeSchema);

mongoose.connection.collections['recipes'].drop( function(err) {
    console.log('collection dropped');
});

var recipe = new Recipe({
    id: 1,
    title: "Cookies",
    description: "Delicious, crisp on the outside, chewy on the outside, oozing with chocolatey goodness cookies. The best kind",
    ingredients: [
        {
            amount: 1,
            amountUnits: "packet",
            ingredientName: "Chips Ahoy"
        }
    ],
    "instructions": "1. Go buy a packet of Chips Ahoy\n2. Heat it up in an oven\n3. Enjoy warm cookies\n4. Learn how to bake cookies from somewhere else"
});
recipe.save(function (err) {
    if (err) return handleError(err);
    // saved!
});

recipe = new Recipe({
    id: 2,
    title: 'Recipe 2',
    description: 'Description 2',
    instructions: 'Instruction 2',
    ingredients: [
        {amount: 13, amountUnits: 'pounds', ingredientName: 'Awesomeness'}
    ],
    instructions: "Just enjoy! :)"
});
recipe.save(function (err) {
    if (err) return handleError(err);
    // saved!
});

/*
var recipes_map = {
  '1': {
    "id": "1",
    "title": "Cookies",
    "description": "Delicious, crisp on the outside, chewy on the outside, oozing with chocolatey goodness cookies. The best kind",
    "ingredients": [
      {
        "amount": "1",
        "amountUnits": "packet",
        "ingredientName": "Chips Ahoy"
      }
    ],
    "instructions": "1. Go buy a packet of Chips Ahoy\n2. Heat it up in an oven\n3. Enjoy warm cookies\n4. Learn how to bake cookies from somewhere else"
  },
  '2': {
    id: 2,
    'title': 'Recipe 2',
    'description': 'Description 2',
    'instructions': 'Instruction 2',
    ingredients: [
      {amount: 13, amountUnits: 'pounds', ingredientName: 'Awesomeness'}
    ]
  }
};
*/
var next_id = -1;

app.get('/recipes', function(req, res) {

  // use mongoose to get all todos in the database
  Recipe.find(function(err, recipes) {
    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
        res.send(err)

    setTimeout(function() {
        res.send(recipes); // return all recipes in JSON format
    }, 500);
  });

  /*
  var recipes = [];

  for (var key in recipes_map) {
    recipes.push(recipes_map[key]);
  }

  // Simulate delay in server
  setTimeout(function() {
    res.send(recipes);
  }, 500);
  */
});

app.get('/recipes/:id', function(req, res) {
  console.log('Requesting recipe with id', req.params.id);
  //res.send(recipes_map[req.params.id]);
  Recipe.findOne({ 'id': req.params.id }, function (err, recipe) {
      if (err) res.send(err);
      res.send(recipe);
  });
});

app.post('/recipes', function(req, res) {
  Recipe.findOne().sort('-id').exec(function(err, item) {
      next_id = item.id;
  });

  Recipe.create({
    id: next_id++,
    title: req.body.title,
    description: req.body.description,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions
  }, function(err, recipe) {
      if (err) res.send(err);
      res.send(recipe);
  });

  /*
  var recipe = {};
  recipe.id = next_id++;
  recipe.title = req.body.title;
  recipe.description = req.body.description;
  recipe.ingredients = req.body.ingredients;
  recipe.instructions = req.body.instructions;

  recipes_map[recipe.id] = recipe;

  res.send(recipe);
  */
});

app.post('/recipes/:id', function(req, res) {
  Recipe.update({
    id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions
  }, function(err, recipe) {
      if (err) res.send(err);
      res.send(recipe);
  });

  /*
  var recipe = {};
  recipe.id = req.params.id;
  recipe.title = req.body.title;
  recipe.description = req.body.description;
  recipe.ingredients = req.body.ingredients;
  recipe.instructions = req.body.instructions;

  recipes_map[recipe.id] = recipe;

  res.send(recipe);
  */
});

module.exports = app;

/*
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
*/