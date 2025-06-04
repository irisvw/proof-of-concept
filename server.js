// SETUP
import express from 'express';
import { Liquid } from 'liquidjs';

const app = express();
const engine = new Liquid();

app.engine('liquid', engine.express());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 8000);
app.set('views', './views');

// VARIABLES
const prefix = "https://pokeapi.co/api/v2/";
const allPokemon = await getAllPokemon();

// FUNCTIONS
async function getAllPokemon() {
  const apiResponse = await fetch(`${prefix}pokemon?limit=15&offset=180`);
  const apiResponseJSON = await apiResponse.json();
  let allPokemon = apiResponseJSON.results;

  await Promise.all(allPokemon.map(async (pokemon) => {
    await getPokemonDetails(pokemon);
  }));

  return allPokemon;
}

async function getPokemonDetails(pokemon) {
  const pokemonResponse = await fetch(pokemon.url);
  const pokemonResponseJSON = await pokemonResponse.json();
  pokemon.data = pokemonResponseJSON;
}

async function getEvolutionData(pokemon) {
  let pokemonSpeciesData = await fetch(`${prefix}pokemon-species/${pokemon.name}`);
  if (pokemonSpeciesData.status == 404) { return {} };

  let pokemonSpeciesDataJSON = await pokemonSpeciesData.json();
  let pokemonEvolutionChainURL = pokemonSpeciesDataJSON.evolution_chain.url;
  let evolutionChainData = await fetch(pokemonEvolutionChainURL);

  return await evolutionChainData.json();
}

// ROUTES
app.get("/", async function (req, res) {
  res.render('index.liquid', {
    allPokemon: allPokemon
  });
});

app.get("/:pokemon", async function (req, res) {
  let pokemon = allPokemon.find((pokemon) => pokemon.name == req.params.pokemon);

  if (pokemon) {
    let evolutions = getEvolutionData(pokemon);

    res.render('detail.liquid', {
      pokemon: pokemon,
      evolution: evolutions
    });
  } else {
    res.render('error.liquid');
  };
});

// PORT
app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`);
});