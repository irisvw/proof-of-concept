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
  const apiResponse = await fetch(`${prefix}pokemon?limit=1000`);
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

function getEvolutionDetails(evolutionData) {
  let evolutionDetails = [];
  let stageTwoArray = evolutionData.chain.evolves_to;

  stageTwoArray.forEach((evolution) => {
    let pokemon = allPokemon.find((pokemon) => pokemon.name == evolution.species.name);
    evolutionDetails.push({ 
      name: pokemon.name, 
      id: pokemon.data.id, 
      type: pokemon.data.types[0].type.name, 
      sprite: pokemon.data.sprites.other['official-artwork'].front_default,
      evolutions: evolution.evolves_to 
    });
  });

  evolutionDetails.forEach((pokemon) => {
    if (pokemon.evolutions.length > 0) {
      pokemon.evolutions.forEach((evolution) => {
        let pokemon = allPokemon.find((pokemon) => pokemon.name == evolution.species.name);
        evolutionDetails.push({ 
          name: pokemon.name, 
          id: pokemon.data.id, 
          type: pokemon.data.types[0].type.name, 
          sprite: pokemon.data.sprites.other['official-artwork'].front_default,
        });
      })
    }
  });

  return evolutionDetails;
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
    let evolutions = await getEvolutionData(pokemon);
    let evolutionsDetails = await getEvolutionDetails(evolutions);

    res.render('detail.liquid', {
      pokemon: pokemon,
      evolutions: evolutionsDetails
    });
  } else {
    res.render('error.liquid');
  };
});

// PORT
app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`);
});