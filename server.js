// SETUP
import express from 'express';
import { Liquid } from 'liquidjs';
import { readFile, writeFile } from 'node:fs/promises';


const app = express();
const engine = new Liquid();

app.engine('liquid', engine.express());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 8000);
app.set('views', './views');

// VARIABLES
const prefix = "https://pokeapi.co/api/v2/";
const limit = 12;

// const allPokemon = await getAllPokemon();
const allPokemonFile = await readFile('./allPokemon.json', { encoding: 'utf8' });
const allPokemon = JSON.parse(allPokemonFile);

// fetch custom data from FDND whois API
let favPokemon = await getFavPokemon();

// MARK: FUNCTIONS
async function getFavPokemon() {
  const whoisResponse = await fetch('https://fdnd.directus.app/items/person/154?fields=custom');
  const whoisResponseJSON = await whoisResponse.json();
  const whoisResponseParsed = JSON.parse(whoisResponseJSON.data.custom);

  return whoisResponseParsed.favPokemon;
}

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

  pokemon.data = {
    id: pokemonResponseJSON.id,
    baseXP: pokemonResponseJSON.base_experience,
    weight: pokemonResponseJSON.weight,
    height: pokemonResponseJSON.height,
    abilities: pokemonResponseJSON.abilities,
    types: pokemonResponseJSON.types,
    sprite: pokemonResponseJSON.sprites.other['official-artwork'].front_default,
    stats: pokemonResponseJSON.stats,
    evolutionChain: pokemonResponseJSON.species.url,
    speciesName: pokemonResponseJSON.species.name
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
  let pokemon = allPokemon.find((pokemon) => pokemon.data.speciesName == evolutionData.chain.species.name);
  pokemon.evolutions = [];
  evolutionDetails.push(pokemon);

  // stage 1
  let stageOneArray = evolutionData.chain.evolves_to;
  stageOneArray.forEach((evolution) => {
    let pokemon = allPokemon.find((pokemon) => pokemon.data.speciesName == evolution.species.name);
    pokemon.evolutions = evolution.evolves_to;
    evolutionDetails.push(pokemon);
  });

  // stage 2
  evolutionDetails.forEach((pokemon) => {
    if (pokemon.evolutions.length > 0) {
      pokemon.evolutions.forEach((evolution) => {
        let pokemon = allPokemon.find((pokemon) => pokemon.data.speciesName == evolution.species.name);
        evolutionDetails.push(pokemon);
      })
    }
  });

  return evolutionDetails;
};

// MARK: ROUTES
app.get("/", async function (req, res) {
  res.render('index.liquid', {
    allPokemon: allPokemon,
    favorites: favPokemon,
    page: 'all',
  });
});

app.get("/page/:id", async function (req, res) {
  let id = req.params.id;
  let offset = (id - 1) * limit;

  res.render('index.liquid', {
    allPokemon: allPokemon.slice(offset, offset + limit),
    favorites: favPokemon,
    page: 'all',
    pageID: id
  });
});

app.get("/search", async function (req, res) {
  let query = req.query.query;
  let result = allPokemon.filter((pokemon) => pokemon.name.includes(query));

  res.render('search.liquid', {
    allPokemon: result,
    favorites: favPokemon,
  });
});

app.get("/caught", async function (req, res) {
  let result = [];

  favPokemon.forEach(entry => {
    let pokemon = allPokemon.find((pokemon) => pokemon.name == entry);
    result.push(pokemon);
  });

  res.render('caught.liquid', {
    allPokemon: result,
    favorites: favPokemon,
  });
})

app.get("/:pokemon", async function (req, res) {
  let pokemon = allPokemon.find((pokemon) => pokemon.name == req.params.pokemon);

  if (pokemon) {
    let evolutions = await getEvolutionChain(pokemon);
    let evolutionsDetails = (Object.keys(evolutions).length == 0) ? [] : getEvolutionDetails(evolutions);

    res.render('detail.liquid', {
      pokemon: pokemon,
      evolutions: evolutionsDetails,
      favorites: favPokemon
    });
  } else {
    res.render('error.liquid');
  };
});

app.post("/:pokemon/catch", async function (req, res) {
  favPokemon.push(req.params.pokemon);

  await fetch(`https://fdnd.directus.app/items/person/154`, {
    method: 'PATCH',
    body: JSON.stringify({
      custom: {
        favPokemon: favPokemon
      }
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });

  if (req.body.enhanced) {
    res.render('partials/form.liquid', {
      pokemon: req.params.pokemon,
      action: "release",
      origin: `${req.body.origin}`
    })
  } else {
    res.redirect(303, `/${req.body.origin}`);
  }
});

app.post("/:pokemon/release", async function (req, res) {
  favPokemon.splice(favPokemon.indexOf(req.params.pokemon), 1);

  await fetch(`https://fdnd.directus.app/items/person/154?fields=custom`, {
    method: 'PATCH',
    body: JSON.stringify({
      custom: {
        favPokemon: favPokemon
      }
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });

  if (req.body.enhanced) {
    // Filter uit allPokemon degene die net veranderd is
    // render hier het ene formulier dat je net veranderd hebt, met die ene pokemon
    res.render('partials/form.liquid', {
      pokemon: req.params.pokemon,
      action: "catch",
      origin: `${req.body.origin}`
    })
  } else {
    res.redirect(303, `/${req.body.origin}`);
  }
});

// PORT
app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`);
});