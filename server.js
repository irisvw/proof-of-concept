import express from 'express';
import { Liquid } from 'liquidjs';

const app = express();
const engine = new Liquid();

app.engine('liquid', engine.express());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 8000);
app.set('views', './views');

const apiBase = "https://pokeapi.co/api/v2/";

const allPokemon = await getAllPokemon();

async function getAllPokemon() {
  const apiResponse = await fetch(`${apiBase}pokemon?limit=3`);
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

app.get("/", async function (req, res) {
  res.render('index.liquid', {
    allPokemon: allPokemon
  });
});

app.get("/:pokemon", async function (req, res) {
  let pokemon = allPokemon.find((pokemon) => pokemon.name == req.params.pokemon);
  
  res.render('detail.liquid', {
    pokemon: pokemon
  });
});

app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`);
});