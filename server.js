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

app.listen(app.get('port'), function () {
  console.log(`Application started on http://localhost:${app.get('port')}`);
});