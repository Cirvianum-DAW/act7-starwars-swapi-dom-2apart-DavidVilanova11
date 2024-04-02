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

  // Obtenim la informació de la pel·lícula
  const movieInfo = await swapi.getMovieInfo(movieId);
  // Injectem
  title.innerHTML = movieInfo.name;
  info.innerHTML = `Episode ${movieInfo.episodeID} - ${movieInfo.release}`;
  director.innerHTML = `Director: ${movieInfo.director}`;
}

async function initMovieSelect(selector) {
  const selectElement = document.querySelector(selector);

  // Netejar el selector
  selectElement.innerHTML = "";

  // Afegir l'opció per defecte
  const defaultOption = document.createElement("option");
  defaultOption.text = "Selecciona una pel·lícula";
  defaultOption.value = "";
  selectElement.appendChild(defaultOption);

  try {
    // Aconseguir pel·lícules ordenades
    const sortedMovies = await swapi.listMoviesSorted();

    // Afegir les pel·lícules al selector
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

  // Netejar els personatges del DOM
  characterList.innerHTML = "";

  // Agregar un eventLisenner per el canvi en el selector de pel·licules
  selectElement.addEventListener("change", async function () {
    // Obtener el valor seleccionado
    const selectedMovieId = selectElement.value;

    console.log("selectedMovieId", selectedMovieId);

    // Obtenir les referències dels elements del DOM
    const titleElement = document.querySelector(titleSelector);
    const infoElement = document.querySelector(infoSelector);
    const directorElement = document.querySelector(directorSelector);

    // Netejar el selector de homeworlds
    homeworldSelectElement.innerHTML = "";

    // Netejar la llista de personatges
    while (characterList.firstChild) {
      characterList.removeChild(characterList.firstChild);
    }

    // Verificar si s'ha seleccionat una pel·lícula vàlida
    if (selectedMovieId === "") {
      // Si no s'ha seleccionat cap pel·lícula, netejar la informació de la pel·lícula
      titleElement.textContent = "";
      infoElement.textContent = "";
      directorElement.textContent = "";
    } else {
      try {
        // Obtenir la informació de la pel·lícula seleccionada
        const movieInfo = await swapi.getMovieInfo(selectedMovieId);
        const characterIds = movieInfo.characters.map((url) => url.split("/")[5]);

        console.log("characterIds", characterIds);

        // Motrar l'informació de la pel·lícula
        titleElement.textContent = movieInfo.name;
        infoElement.textContent = `Episode ${movieInfo.episodeID} - ${movieInfo.release}`;
        directorElement.textContent = `Director: ${movieInfo.director}`;

        // Obtenir personatges i homeworlds de la pel·lícula seleccionada
        const charactersAndHomeworlds =
          await swapi.getMovieCharactersAndHomeworlds(selectedMovieId);

        // Obtenir els homeworlds únics dels personatges
        const uniqueHomeworlds = [
          ...new Set(
            charactersAndHomeworlds.characters.map(
              (character) => character.homeworld
            )
          ),
        ];

        // Afegir l'opció per defecte al selector de homeworlds
        const defaultHomeworldOption = document.createElement("option");
        defaultHomeworldOption.text = "Selecciona un homeworld";
        defaultHomeworldOption.value = "";
        homeworldSelectElement.appendChild(defaultHomeworldOption);

        // Afegir els homeworlds únics al selector de homeworlds
        uniqueHomeworlds.forEach((homeworld) => {
          const option = document.createElement("option");
          option.text = homeworld;
          option.value = homeworld;
          homeworldSelectElement.appendChild(option);
        });

        let counter = 0;
        charactersAndHomeworlds.characters.forEach((character) => {

          const characterCard = document.createElement("li");
          characterCard.classList.add("list__item", "item", "character");
          characterCard.innerHTML = `
          <img src="assets/people/${characterIds[counter]}.jpg" class="character__image" />
          <h2 class="character__name">${character.name}</h2>
          <div class="character__birth"><strong>Birth Year:</strong> ${character.birth_year}</div>
          <div class="character__eye"><strong>Eye color:</strong> ${character.eye_color}</div>
          <div class="character__gender"><strong>Gender:</strong> ${character.gender}</div>
          <div class="character__home"><strong>Home World:</strong> ${character.homeworld}</div>
        `;

          characterList.appendChild(characterCard);
          counter++;

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

  // Netejar els personatges del DOM
  characterList.innerHTML = "";


  // Afegir un eventListener per al canvi en el selector de homeworlds
  homeworldSelectElement.addEventListener("change", async function () {
    // Obtindre els valors seleccionats al selector de homeworlds i pel·lícules
    const selectedHomeworld = homeworldSelectElement.value;
    const selectedMovieId = movieSelectElement.value;

    // Netejar la llista de personatges
    while (characterList.firstChild) {
      characterList.removeChild(characterList.firstChild);
    }

    // Verificar si s'han seleccionat un homeworld i una pel·lícula vàlids
    if (selectedHomeworld && selectedMovieId) {
      try {
        // Obtenir la informació de la pel·lícula seleccionada
        const charactersAndHomeworlds = await swapi.getMovieCharactersAndHomeworlds(selectedMovieId);
        
        const movieInfo = await swapi.getMovieInfo(selectedMovieId);
        const characterIds = movieInfo.characters.map((url) => url.split("/")[5]);

        console.log("characterIds", characterIds);

        // Filtrar els personatges per homeworld seleccionat ***
        const charactersOnSelectedHomeworld =
          charactersAndHomeworlds.characters.filter(
            (character) => character.homeworld === selectedHomeworld
          );

          characterIds = charactersOnSelectedHomeworld.map((character) => character.url.split("/")[5]); // HAig d'aconseguir això ******

            console.log("charactersOnSelectedHomeworld", charactersOnSelectedHomeworld);

        // Crear els tokens dels personatges que viuen al homeworld seleccionat
        let counter = 0;
        charactersOnSelectedHomeworld.characters.forEach((character) => {

          const characterCard = document.createElement("li");
          characterCard.classList.add("list__item", "item", "character");
          // Aquí segurament no funcioni agafar el id dels personatges de la mateixa manera que abans *********
          characterCard.innerHTML = `
          <img src="assets/people/${characterIds[counter]}.jpg" class="character__image" />
          <h2 class="character__name">${character.name}</h2>
          <div class="character__birth"><strong>Birth Year:</strong> ${character.birth_year}</div>
          <div class="character__eye"><strong>Eye color:</strong> ${character.eye_color}</div>
          <div class="character__gender"><strong>Gender:</strong> ${character.gender}</div>
          <div class="character__home"><strong>Home World:</strong> ${character.homeworld}</div>
        `;

          characterList.appendChild(characterCard);
          counter++;
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
