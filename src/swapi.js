//const fetch = require ('node-fetch');

function getMovieCount() {
  return fetch("https://swapi.info/api/films/")
    .then((res) => res.json())
    .then((res) => res.count);
}

/* function listMovies() {
  return fetch('https://swapi.info/api/films/')
    .then((res) => res.json())
    .then((res) => res.results)
    .then((movies) =>
      movies.map((movie) => ({
        name: movie.title,
        director: movie.director,
        release: movie.release_date,
        episodeID: movie.episode_id,
      }))
    );
} */

async function listMovies() {
  try {
    const res = await fetch("https://swapi.info/api/films/");

    if (!res.ok) {
      throw new Error("API request failed");
    }
    const data = await res.json();

    // Comprovem que hi hagi resposta i que sigui un array
    if (!data || !Array.isArray(data)) {
      throw new Error("API did not return an array");
    }

    const movies = data.map((movie) => ({
      name: movie.title,
      director: movie.director,
      release: movie.release_date,
      episodeID: movie.episode_id,
    }));
    return movies;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function listMoviesSorted() {
  const movies = await listMovies();
  // console.log(movies);
  return movies.sort(_compareByName);
}

async function listEvenMoviesSorted() {
  const movies = await listMovies();
  return movies
    .filter((movie) => movie.episodeID % 2 === 0)
    .sort(_compareByEpisodeId);
}

function getMovieInfo(id) {
  return fetch(`https://swapi.info/api/films/${id}/`)
    .then((res) => res.json())
    .then((movie) => ({
      name: movie.title,
      episodeID: movie.episode_id,
      characters: movie.characters,
      director: movie.director,
      release: movie.release_date,
    }));
}

function getCharacterName(url) {
  // Necesario para siguientes apartados.
  url = url.replace("http://", "https://");
  return fetch(url)
    .then((res) => res.json())
    .then((character) => character.name);
}

async function getMovieCharacters(id) {
  const movie = await getMovieInfo(id);
  movie.characters = await _getCharacterNames(movie);
  return movie;
}

async function getMovieCharactersAndHomeworlds(id) {
  const movie = await getMovieInfo(id);
  movie.characters = await _getCharacterNamesAndHomeWorlds(movie);
  return movie;
}

async function _getCharacterNames(movie) {
  const characters = await Promise.allSettled(
    movie.characters.map(getCharacterName)
  );
  return characters.map((character) => {
    if (character.status === "fulfilled") {
      return character.value;
    } else {
      console.error(character.reason);
      return null;
    }
  });
}

async function _getCharacterNamesAndHomeWorlds(movie) {
  const charactersWithHomeWorlds = await Promise.allSettled(
    movie.characters.map(_getCharacterInfoAndHomeworld)
  );
  return charactersWithHomeWorlds.map((character) => {
    if (character.status === "fulfilled") {
      return character.value;
    } else {
      console.error(character.reason);
      return null;
    }
  });
}

async function _getCharacterInfoAndHomeworld(url) {
  url = url.replace("http://", "https://");
  try {
    const raw = await fetch(url);
    const res = await raw.json();
    const character = {
      name: res.name,
      homeworld: res.homeworld,
      birth_year: res.birth_year,
      gender: res.gender,
      eye_color: res.eye_color,
      url: res.url,
    };

    character.homeworld = await _getHomeWorldName(character.homeworld);

    return character;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function _getHomeWorldName(url) {
  // Necesario para siguientes apartados.
  url = url.replace("http://", "https://");
  try {
    const raw = await fetch(url);
    const res = await raw.json();
    return res.name;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function _compareByName(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function _compareByEpisodeId(a, b) {
  return parseFloat(a.episodeID) - parseFloat(b.episodeID);
}

async function createMovie(id) {
  const movie = await getMovieInfo(id);
  return new Movie(movie.name, movie.characters);
}

export class Movie {
  #characterUrls = [];

  constructor(name, characterUrls) {
    this.name = name;
    this.#characterUrls = characterUrls;
  }

  async getCharacters() {
    return Promise.all(this.#characterUrls.map(getCharacterName));
  }

  async getHomeworlds() {
    const namesAndHomeworlds = await Promise.all(
      this.#characterUrls.map(_getCharacterNameAndHomeworld)
    );
    const homeworlds = namesAndHomeworlds.map((item) => item.homeworld);
    const uniqueHomeWorldsSet = new Set(homeworlds);
    const uniqueHomeworldArray = Array.from(uniqueHomeWorldsSet);
    return uniqueHomeworldArray;
  }

  async getHomeworldsReverse() {
    const homeworlds = await this.getHomeworlds();
    return homeworlds.sort().reverse();
  }
}

export default {
  getMovieCount,
  listMovies,
  listMoviesSorted,
  listEvenMoviesSorted,
  getMovieInfo,
  getCharacterName,
  getMovieCharacters,
  getMovieCharactersAndHomeworlds,
  createMovie,
  _compareByName,
};
