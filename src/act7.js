import swapi from "./swapi.js";

//Exemple d'inicialització de la llista de pel·lícules. Falten dades!
async function setMovieHeading(
  movieId,
  titleSelector,
  infoSelector,
  directorSelector
) {
  // Obtenim els elements del DOM amb QuerySelector
  const title = document.querySelector(titleSelector);
  const info = document.querySelector(infoSelector);
  const director = document.querySelector(directorSelector);

  // Obtenim la informació de la pelicula
  const movieInfo = await swapi.getMovieInfo(movieId);
  // Injectem
  title.innerHTML = movieInfo.name;
  info.innerHTML = `Episode ${movieInfo.episodeID} - ${movieInfo.release}`;
  director.innerHTML = `Director: ${movieInfo.director}`;
}

async function initMovieSelect(selector) {
  const selectElement = document.querySelector(selector);

  // Clear any existing options
  selectElement.innerHTML = "";

  // Add the default option
  const defaultOption = document.createElement("option");
  defaultOption.text = "Selecciona una pel·lícula";
  defaultOption.value = "";
  selectElement.appendChild(defaultOption);

  try {
    // Get sorted list of movies
    const sortedMovies = await swapi.listMoviesSorted();

    // Add options for each movie
    sortedMovies.forEach((movie) => {
      const option = document.createElement("option");
      option.text = movie.name;
      option.value = movie.id;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

function setMovieSelectCallbacks(
  selector,
  titleSelector,
  infoSelector,
  directorSelector,
  homeworldSelector
) {
  const selectElement = document.querySelector(selector);
  const homeworldSelectElement = document.querySelector(homeworldSelector);
  const characterList = document.querySelector(".list__characters");

  // Añadir un event listener para el cambio en el selector de películas
  selectElement.addEventListener("change", async function () {
    // Obtener el valor seleccionado
    const selectedMovieId = selectElement.value;

    // Obtener referencias a los elementos de la capa de la película y homeworld
    const titleElement = document.querySelector(titleSelector);
    const infoElement = document.querySelector(infoSelector);
    const directorElement = document.querySelector(directorSelector);

    // Limpiar el selector de homeworld
    homeworldSelectElement.innerHTML = "";

    // Limpiar las fichas de personajes
    while (characterList.firstChild) {
      characterList.removeChild(characterList.firstChild);
    }

    // Verificar si se ha seleccionado "Selecciona una película"
    if (selectedMovieId === "") {
      // Si se selecciona la opción predeterminada, limpiar la información de la película
      titleElement.textContent = "";
      infoElement.textContent = "";
      directorElement.textContent = "";
    } else {
      try {
        // Obtener la información de la película seleccionada
        const movieInfo = await swapi.getMovieInfo(selectedMovieId);

        // Mostrar la información de la película en la capa correspondiente
        titleElement.textContent = movieInfo.name;
        infoElement.textContent = `Episode ${movieInfo.episodeID} - ${movieInfo.release}`;
        directorElement.textContent = `Director: ${movieInfo.director}`;

        // Obtener personajes y homeworlds de la película seleccionada
        const charactersAndHomeworlds =
          await swapi.getMovieCharactersAndHomeworlds(selectedMovieId);

        // Obtener homeworlds de los personajes y eliminar duplicados
        const uniqueHomeworlds = [
          ...new Set(
            charactersAndHomeworlds.characters.map(
              (character) => character.homeworld
            )
          ),
        ];

        // Agregar la opción "Selecciona un homeworld" al selector de homeworlds
        const defaultHomeworldOption = document.createElement("option");
        defaultHomeworldOption.text = "Selecciona un homeworld";
        defaultHomeworldOption.value = "";
        homeworldSelectElement.appendChild(defaultHomeworldOption);

        // Agregar los homeworlds al selector de homeworlds
        uniqueHomeworlds.forEach((homeworld) => {
          const option = document.createElement("option");
          option.text = homeworld;
          option.value = homeworld;
          homeworldSelectElement.appendChild(option);
        });

        // Crear fichas de personajes
        charactersAndHomeworlds.characters.forEach((character) => {
          const characterCard = document.createElement("li");
          characterCard.classList.add("list__item", "item", "character");
          characterCard.innerHTML = `
          <img src="assets/people/${character.id}.jpg" class="character__image" />
          <h2 class="character__name">${character.name}</h2>
          <div class="character__birth"><strong>Birth Year:</strong> ${character.birth_year}</div>
          <div class="character__eye"><strong>Eye color:</strong> ${character.eye_color}</div>
          <div class="character__gender"><strong>Gender:</strong> ${character.gender}</div>
          <div class="character__home"><strong>Home World:</strong> ${character.homeworld}</div>
        `;
          characterList.appendChild(characterCard);
        });
      } catch (error) {
        console.error("Error fetching movie info:", error);
        // En caso de error, limpiar la información de la película
        titleElement.textContent = "";
        infoElement.textContent = "";
        directorElement.textContent = "";
      }
    }
  });
}

function deleteAllCharacterTokens() {}

// EVENT HANDLERS //

function addChangeEventToSelectHomeworld(homeworldSelector, movieSelector) {
  const homeworldSelectElement = document.querySelector(homeworldSelector);
  const movieSelectElement = document.querySelector(movieSelector);
  const characterList = document.querySelector(".list__characters");

  // Añadir un event listener para el cambio en el selector de planetas
  homeworldSelectElement.addEventListener("change", async function () {
    // Obtener el valor seleccionado del planeta
    const selectedHomeworld = homeworldSelectElement.value;
    const selectedMovieId = movieSelectElement.value;

    // Limpiar las fichas de personajes
    while (characterList.firstChild) {
      characterList.removeChild(characterList.firstChild);
    }

    // Verificar si se han seleccionado valores válidos en ambos selectores
    if (selectedHomeworld && selectedMovieId) {
      try {
        // Obtener personajes y homeworlds de la película seleccionada
        const charactersAndHomeworlds =
          await swapi.getMovieCharactersAndHomeworlds(selectedMovieId);

        // Filtrar personajes que pertenecen al planeta seleccionado
        const charactersOnSelectedHomeworld =
          charactersAndHomeworlds.characters.filter(
            (character) => character.homeworld === selectedHomeworld
          );

        // Crear fichas de personajes para los personajes filtrados
        charactersOnSelectedHomeworld.forEach((character) => {
          const characterCard = document.createElement("li");
          characterCard.classList.add("list__item", "item", "character");
          characterCard.innerHTML = `
            <img src="assets/people/${character.id}.jpg" class="character__image" />
            <h2 class="character__name">${character.name}</h2>
            <div class="character__birth"><strong>Birth Year:</strong> ${character.birth_year}</div>
            <div class="character__eye"><strong>Eye color:</strong> ${character.eye_color}</div>
            <div class="character__gender"><strong>Gender:</strong> ${character.gender}</div>
            <div class="character__home"><strong>Home World:</strong> ${character.homeworld}</div>
          `;
          characterList.appendChild(characterCard);
        });
      } catch (error) {
        console.error("Error fetching characters and homeworlds:", error);
      }
    }
  });
}

async function _createCharacterTokens() {}

function _addDivChild(parent, className, html) {}

async function _handleOnSelectMovieChanged(event) {}

function _filmIdToEpisodeId(episodeID) {}

// "https://swapi.dev/api/films/1/" --> Episode_id = 4 (A New Hope)
// "https://swapi.dev/api/films/2/" --> Episode_id = 5 (The Empire Strikes Back)
// "https://swapi.dev/api/films/3/" --> Episode_id = 6 (Return of the Jedi)
// "https://swapi.dev/api/films/4/" --> Episode_id = 1 (The Phantom Menace)
// "https://swapi.dev/api/films/5/" --> Episode_id = 2 (Attack of the Clones)
// "https://swapi.dev/api/films/6/" --> Episode_id = 3 (Revenge of the Sith)

let episodeToMovieIDs = [
  { m: 1, e: 4 },
  { m: 2, e: 5 },
  { m: 3, e: 6 },
  { m: 4, e: 1 },
  { m: 5, e: 2 },
  { m: 6, e: 3 },
];

function _setMovieHeading({ name, episodeID, release, director }) {}

function _populateHomeWorldSelector(homeworlds) {}

/**
 * Funció auxiliar que podem reutilitzar: eliminar duplicats i ordenar alfabèticament un array.
 */
function _removeDuplicatesAndSort(elements) {
  // Al crear un Set eliminem els duplicats
  const set = new Set(elements);
  // tornem a convertir el Set en un array
  const array = Array.from(set);
  // i ordenem alfabèticament
  return array.sort(swapi._compareByName);
}

const act7 = {
  setMovieHeading,
  setMovieSelectCallbacks,
  initMovieSelect,
  deleteAllCharacterTokens,
  addChangeEventToSelectHomeworld,
};

export default act7;
