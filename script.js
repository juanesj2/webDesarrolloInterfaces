// Nos aseguramos de que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
  // Llama a las funciones para poblar el carrusel y las tarjetas de juego
  const currentPage = window.location.pathname;

  // Solo ejecutar el carrusel de portada en index.html
  if (currentPage.includes("index.html") || currentPage.endsWith("/")) {
    CarrouselJuegos();
    buscarYMostrarJuegos();
  }

  // Solo ejecutar el carrusel de capturas en side.html
  if (currentPage.includes("side.html")) {
    CarrouselJuegoSide();
    juegoSide();
  }

  const searchLink = document.getElementById('searchLink');
  const busquedaDiv = document.querySelector('.busqueda');

  searchLink.addEventListener('click', (e) => {
    e.preventDefault();
    busquedaDiv.style.display = (busquedaDiv.style.display === 'block') ? 'none' : 'block';
  });

  // Referencia al campo de búsqueda
  const inputBusqueda = document.getElementById('bus');

  // Detectar cuando el usuario presione Enter
  inputBusqueda.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const valor = inputBusqueda.value.trim();
      if (valor) {
        buscarJuego(valor);
      }
    }
  });
});
const SELECTED_GAME_KEY = 'selectedGameId';

function setSelectedGameId(id) {
  if (!id) return;
  sessionStorage.setItem(SELECTED_GAME_KEY, String(id));
  dispatchGameSelected(id);
}

function getSelectedGameId() {
  return sessionStorage.getItem(SELECTED_GAME_KEY);
}

function clearSelectedGameId() {
  sessionStorage.removeItem(SELECTED_GAME_KEY);
  dispatchGameSelected(null);
}

function dispatchGameSelected(id) {
  // Emite un evento global para que listeners puedan reaccionar
  const ev = new CustomEvent('gameSelected', { detail: { id } });
  window.dispatchEvent(ev);
}


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



/*    imagenFondo = document.createElement('div');
    imagenFondo.style.backgroundImage = `url('${game.background_image}')`;
    imagenFondo.style.backgroundSize = 'cover';
    imagenFondo.style.backgroundPosition = 'center';
    imagenFondo.style.height = '60%';
    imagenFondo.style.width = '100%';
    imagenFondo.style.display = 'flex';
    imagenFondo.style.alignItems = 'center';*/ 
// funcion que usaremos para recortar el texto a una longitud maxima
function cortarTexto(texto, maxLongitud) {
  // Si no tenemos texto devolvemos un mensaje por defecto
  if (!texto) return 'Sin descripción disponible.';
  // Si el texto es menor o igual a la longitud maxima, lo devolvemos tal cual
  if (texto.length <= maxLongitud) return texto;
  // Si el texto es mayor, lo recortamos y añadimos '...'
  return texto.substring(0, maxLongitud).trim() + '...';
}
async function juegoSide() {
  const apiKey = "058117af7bb1482cb1f272040b80a596";
  const juegoArriba = document.getElementById('juegoArriba');
  
  try {
     const gameId = getSelectedGameId();
    if (!gameId) {
      console.warn("No hay ID de juego guardado en sessionStorage");
      return;
    }
    const url = `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);

    const detailsData = await response.json();
      const firstGame = detailsData;
      const firstImage = firstGame.background_image;

      if (firstImage) {
        juegoArriba.style.backgroundImage = `url("${firstImage}")`;
        juegoArriba.style.backgroundSize = 'cover';
        juegoArriba.style.backgroundPosition = 'center';
        juegoArriba.style.backgroundRepeat = 'no-repeat';
      }
      
      // Aquí recogemos el título del juego y otros datos como su fecha de salida y su puntuación
      juegoArriba.querySelector('h1').textContent = firstGame.name;
      juegoArriba.querySelector('.nota').textContent = `Rating: ${firstGame.rating}`;
      const descripcion = detailsData.description_raw || 'Sin descripción disponible';
      const descripcionCorta = cortarTexto(descripcion,550);
       juegoArriba.querySelector('.descripcion').innerHTML = descripcionCorta;

       const detalles = document.getElementById('detallesJuegos');
       detalles.innerHTML = `<h2>${firstGame.name}</h2>
                            <p><strong>Release date:</strong> ${firstGame.released || 'Sin fecha'}</p>
                            <p><strong>Genre:</strong> ${firstGame.genres.map(g => g.name).join(', ')}</p>
                            <p><strong>Developer:</strong> ${firstGame.developers?.[0]?.name || 'Desconocido'}</p>
                            <p><strong>Minimum requirements:</strong></p>
                            <p>${detailsData.platforms?.[0]?.requirements?.minimum || 'No disponibles'}</p>
                            <p><strong>Recomended requierements:</strong></p>
                            <p>${detailsData.platforms?.[0]?.requirements?.recommended || 'No disponibles'}</p>`;
                            // 🔹 Asignar enlace de Steam al botón existente
const steamBtn = document.querySelector('.boton-steam');

if (steamBtn && firstGame) {
  let steamUrl = "";
  const steamStore = Array.isArray(firstGame.stores)
    ? firstGame.stores.find(s => s.store?.slug === 'steam')
    : null;

  // Usar el enlace directo de RAWG si existe
  if (steamStore?.url) {
    steamUrl = steamStore.url;
  }
  // Si no hay enlace directo, buscar el juego en Steam por nombre
  else if (firstGame.name) {
    steamUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(firstGame.name)}`;
  }

  // Último recurso: portada principal de Steam
  else {
    steamUrl = "https://store.steampowered.com/";
  }

  steamBtn.setAttribute('href', steamUrl);
}

  } catch (error) {
    console.error('Error al cargar el juego:', error);
  }
}
document.addEventListener('DOMContentLoaded', juegoSide);

async function CarrouselJuegoSide() {
  const apiKey = "058117af7bb1482cb1f272040b80a596";
  const carouselId = "carouselJuegoSide";
  const carouselIndicators = document.getElementById("carousel-indicators-side");
  const carouselInner = document.getElementById("carousel-inner-side");
  const carouselEl = document.getElementById(carouselId);

  if (!carouselIndicators || !carouselInner || !carouselEl) return;

  // Limpia contenido previo
  carouselIndicators.innerHTML = "";
  carouselInner.innerHTML = "";

  try {
    const gameId = getSelectedGameId();
    if (!gameId) return;

    // Obtener capturas del juego
    const res = await fetch(`https://api.rawg.io/api/games/${gameId}/screenshots?key=${apiKey}`);
    if (!res.ok) throw new Error(`Error en la API: ${res.statusText}`);
    const data = await res.json();

    let screenshots = Array.isArray(data.results) ? data.results : [];

    // Fallback: si no hay screenshots, usar background_image del juego
    if (screenshots.length === 0) {
      const fallback = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${apiKey}`);
      if (fallback.ok) {
        const gameData = await fallback.json();
        if (gameData.background_image) {
          screenshots = [{ image: gameData.background_image }];
        }
      }
    }

    if (screenshots.length === 0) {
      carouselInner.innerHTML = `
        <div class="carousel-item active">
          <div class="p-4 text-center">No hay imágenes disponibles.</div>
        </div>`;
      return;
    }

    // Crear dinámicamente slides e indicadores
    screenshots.forEach((shot, index) => {
      const isActive = index === 0;

      // Indicador
      const indicator = document.createElement("button");
      indicator.type = "button";
      indicator.dataset.bsTarget = `#${carouselId}`;
      indicator.dataset.bsSlideTo = index.toString();
      indicator.ariaLabel = `Slide ${index + 1}`;
      if (isActive) {
        indicator.classList.add("active");
        indicator.ariaCurrent = "true";
      }
      carouselIndicators.appendChild(indicator);

      // Slide
      const item = document.createElement("div");
      item.className = `carousel-item${isActive ? " active" : ""}`;

      const img = document.createElement("img");
      img.src = shot.image;
      img.className = "d-block w-100";
      img.alt = `Captura ${index + 1}`;
      img.style.objectFit = "cover";
      img.style.height = "500px";

      item.appendChild(img);
      carouselInner.appendChild(item);
    });

    // Reinicializar carrusel correctamente
    const prevInstance = bootstrap.Carousel.getInstance(carouselEl);
    if (prevInstance) prevInstance.dispose();

    const carousel = new bootstrap.Carousel(carouselEl, {
      interval: 4000,
      ride: true,
      wrap: true,
      pause: false
    });

    carousel.to(0);
    carousel.cycle();

  } catch (err) {
    console.error("Error cargando el carrusel:", err);
    carouselInner.innerHTML = `
      <div class="carousel-item active">
        <div class="p-4 text-center text-danger">Error al cargar imágenes.</div>
      </div>`;
  }
}


// Con la funcion async hacemos que el codigo dentro de la funcion se ejecute de forma asincrona
// Es decir, que no bloquea la ejecucion del resto del codigo
// Esto es util cuando hacemos llamadas a APIs o tareas que pueden tardar en completarse
async function buscarYMostrarJuegos(page = 1) {

  // Referencias a los elementos del DOM
  const container = document.getElementById("juegos-container");
  container.innerHTML = '<h1>Cargando juegos...</h1>'; // Mensaje de carga inicial
  const pageSize = 6;

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
    const searchUrl = `https://api.rawg.io/api/games?key=${apiKey}&dates=${lastYear.toISOString().split('T')[0]},${today.toISOString().split('T')[0]}&ordering=-rating&page_size=${pageSize}&page=${page}`;

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

    // Calculamos el total de páginas y renderizamos la paginación
    const totalGames = searchData.count;
    const totalPages = Math.ceil(totalGames / pageSize);
    renderizarPaginacion(page, totalPages);

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

    //**********************  Contenido flip card  *****************************************/

      // Añadimos la informacion a la flip card
      flipCardFront.appendChild(gameImage);
      flipCardFront.appendChild(flipCardTitle);
      const rating = document.createElement('p');
      rating.textContent = `Rating: ${game.rating} / 5`;
      flipCardFront.appendChild(rating);
      const flipCardBack = document.createElement('div');
      flipCardBack.className = 'flip-card-back';
      const backTitle = document.createElement('p');
      backTitle.className = 'title';
      backTitle.textContent = 'Description';
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

//Función para la barra de búsqueda
async function buscarJuego(nombre) {
  const container = document.getElementById("juegos-container");
  container.innerHTML = `<h2>Buscando "${nombre}"...</h2>`;

  document.getElementById("tituloSeccion").style.display = "none";

  const apiKey = "058117af7bb1482cb1f272040b80a596";

  try {
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(nombre)}&page_size=6`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error en la búsqueda de juegos");
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      container.innerHTML = `<h3>No se encontraron resultados para "${nombre}".</h3>`;
      return;
    }

    container.innerHTML = '';

    for (const game of data.results) {
      const detailsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${apiKey}`);
      if (!detailsResponse.ok) continue;
      const gameDetails = await detailsResponse.json();

      const gameCard = document.createElement('div');
      gameCard.className = 'game-card';

      const flipCard = document.createElement('div');
      flipCard.className = 'flip-card mb-4';
      const flipCardInner = document.createElement('div');
      flipCardInner.className = 'flip-card-inner';
      const flipCardFront = document.createElement('div');
      flipCardFront.className = 'flip-card-front';
      const flipCardTitle = document.createElement('p');
      flipCardTitle.className = 'title';
      flipCardTitle.textContent = game.name;

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
      backDescription.textContent = cortarTexto(gameDetails.description_raw, 100);
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
    container.innerHTML = `<h3>Error al buscar el juego</h3>`;
  }
}

// --- Toggle para el enlace "Popular" ---
const links = document.querySelectorAll('a.link');
let popularAnchor = null;

// Buscar el enlace cuyo texto es "Popular"
links.forEach(link => {
  const title = link.querySelector('.link-title');
  if (title && title.textContent.trim() === 'Popular') {
    popularAnchor = link;
  }
});

if (popularAnchor) {
  const popularIconContainer = popularAnchor.querySelector('.link-icon');
  const popularText = popularAnchor.querySelector('.link-title');
  const juegosContainer = document.getElementById("juegos-container");
  const tituloPrincipal = document.querySelector("h1");

  let modoTopRated = false;
  const apiKey = "058117af7bb1482cb1f272040b80a596";

  // Guardamos el SVG original
  const svgOriginal = popularIconContainer.innerHTML;

  // SVG alternativo
  const svgStar = `
    <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="currentColor" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"></rect>
      <path
        d="M239.2,97.8a8,8,0,0,0-6.3-5.5l-64.1-9.3L140.9,23.5a8,8,0,0,0-14.8,0L87.2,83l-64.1,9.3a8,8,0,0,0-4.4,13.7l46.4,45.2L52.2,216a8,8,0,0,0,11.6,8.4L128,195.4l64.2,29a8,8,0,0,0,11.6-8.4l-12.9-65.8,46.4-45.2A8,8,0,0,0,239.2,97.8Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="10"
        fill="none"
      ></path>
    </svg>
  `;

  popularAnchor.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!modoTopRated) {
      // --- Cambiar a modo "Top Rated" ---
      popularText.textContent = "Top Rated";
      popularIconContainer.innerHTML = svgStar;
      if (tituloPrincipal) tituloPrincipal.textContent = "Los juegos más jugados";
      modoTopRated = true;

      juegosContainer.innerHTML = "<h2>Cargando juegos más jugados...</h2>";

      try {
        const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=-added&page_size=6`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al cargar los juegos populares");
        const data = await response.json();

        juegosContainer.innerHTML = "";

        for (const game of data.results) {
          const detailsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${apiKey}`);
          if (!detailsResponse.ok) continue;
          const gameDetails = await detailsResponse.json();

          const gameCard = document.createElement("div");
          gameCard.className = "game-card";

          const flipCard = document.createElement("div");
          flipCard.className = "flip-card mb-4";
          const flipCardInner = document.createElement("div");
          flipCardInner.className = "flip-card-inner";

          const flipCardFront = document.createElement("div");
          flipCardFront.className = "flip-card-front";
          flipCardFront.innerHTML = `
            <img id="game-image" src="${game.background_image}" alt="${game.name}">
            <p class="title">${game.name}</p>
            <p>Rating: ${game.rating} / 5</p>
          `;

          const flipCardBack = document.createElement("div");
          flipCardBack.className = "flip-card-back";
          flipCardBack.innerHTML = `
            <p class="title">Descripción</p>
            <p>${cortarTexto(gameDetails.description_raw, 100)}</p>
          `;

          flipCardInner.appendChild(flipCardFront);
          flipCardInner.appendChild(flipCardBack);
          flipCard.appendChild(flipCardInner);
          gameCard.appendChild(flipCard);
          juegosContainer.appendChild(gameCard);
        }
      } catch (error) {
        console.error(error);
        juegosContainer.innerHTML = "<h3>Error al cargar los juegos más jugados</h3>";
      }
    } else {
      // --- Volver a modo "Popular" ---
      popularText.textContent = "Popular";
      popularIconContainer.innerHTML = svgOriginal;
      if (tituloPrincipal) tituloPrincipal.textContent = "Los mejores juegos del último año";
      modoTopRated = false;

      juegosContainer.innerHTML = "<h2>Cargando los mejores juegos del año...</h2>";

      if (typeof buscarYMostrarJuegos === "function") {
        buscarYMostrarJuegos();
      }
    }
  });
}

// recarga el index al pulsar en Home
const homeLink = document.getElementById("homeLink");

if (homeLink) {
  homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "index.html"; 
  });
}