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

async function getEvolutionDetails(evolutionData) {
  let evolutionDetails = [];
  let stageTwoArray = evolutionData.chain.evolves_to;

  await Promise.all(stageTwoArray.map(async (evolution) => {
    // for each evolution, find the matching pokemon object in the allPokemon array.
    let pokemon = await allPokemon.find((pokemon) => pokemon.name == evolution.species.name);
    evolutionDetails.push({ name: pokemon.name, id: pokemon.data.id, type: pokemon.data.types[0].type.name, sprite: pokemon['data']['sprites']['other']['official-artwork']['front_default'], evolutions: evolution.evolves_to });
  }));

  await Promise.all(evolutionDetails.map(async (evolution) => {
    if (evolution.evolutions.length > 0) {
      evolution.evolutions.map(async (evo) => {
        let pokemon = await allPokemon.find((pokemon) => pokemon.name == evo.species.name);
        evolutionDetails.push({ name: pokemon.name, id: pokemon.data.id, type: pokemon.data.types[0].type.name, sprite: pokemon['data']['sprites']['other']['official-artwork']['front_default']});
      })
    }
  }));

  return evolutionDetails;
  console.log(evolutionDetails);

  // let stageThreeArray = evolutionData.chain.evolves_to;

  // await Promise.all(stageTwoArray.map(async (evolution) => {
  //   let pokemon = await allPokemon.find((pokemon) => pokemon.name == evolution.species.name);
  //   evolutionDetails.push({ name: pokemon.name, type: pokemon.data.types[0].type.name, sprite: pokemon.data.sprites.other });
  // }));

  // get the base evolution
  // search the original allPokemon array for that name and add the type and sprite to the object

  // check if second stage
  // loop through second stage evolutions
  // add corresponding types and sprites

  // for each 2nd stage pokemon, check if it evolves, and add to the array
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