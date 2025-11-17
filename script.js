// ----------------------------------------------------------------
// 1. DATOS DE GALERÍA Y ORGANIZACIÓN POR CATEGORÍA
// ----------------------------------------------------------------

const projects = [
    // Las rutas de las imágenes son relativas a la carpeta 'assets/'
    // CATEGORÍA: Photographies (Imágenes 1 y 2)
    { title: "Neon Portrait", description: "Fotografía con iluminación dramática y tonos neón.", src: "assets/IMG_20240305_095608_961.jpg", category: "Photographies" },
    { title: "Chromatic Glitch", description: "Edición fotográfica con efecto glitch y aberración cromática.", src: "assets/IMG_20240305_100234_621.jpg", category: "Photographies" },
    
    // CATEGORÍA: The neon files (Imágenes 3, 7, 8 y 10)
    { title: "Padmé Neon Art", description: "Ilustración digital de personaje con enfoque en luces y sombras neón.", src: "assets/padmé.png", category: "The neon files" },
    { title: "Miku Cyberpunk", description: "Diseño de personaje Miku Hatsune con estética cyberpunk futurista.", src: "assets/Miku.jpg", category: "The neon files" },
    { title: "Jett Valorant", description: "Diseño conceptual de Jett (Valorant) en un entorno de neón.", src: "assets/jett.jpg", category: "The neon files" },
    { title: "Doja Cat Retrowave", description: "Retrato de Doja Cat con filtro retrowave y paleta de colores vibrante.", src: "assets/Doja.png", category: "The neon files" },

    // CATEGORÍA: Alternative core (Imágenes 5, 6 y 9)
    { title: "P&Y Brutalist", description: "Diseño de cartel con tipografía brutalista y composición asimétrica.", src: "assets/p&y.jpg", category: "Alternative core" },
    { title: "Miku PNG Core", description: "Gráfico experimental de Miku con elementos visuales alternativos.", src: "assets/Miku.png", category: "Alternative core" },
    { title: "Beck Pop Art", description: "Obra de arte inspirada en Beck con estilo Pop Art y colores saturados.", src: "assets/Beck.png", category: "Alternative core" },

    // CATEGORÍA: The legendarium (Imagen 4)
    { title: "The Legendarium Cover", description: "Diseño de portada para novela de fantasía oscura o cómic.", src: "assets/Portada1.jpg", category: "The legendarium" }
];


// ----------------------------------------------------------------
// 2. CONTROL DE SECCIONES (Navegación del menú)
// ----------------------------------------------------------------
let landingActive = true; 

function showLandingPage() {
    const landingPage = document.getElementById('landing-page');
    const contentDisplay = document.getElementById('content-display');
    
    contentDisplay.style.display = 'none';
    landingPage.style.display = 'flex'; 
    landingActive = true;

    document.querySelectorAll('.section-container').forEach(section => {
        section.style.display = 'none';
        section.style.opacity = '0';
    });
}


function showSection(sectionId) {
    const landingPage = document.getElementById('landing-page');
    const contentDisplay = document.getElementById('content-display');
    const allSections = document.querySelectorAll('.section-container');
    const overlay = document.getElementById('content-display-overlay');

    if (landingActive) {
        landingPage.style.display = 'none';
        contentDisplay.style.display = 'block';
        landingActive = false;
    }
    
    // Ocultar todas las secciones para la transición
    allSections.forEach(section => {
        section.style.opacity = '0'; 
        section.style.display = 'none';
    });

    // 1. Iniciar el overlay en posición de inicio (derecha)
    overlay.style.transform = 'translateX(0)';

    // 2. Disparar el slide con un pequeño retraso para asegurar que el CSS sepa la posición inicial
    setTimeout(() => {
        // Ejecutar el slide (morado a negro)
        overlay.style.transform = 'translateX(-100%)';
    }, 10); // Retraso mínimo

    // 3. Esperar a que termine la transición (0.6s en CSS) y mostrar el contenido
    setTimeout(() => {
        // 3a. Resetear el overlay para la próxima vez
        overlay.style.transform = 'translateX(100%)';

        // 3b. Mostrar la sección destino
        const targetSection = document.getElementById(sectionId);
        targetSection.style.display = (sectionId === 'about-me') ? 'grid' : 'block'; 
        
        // 3c. Aplicar el fade-in
        setTimeout(() => {
            targetSection.style.opacity = '1';
        }, 50); // Pequeño retraso para que el fade-in sea visible

        if (sectionId === 'gallery' && !document.getElementById('gallery-grid').children.length) {
            renderGallery();
        }
    }, 650); // 650ms (ligeramente más largo que la transición CSS de 0.6s)
}


// ----------------------------------------------------------------
// 3. FUNCIONALIDAD DE GALERÍA Y FILTROS
// ----------------------------------------------------------------

function renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryFilters = document.getElementById('gallery-filters');
    galleryGrid.innerHTML = '';
    galleryFilters.innerHTML = '';

    const categories = ["All", ...new Set(projects.map(item => item.category))];

    // Crear botones de filtro
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = category;
        button.onclick = () => filterGallery(category);
        galleryFilters.appendChild(button);
    });

    // Mostrar todos los proyectos por defecto y activar "All"
    filterGallery("All");
}

function filterGallery(category) {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';

    // Gestión del estado 'active' del botón
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`.filter-btn[onclick*="${category}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    const filteredProjects = category === "All" ? projects : projects.filter(item => item.category === category);

    filteredProjects.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';
        const originalIndex = projects.findIndex(p => p === item); 
        itemDiv.onclick = () => openViewer(originalIndex);

        itemDiv.innerHTML = `
            <img src="${item.src}" alt="${item.title}" class="preview-image"/>
            <div class="overlay">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        `;
        galleryGrid.appendChild(itemDiv);
    });
}


// ----------------------------------------------------------------
// 4. FUNCIONALIDAD DE ZOOM Y PANEO
// ----------------------------------------------------------------

const viewer = document.getElementById('viewer');
const fullImage = document.getElementById('full-image');
let currentIndex = 0;
let scale = 1.0;
let origin = {x:0, y:0};
let isPanning = false;
let start = {x:0, y:0};
let panEnabled = false; 

function applyTransform() {
    fullImage.style.transform = `translate(${origin.x}px, ${origin.y}px) scale(${scale})`;
}

function openViewer(index) {
    currentIndex = index;
    fullImage.src = projects[index].src;
    viewer.classList.add('open');
    scale = 1.0;
    origin = {x:0, y:0};
    applyTransform();
    document.getElementById('imgwrap').style.cursor = 'grab';
}

function closeViewer() {
    viewer.classList.remove('open');
    isPanning = false;
    panEnabled = false;
}

function navigateGallery(direction) {
    const newIndex = (currentIndex + direction + projects.length) % projects.length;
    openViewer(newIndex);
}

// Listener para el zoom con la rueda del ratón
document.getElementById('imgwrap').addEventListener('wheel', (e) => {
    if (!viewer.classList.contains('open')) return;
    e.preventDefault();
    
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(1, scale + delta), 4.0);

    const rect = fullImage.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    
    const currentOriginX = origin.x - (cursorX / scale);
    const currentOriginY = origin.y - (cursorY / scale);
    
    const scaleFactor = newScale / scale;
    
    origin.x = currentOriginX * scaleFactor + (cursorX / newScale);
    origin.y = currentOriginY * scaleFactor + (cursorY / newScale);
    
    scale = newScale;
    applyTransform();
});

// Manejo del Paneo (Movimiento con la barra espaciadora)
document.addEventListener('keydown', (e)=>{
  if(e.code === 'Space'){
    e.preventDefault();
    if (viewer.classList.contains('open')) {
        panEnabled = true;
        document.getElementById('imgwrap').style.cursor = 'grabbing';
    }
  }
});

document.addEventListener('keyup', (e)=>{
  if(e.code === 'Space'){
    if (viewer.classList.contains('open')) {
        panEnabled = false;
        document.getElementById('imgwrap').style.cursor = 'grab';
    }
  }
});

// MOUSE DOWN para iniciar el arrastre
document.getElementById('imgwrap').addEventListener('mousedown', function(e){
  if(!panEnabled || !viewer.classList.contains('open')) return;
  isPanning = true;
  start = {x:e.clientX, y:e.clientY};
  this.style.cursor = 'grabbing';
});

// MOUSE MOVE para mover
document.addEventListener('mousemove', function(e){
  if(!isPanning || !viewer.classList.contains('open')) return;
  const dx = (e.clientX - start.x) / scale;
  const dy = (e.clientY - start.y) / scale;
  origin.x += dx;
  origin.y += dy;
  start = {x:e.clientX, y:e.clientY};
  applyTransform();
});

// MOUSE UP para detener el arrastre
document.addEventListener('mouseup', function(e){
  if(isPanning){ 
      isPanning=false; 
      document.getElementById('imgwrap').style.cursor='grab'; 
  }
});

// Navegación por teclado (Flechas)
document.addEventListener('keydown', (e)=>{
  if(viewer.classList.contains('open')){
    if(e.key === 'ArrowRight'){ navigateGallery(1); }
    if(e.key === 'ArrowLeft'){ navigateGallery(-1); }
  }
});