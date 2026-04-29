// ===================== DATOS BASE =====================
const serviciosBase = [
  { titulo: "Plomería", desc: "Reparaciones en casa", categoria:"Hogar", ubicacion: "Bogotá", usuario: "Juan", rating: 4 },
  { titulo: "Electricista", desc: "Instalaciones eléctricas", categoria:"Hogar", ubicacion: "Medellín", usuario: "Ana", rating: 5 },
  { titulo: "Clases de inglés", desc: "Clases personalizadas", categoria:"Educación", ubicacion: "Cali", usuario: "Laura", rating: 4 }
];

// ===================== AUTH =====================
function login(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const rol = document.getElementById("rol").value;

  if (!nombre || !rol) {
    alert("Completa todos los campos");
    return;
  }

  localStorage.setItem("usuario", JSON.stringify({ nombre, rol }));
  alert("Bienvenido " + nombre);
  window.location.href = "index.html";
}

function mostrarUsuario() {
  const nav = document.getElementById("userInfo");
  const data = localStorage.getItem("usuario");

  if (!nav) return;

  if (!data) {
    nav.innerHTML = `<a class="btn btn-light me-2" href="login.html">Login</a>`;
    return;
  }

  const user = JSON.parse(data);
  nav.innerHTML = `
    <span class="text-white me-2">${user.nombre} (${user.rol})</span>
    <a class="btn btn-light me-2" href="servicios.html">Servicios</a>
    ${user.rol === "trabajador" ? `<a class="btn btn-primary me-2" href="publicar.html">Publicar</a>` : ""}
    <button class="btn btn-danger btn-sm" onclick="logout()">Salir</button>
  `;
}

function logout() {
  localStorage.removeItem("usuario");
  location.reload();
}

// ===================== BÚSQUEDA =====================
function buscar() {
  const texto = document.getElementById("searchInput").value;
  const ubicacion = document.getElementById("ubicacionInput").value;
  const categoria = document.getElementById("categoriaInput").value;

  localStorage.setItem("busqueda", JSON.stringify({ texto, ubicacion, categoria }));
  window.location.href = "servicios.html";
}

// ===================== LISTADO =====================
function mostrarServicios() {
  const contenedor = document.getElementById("listaServicios");
  if (!contenedor) return;

  const filtros = JSON.parse(localStorage.getItem("busqueda")) || {};
  const serviciosGuardados = JSON.parse(localStorage.getItem("servicios")) || [];

  const todos = [...serviciosBase, ...serviciosGuardados];

  const filtrados = todos.filter(s =>
    (!filtros.texto || s.titulo.toLowerCase().includes(filtros.texto.toLowerCase())) &&
    (!filtros.ubicacion || s.ubicacion.toLowerCase().includes(filtros.ubicacion.toLowerCase())) &&
    (!filtros.categoria || s.categoria.toLowerCase().includes(filtros.categoria.toLowerCase()))
  );

  if (filtrados.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron resultados</p>";
    return;
  }

  contenedor.innerHTML = filtrados.map(s => `
    <div class="col-md-4">
      <div class="card p-3 mb-4">
        <h5>${s.titulo}</h5>
        <p>${s.desc}</p>
        <small>${s.ubicacion} - ${s.usuario}</small>
        <div class="stars">${"⭐".repeat(s.rating || 4)}</div>

        <button class="btn btn-success mt-2" onclick="contactar('${s.usuario}')">Contactar</button>
        <button class="btn btn-outline-primary mt-2" onclick="verPerfil('${s.usuario}')">Ver perfil</button>
      </div>
    </div>
  `).join("");
}

// ===================== PUBLICAR =====================
function publicar(e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const categoria = document.getElementById("categoria").value;
  const ubicacion = document.getElementById("ubicacion").value;

  const user = JSON.parse(localStorage.getItem("usuario") || "{}");

  if (!titulo || !descripcion || !categoria || !ubicacion) {
    alert("Completa todos los campos");
    return;
  }

  const nuevo = {
    titulo,
    desc: descripcion,
    categoria,
    ubicacion,
    usuario: user.nombre || "Anónimo",
    rating: 5
  };

  const lista = JSON.parse(localStorage.getItem("servicios")) || [];
  lista.push(nuevo);
  localStorage.setItem("servicios", JSON.stringify(lista));

  alert("Servicio publicado 🚀");
  window.location.href = "servicios.html";
}

// ===================== PERFIL =====================
function verPerfil(nombre) {
  localStorage.setItem("perfil", nombre);
  window.location.href = "perfil.html";
}

// ===================== CONTACTO =====================
function contactar(nombre) {
  const mensaje = prompt("Mensaje para " + nombre);
  if (mensaje) {
    alert("Mensaje enviado a " + nombre + ": " + mensaje);
  }
}