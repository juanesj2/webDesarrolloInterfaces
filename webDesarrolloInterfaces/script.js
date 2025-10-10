// Nos aseguramos de que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
  // Llama a las funciones para poblar el carrusel y las tarjetas de juego
  CarrouselJuegos();
  buscarYMostrarJuegos();
});

async function CarrouselJuegos() {
  // Esta es la KEY de la API y la URL de búsqueda
  const apiKey = "058117af7bb1482cb1f272040b80a596";
  const carouselIndicators = document.getElementById('carousel-indicators');
  const carouselInner = document.getElementById('carousel-inner');

  // Limpiamos el contenido previo
  carouselIndicators.innerHTML = '';
  carouselInner.innerHTML = '';

  try {
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const dates = `${lastYear.toISOString().slice(0, 10)},${today.toISOString().slice(0, 10)}`;

    const url = `https://api.rawg.io/api/games?key=${apiKey}&dates=${dates}&ordering=-rating&page_size=3`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);
    
    const data = await response.json();
    const games = data.results;

    if (games && games.length > 0) {
      games.forEach((game, index) => {
        const isActive = index === 0;

        // Crear indicador
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.dataset.bsTarget = '#carouselExampleCaptions';
        indicator.dataset.bsSlideTo = index;
        indicator.ariaLabel = `Slide ${index + 1}`;
        if (isActive) {
          indicator.className = 'active';
          indicator.ariaCurrent = 'true';
        }
        carouselIndicators.appendChild(indicator);

        // Crear item del carrusel
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${isActive ? 'active' : ''}`;
        carouselItem.innerHTML = `
          <img src="${game.background_image}" class="d-block w-100" alt="${game.name}" style="object-fit: cover; height: 500px;">
          <div class="carousel-caption d-none d-md-block">
            <h5>${game.name}</h5>
            <p>Valoración: ${game.rating} / 5</p>
          </div>`;
        carouselInner.appendChild(carouselItem);
      });
    }
  } catch (error) {
    console.error('Error al cargar los juegos para el carrusel:', error);
    carouselInner.innerHTML = '<div class="carousel-item active"><p class="text-white bg-danger p-3">Error al cargar imágenes.</p></div>';
  }
}

// funcion que usaremos para recortar el texto a una longitud maxima
function cortarTexto(texto, maxLongitud) {
  // Si no tenemos texto devolvemos un mensaje por defecto
  if (!texto) return 'Sin descripción disponible.';
  // Si el texto es menor o igual a la longitud maxima, lo devolvemos tal cual
  if (texto.length <= maxLongitud) return texto;
  // Si el texto es mayor, lo recortamos y añadimos '...'
  return texto.substring(0, maxLongitud).trim() + '...';
}

// Con la funcion async hacemos que el codigo dentro de la funcion se ejecute de forma asincrona
// Es decir, que no bloquea la ejecucion del resto del codigo
// Esto es util cuando hacemos llamadas a APIs o tareas que pueden tardar en completarse
async function buscarYMostrarJuegos() {

  // Referencias a los elementos del DOM
  const container = document.getElementById("juegos-container");
  container.innerHTML = '<h1>Cargando juegos...</h1>'; // Mensaje de carga inicial

  // usamos una excepcion para manejar errores
  try {
    // Esta es la KEY de la API y la URL de búsqueda
    const apiKey = "058117af7bb1482cb1f272040b80a596";
    // Mostarmos una lista de los mejores juegos del ultimo año
    // Obtenemos la fecha de hoy
    const today = new Date();
    // Obtenemos la fecha de hace un año
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);
    
    /* const searchUrl = `https://api.rawg.io/api/games?key=${apiKey}&dates=2023-01-01,2024-01-01&ordering=-rating&page_size=1`; */

    // Formateamos las fechas a AAAA-MM-DD que es el formato que acepta la API
    // toISOString() devuelve la fecha en formato ISO 8601 (AAAA-MM-DDTHH:mm:ss.sssZ)
    // split('T')[0] nos quedamos con la parte de la fecha (antes de la T) porque no quereos la hora

    // En la parte page_size=1 indicamos el numero de resultados a mostrar
    const searchUrl = `https://api.rawg.io/api/games?key=${apiKey}&dates=${lastYear.toISOString().split('T')[0]},${today.toISOString().split('T')[0]}&ordering=-rating&page_size=6`;

    // Buscamos los juegos
    // fetch es una funcion nativa de JS que permite hacer peticiones HTTP
    // await hace que el codigo espere a que la promesa se resuelva
    // una promesa es un objeto que espera a la respuesta de una operacion asincrona
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) throw new Error("Error en la búsqueda de juegos");
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      container.innerHTML = "<h1>No se encontraron juegos</h1>";
      return;
    }

    // Limpiamos el contenedor antes de añadir los nuevos juegos
    container.innerHTML = '';

    // Recorremos la lista de juegos obtenida
    for (const game of searchData.results) {

      // Hacemos una segunda llamada para obtener los detalles de CADA juego mediante su id
      // Igual que usamos el game.id tembien podriamos usar el nombre pasado por marametro (para la barra de busqueda)
      const detailsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${apiKey}`);
      // Si la llamada falla, continuamos con el siguiente juego
      if (!detailsResponse.ok) continue;

      // Obtenemos los detalles del juego
      // Con el metodo await esperamos a obtener los datos 
      // Y con el metodo .json() convertimos la respuesta en un objeto JS
      const gameDetails = await detailsResponse.json();

    //************************  Contenedor del juego  *****************************************/
      // Creamos el contenedor para cada juego
      const gameCard = document.createElement('div');
      gameCard.className = 'game-card'; // Usamos una clase para el estilo

    //**********************  Fin contenedor del juego  ***************************************/

    //**********************  Contenedor flip card  *****************************************/
      // creamos la flip card
      const flipCard = document.createElement('div');
      flipCard.className = 'flip-card mb-4';
      const flipCardInner = document.createElement('div');
      flipCardInner.className = 'flip-card-inner';
      const flipCardFront = document.createElement('div');
      flipCardFront.className = 'flip-card-front';
      const flipCardTitle = document.createElement('p');
      flipCardTitle.className = 'title';
      flipCardTitle.textContent = game.name;

    //**********************  Fin contenedor flip card  ***************************************/

      // Añadimos la informacion a la flip card
      flipCardFront.appendChild(flipCardTitle);
      const rating = document.createElement('p');
      rating.textContent = `Valoración: ${game.rating} / 5`;
      flipCardFront.appendChild(rating);
      const flipCardBack = document.createElement('div');
      flipCardBack.className = 'flip-card-back';
      const backTitle = document.createElement('p');
      backTitle.className = 'title';
      backTitle.textContent = 'Descripción';
      const backDescription = document.createElement('p');
      backDescription.textContent =cortarTexto(gameDetails.description_raw, 100)|| 'Sin descripción disponible.';
      flipCardBack.appendChild(backTitle);
      flipCardBack.appendChild(backDescription);
      flipCardInner.appendChild(flipCardFront);
      flipCardInner.appendChild(flipCardBack);  
      flipCard.appendChild(flipCardInner);
      gameCard.appendChild(flipCard);
      
      container.appendChild(gameCard);
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = "<h1>Error al cargar los juegos</h1><p>Peldon peldon peldon.</p>";
  }
}