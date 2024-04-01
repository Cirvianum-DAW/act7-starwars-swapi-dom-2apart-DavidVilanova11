import act7 from "./act7.js";

console.log("Benvingut a MP6 de DAW!");

// Iniciem la llista de pel·lícules amb informació per defecte (id 1)
act7.setMovieHeading(1, ".movie__title", ".movie__info", ".movie__director");
// Iniciem el selector de pel·lícules
act7.initMovieSelect("#select-movie");
act7.setMovieSelectCallbacks(
  "#select-movie",
  ".movie__title",
  ".movie__info",
  ".movie__director",
  "#select-homeworld"
);
act7.deleteAllCharacterTokens();
act7.addChangeEventToSelectHomeworld();
