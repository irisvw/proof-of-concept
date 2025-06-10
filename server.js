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

// const allPokemon = await getAllPokemon();
const allPokemonFile = await readFile('./allPokemon.json', { encoding: 'utf8' });
const allPokemon = JSON.parse(allPokemonFile);

// FUNCTIONS
async function getAllPokemon() {
  const apiResponse = await fetch(`${prefix}pokemon?limit=10000`);
  const apiResponseJSON = await apiResponse.json();
  let allPokemon = apiResponseJSON.results;

  await Promise.all(allPokemon.map(async (pokemon) => {
    await getPokemonDetails(pokemon);
  }));

  writeFile('./allPokemon.json', JSON.stringify(allPokemon), err => {
    if (err) {
      console.error(err);
    } else {
      console.log('file written successfully'); 
    }
  });

  return allPokemon;
};

async function getPokemonDetails(pokemon) {
  const pokemonResponse = await fetch(pokemon.url);
  const pokemonResponseJSON = await pokemonResponse.json();
  // pokemon.data = pokemonResponseJSON;
  pokemon.data = {
    id: pokemonResponseJSON.id,
    baseXP: pokemonResponseJSON.base_experience,
    weight: pokemonResponseJSON.weight,
    height: pokemonResponseJSON.height,
    abilities: pokemonResponseJSON.abilities,
    types: pokemonResponseJSON.types,
    sprite: pokemonResponseJSON.sprites.other['official-artwork'].front_default,
    stats: pokemonResponseJSON.stats,
    evolutionChain: pokemonResponseJSON.species.url
  };
}

async function getEvolutionChain(pokemon) {
  let pokemonSpeciesData = await fetch(`${prefix}pokemon-species/${pokemon.name}`);
  if (pokemonSpeciesData.status == 404) { return {} };

  let pokemonSpeciesDataJSON = await pokemonSpeciesData.json();
  let pokemonEvolutionChainURL = pokemonSpeciesDataJSON.evolution_chain.url;
  let evolutionChainData = await fetch(pokemonEvolutionChainURL);

  return await evolutionChainData.json();
};

function getEvolutionDetails(evolutionData) {
  let evolutionDetails = [];
  
  // stage 0
  let pokemon = allPokemon.find((pokemon) => pokemon.name == evolutionData.chain.species.name);
  evolutionDetails.push({ 
      name: pokemon.name, 
      id: pokemon.data.id, 
      type: pokemon.data.types[0].type.name, 
    sprite: pokemon.data.sprite,
      evolutions: [],
    });

  // stage 1
  let stageOneArray = evolutionData.chain.evolves_to;

  stageOneArray.forEach((evolution) => {
    let pokemon = allPokemon.find((pokemon) => pokemon.name == evolution.species.name);
    evolutionDetails.push({ 
      name: pokemon.name, 
      id: pokemon.data.id, 
      type: pokemon.data.types[0].type.name, 
      sprite: pokemon.data.sprite,
      evolutions: evolution.evolves_to 
    });
  });

  // stage 2
  evolutionDetails.forEach((pokemon) => {
    if (pokemon.evolutions.length > 0) {
      pokemon.evolutions.forEach((evolution) => {
        let pokemon = allPokemon.find((pokemon) => pokemon.name == evolution.species.name);
        evolutionDetails.push({ 
          name: pokemon.name, 
          id: pokemon.data.id, 
          type: pokemon.data.types[0].type.name, 
          sprite: pokemon.data.sprite,
        });
      })
    }
  });

  return evolutionDetails;
};

// ROUTES
app.get("/", async function (req, res) {
  res.render('index.liquid', {
    allPokemon: allPokemon
  });
});

app.get("/:pokemon", async function (req, res) {
  let pokemon = allPokemon.find((pokemon) => pokemon.name == req.params.pokemon);

  if (pokemon) {
    let evolutions = await getEvolutionChain(pokemon);
    let evolutionsDetails = getEvolutionDetails(evolutions);

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