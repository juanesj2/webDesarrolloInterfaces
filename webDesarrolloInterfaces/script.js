const SELECTED_GAME_KEY = 'selectedGameId';
const API_KEY = "058117af7bb1482cb1f272040b80a596";

// Nos aseguramos de que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
  // Llama a las funciones para poblar el carrusel y las tarjetas de juego
  const currentPage = window.location.pathname;

  // Solo ejecutar el carrusel de portada en index.html
  if (currentPage.includes("index.html") || currentPage.endsWith("/")) {
    setupIndexPage();
  } 
  // Solo ejecutar el carrusel de capturas en side.html
  else if (currentPage.includes("side.html")) {
    setupSidePage();
  }

  setupGlobalListeners();
});

function setupIndexPage() {
  CarrouselJuegos();
  buscarYMostrarJuegos();
}

function setupSidePage() {
  CarrouselJuegoSide();
  juegoSide();
}

function setupGlobalListeners() {
  // Listener para el icono de búsqueda
  const searchLink = document.getElementById('searchLink');
  const busquedaDiv = document.querySelector('.busqueda');
  if (searchLink && busquedaDiv) {
    searchLink.addEventListener('click', (e) => {
      e.preventDefault();
      busquedaDiv.style.display = (busquedaDiv.style.display === 'block') ? 'none' : 'block';
    });
  }

  // Referencia al campo de búsqueda
  const inputBusqueda = document.getElementById('bus');
  if (inputBusqueda) {
    // Detectar cuando el usuario presione Enter
    inputBusqueda.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const valor = inputBusqueda.value.trim();
        if (valor) {
          buscarJuego(valor);
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

  // --- Toggle para el enlace "Popular" ---
  setupPopularToggle();
}

/***********************************
 * GESTIÓN DEL JUEGO SELECCIONADO
 ***********************************/
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

/***********************************
 * FUNCIONES DE AYUDA (HELPERS)
 ***********************************/
// funcion que usaremos para recortar el texto a una longitud maxima
function cortarTexto(texto, maxLongitud) {
  if (!texto) return 'Sin descripción disponible.';
  if (texto.length <= maxLongitud) return texto;
  return texto.substring(0, maxLongitud).trim() + '...';
}

function crearTarjetaJuego(game, gameDetails) {
    //************************  Contenedor del juego  *****************************************/
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';

    //**********************  Contenedor flip card  *****************************************/
    const flipCard = document.createElement('div');
    flipCard.className = 'flip-card mb-4';
    flipCard.addEventListener("click", () => {
        setSelectedGameId(game.id);
        window.location.href = `side.html?id=${game.id}`;
    });

    const flipCardInner = document.createElement('div');
    flipCardInner.className = 'flip-card-inner';

    const flipCardFront = document.createElement('div');
    flipCardFront.className = 'flip-card-front';
    
    const gameImage = document.createElement('img');
    gameImage.id = 'game-image';
    gameImage.src = game.background_image;
    gameImage.alt = `Imagen de ${game.name}`;

    const flipCardTitle = document.createElement('p');
    flipCardTitle.className = 'title';
    flipCardTitle.textContent = game.name;

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
    const descriptionText = (gameDetails && gameDetails.description_raw) ? gameDetails.description_raw : 'Sin descripción disponible.';
    backDescription.textContent = cortarTexto(descriptionText, 100);
    flipCardBack.appendChild(backTitle);
    flipCardBack.appendChild(backDescription);

    flipCardInner.appendChild(flipCardFront);
    flipCardInner.appendChild(flipCardBack);
    flipCard.appendChild(flipCardInner);
    gameCard.appendChild(flipCard);

    return gameCard;
}

/***********************************
 * LÓGICA DE LA PÁGINA PRINCIPAL (index.html)
 ***********************************/
async function CarrouselJuegos() {
  // Esta es la KEY de la API y la URL de búsqueda
  const carouselIndicators = document.getElementById('carousel-indicators');
  const carouselInner = document.getElementById('carousel-inner');
  if (!carouselIndicators || !carouselInner) return;

  // Limpiamos el contenido previo
  carouselIndicators.innerHTML = '';
  carouselInner.innerHTML = '';

  try {
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const dates = `${lastYear.toISOString().slice(0, 10)},${today.toISOString().slice(0, 10)}`;
    const url = `https://api.rawg.io/api/games?key=${API_KEY}&dates=${dates}&ordering=-rating&page_size=3`;
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

// Con la funcion async hacemos que el codigo dentro de la funcion se ejecute de forma asincrona
async function buscarYMostrarJuegos(page = 1) {
  const container = document.getElementById("juegos-container");
  if (!container) return;
  container.innerHTML = '<h1>Cargando juegos...</h1>';
  const pageSize = 6;

  try {
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);
    const searchUrl = `https://api.rawg.io/api/games?key=${API_KEY}&dates=${lastYear.toISOString().split('T')[0]},${today.toISOString().split('T')[0]}&ordering=-rating&page_size=${pageSize}&page=${page}`;
    
    // fetch es una funcion nativa de JS que permite hacer peticiones HTTP
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) throw new Error("Error en la búsqueda de juegos");
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      container.innerHTML = "<h1>No se encontraron juegos</h1>";
      return;
    }

    const totalGames = searchData.count;
    const totalPages = Math.ceil(totalGames / pageSize);
    renderizarPaginacion(page, totalPages);

    container.innerHTML = '';

    for (const game of searchData.results) {
      const detailsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${API_KEY}`);
      if (!detailsResponse.ok) continue;
      const gameDetails = await detailsResponse.json();
      const gameCard = crearTarjetaJuego(game, gameDetails);
      container.appendChild(gameCard);
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = "<h1>Error al cargar los juegos</h1><p>Por favor, intente de nuevo más tarde.</p>";
  }
}

/*********************************** PAGINACION *********************************************/
function renderizarPaginacion(currentPage, totalPages) {
  const paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';

  const createPageItem = (text, page, disabled = false, active = false) => {
      const item = document.createElement('li');
      item.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
      const link = document.createElement('a');
      link.className = 'page-link';
      link.href = '#';
      link.innerHTML = text;
      link.onclick = (e) => {
          e.preventDefault();
          if (!disabled) buscarYMostrarJuegos(page);
      };
      item.appendChild(link);
      return item;
  };

  paginationContainer.appendChild(createPageItem('<i class="fa-solid fa-backward-fast"></i>', 1, currentPage === 1));
  paginationContainer.appendChild(createPageItem('<i class="fa-solid fa-backward-step"></i>', currentPage - 1, currentPage === 1));

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage < 3) {
      endPage = Math.min(3, totalPages);
  }
  if (currentPage > totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationContainer.appendChild(createPageItem(i, i, false, i === currentPage));
  }

  paginationContainer.appendChild(createPageItem('<i class="fa-solid fa-forward-step"></i>', currentPage + 1, currentPage === totalPages));
  /* paginationContainer.appendChild(createPageItem('<i class="fa-solid fa-forward-fast"></i>', totalPages, currentPage === totalPages)); */
}
/******************************** FIN PAGINACION *********************************************/


//Función para la barra de búsqueda
async function buscarJuego(nombre) {
  const container = document.getElementById("juegos-container");
  if (!container) return;
  container.innerHTML = `<h2>Buscando "${nombre}"...</h2>`;

  const tituloSeccion = document.getElementById("tituloSeccion");
  if (tituloSeccion) {
    tituloSeccion.style.display = "none";
  }

  try {
    const url = `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(nombre)}&page_size=6`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error en la búsqueda de juegos");
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      container.innerHTML = `<h3>No se encontraron resultados para "${nombre}".</h3>`;
      return;
    }

    container.innerHTML = '';
    for (const game of data.results) {
      const detailsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${API_KEY}`);
      if (!detailsResponse.ok) continue;
      const gameDetails = await detailsResponse.json();
      const gameCard = crearTarjetaJuego(game, gameDetails);
      container.appendChild(gameCard);
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = `<h3>Error al buscar el juego</h3>`;
  }
}

// --- Toggle para el enlace "Popular" ---
function setupPopularToggle() {
    const links = document.querySelectorAll('a.link');
    let popularAnchor = null;

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
      const svgOriginal = popularIconContainer.innerHTML;
      const svgStar = `
        <svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="currentColor" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="none"></rect>
          <path d="M239.2,97.8a8,8,0,0,0-6.3-5.5l-64.1-9.3L140.9,23.5a8,8,0,0,0-14.8,0L87.2,83l-64.1,9.3a8,8,0,0,0-4.4,13.7l46.4,45.2L52.2,216a8,8,0,0,0,11.6,8.4L128,195.4l64.2,29a8,8,0,0,0,11.6-8.4l-12.9-65.8,46.4-45.2A8,8,0,0,0,239.2,97.8Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" fill="none"></path>
        </svg>
      `;

      popularAnchor.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!juegosContainer) return;

        if (!modoTopRated) {
          popularText.textContent = "Top Rated";
          popularIconContainer.innerHTML = svgStar;
          if (tituloPrincipal) tituloPrincipal.textContent = "Los juegos más jugados";
          modoTopRated = true;
          juegosContainer.innerHTML = "<h2>Cargando juegos más jugados...</h2>";

          try {
            const url = `https://api.rawg.io/api/games?key=${API_KEY}&ordering=-added&page_size=6`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al cargar los juegos populares");
            const data = await response.json();
            juegosContainer.innerHTML = "";
            for (const game of data.results) {
              const detailsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}?key=${API_KEY}`);
              if (!detailsResponse.ok) continue;
              const gameDetails = await detailsResponse.json();
              const gameCard = crearTarjetaJuego(game, gameDetails);
              juegosContainer.appendChild(gameCard);
            }
          } catch (error) {
            console.error(error);
            juegosContainer.innerHTML = "<h3>Error al cargar los juegos más jugados</h3>";
          }
        } else {
          popularText.textContent = "Popular";
          popularIconContainer.innerHTML = svgOriginal;
          if (tituloPrincipal) tituloPrincipal.textContent = "Los mejores juegos del último año";
          modoTopRated = false;
          if (typeof buscarYMostrarJuegos === "function") {
            buscarYMostrarJuegos();
          }
        }
      });
    }
}

/***********************************
 * LÓGICA DE LA PÁGINA DE DETALLE (side.html)
 ***********************************/
async function juegoSide() {
  const juegoArriba = document.getElementById('juegoArriba');
  if (!juegoArriba) return;

  try {
    const gameId = getSelectedGameId();
    if (!gameId) {
      console.warn("No hay ID de juego guardado en sessionStorage");
      return;
    }
    const url = `https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`;
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
    
    juegoArriba.querySelector('h1').textContent = firstGame.name;
    juegoArriba.querySelector('.nota').textContent = `Rating: ${firstGame.rating}`;
    const descripcion = detailsData.description_raw || 'Sin descripción disponible';
    const descripcionCorta = cortarTexto(descripcion, 550);
    juegoArriba.querySelector('.descripcion').innerHTML = descripcionCorta;

    const detalles = document.getElementById('detallesJuegos');
    if (detalles) {
      detalles.innerHTML = `<h2>${firstGame.name}</h2>
                      <p><strong>Release date:</strong> ${firstGame.released || 'Sin fecha'}</p>
                      <p><strong>Genre:</strong> ${firstGame.genres.map(g => g.name).join(', ')}</p>
                      <p><strong>Developer:</strong> ${firstGame.developers?.[0]?.name || 'Desconocido'}</p>
                      <p><strong>Minimum requirements:</strong></p>
                      <p>${detailsData.platforms?.[0]?.requirements?.minimum || 'No disponibles'}</p>
                      <p><strong>Recomended requierements:</strong></p>
                      <p>${detailsData.platforms?.[0]?.requirements?.recommended || 'No disponibles'}</p>`;
    }

    const steamBtn = document.querySelector('.boton-steam');
    if (steamBtn && firstGame) {
      let steamUrl = "";
      const steamStore = Array.isArray(firstGame.stores) ? firstGame.stores.find(s => s.store?.slug === 'steam') : null;

      if (steamStore?.url) {
        steamUrl = steamStore.url;
      } else if (firstGame.name) {
        steamUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(firstGame.name)}`;
      } else {
        steamUrl = "https://store.steampowered.com/";
      }
      steamBtn.setAttribute('href', steamUrl);
    }
  } catch (error) {
    console.error('Error al cargar el juego:', error);
  }
}

async function CarrouselJuegoSide() {
  const carouselId = "carouselJuegoSide";
  const carouselIndicators = document.getElementById("carousel-indicators-side");
  const carouselInner = document.getElementById("carousel-inner-side");
  const carouselEl = document.getElementById(carouselId);

  if (!carouselIndicators || !carouselInner || !carouselEl) return;

  carouselIndicators.innerHTML = "";
  carouselInner.innerHTML = "";

  try {
    const gameId = getSelectedGameId();
    if (!gameId) return;

    const res = await fetch(`https://api.rawg.io/api/games/${gameId}/screenshots?key=${API_KEY}`);
    if (!res.ok) throw new Error(`Error en la API: ${res.statusText}`);
    const data = await res.json();

    let screenshots = Array.isArray(data.results) ? data.results : [];

    if (screenshots.length === 0) {
      const fallback = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`);
      if (fallback.ok) {
        const gameData = await fallback.json();
        if (gameData.background_image) {
          screenshots = [{ image: gameData.background_image }];
        }
      }
    }

    if (screenshots.length === 0) {
      carouselInner.innerHTML = `<div class="carousel-item active"><div class="p-4 text-center">No hay imágenes disponibles.</div></div>`;
      return;
    }

    screenshots.forEach((shot, index) => {
      const isActive = index === 0;
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

    const prevInstance = bootstrap.Carousel.getInstance(carouselEl);
    if (prevInstance) prevInstance.dispose();

    new bootstrap.Carousel(carouselEl, {
      interval: 4000,
      ride: true,
      wrap: true,
      pause: false
    }).cycle();

  } catch (err) {
    console.error("Error cargando el carrusel:", err);
    carouselInner.innerHTML = `<div class="carousel-item active"><div class="p-4 text-center text-danger">Error al cargar imágenes.</div></div>`;
  }
}