// Selectores
const listaCursos = document.querySelector("#lista-cursos");
const carrito = document.querySelector("#carrito");
const listaArticulos = document.querySelector("#lista-carrito tbody");
const botonVaciar = document.querySelector("#vaciar-carrito");
const imgUsuario = document.getElementById("img-usuario");
const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("email");
const form = document.getElementById("crear-cuenta");
let usuario = {
    nombre: "",
    email: "",
};
let db;

// Listeners
document.addEventListener("DOMContentLoaded", () => {
    iniciarDB();
    botonVaciar.addEventListener("click", vaciarCarritoDB);
    listaCursos.addEventListener("click", agregarCarrito);
    imgUsuario.addEventListener("click", () => {
        window.location.href = "login.html";
    });
    nombreInput.addEventListener("blur", validarNombre);
    emailInput.addEventListener("blur", validarEmail);
    form.addEventListener("submit", envioUsuario);
});

// Funciones
function iniciarDB() {
    const request = indexedDB.open("CursosDB", 1);

    // Ejecutado si la base de datos necesita una actualización
    request.onupgradeneeded = (event) => {
        db = event.target.result;

        // Crear un almacén para el carrito
        if (!db.objectStoreNames.contains("carrito")) {
            db.createObjectStore("carrito", { keyPath: "id" });
        }

        // Crear un almacén para favoritos
        if (!db.objectStoreNames.contains("favoritos")) {
            db.createObjectStore("favoritos", { keyPath: "id" });
        }

        // Crear un almacén para usuarios
        if (!db.objectStoreNames.contains("usuarios")) {
            db.createObjectStore("usuarios", { keyPath: 'email' });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("Base de datos iniciada correctamente");
        cargarCarritoDB();
    };

    request.onerror = (event) => {
        console.error("Error al abrir la base de datos", event);
    };
}

function leerDatosCurso(curso) {
    return {
        id: curso.querySelector("a.agregar-carrito").getAttribute("data-id"),
        img: curso.querySelector("img").src,
        info: curso.querySelector("h4").textContent,
        precio: curso.querySelector(".precio span").textContent,
        cantidad: 1, // Añadido para definir la cantidad inicial
    };
}

function agregarCarrito(e) {
    if (e.target.classList.contains("agregar-carrito")) {
        const curso = e.target.parentElement.parentElement;
        const datosCurso = leerDatosCurso(curso);
        agregarCursoDB(datosCurso);
    }
}

// CRUD DB
function agregarCursoDB(curso) {
    const transaction = db.transaction(["carrito"], "readwrite");
    const carritoStore = transaction.objectStore("carrito");

    const request = carritoStore.get(curso.id);

    request.onsuccess = (event) => {
        const cursoExistente = event.target.result;

        if (cursoExistente) {
            cursoExistente.cantidad += 1;
            carritoStore.put(cursoExistente);
        } else {
            carritoStore.add(curso);
        }
        actualizarHTMLCarrito();
    };

    request.onerror = (event) => {
        console.error("Error al agregar curso a IndexedDB", event);
    };
}

function eliminarCursoDB(id) {
    const transaction = db.transaction(["carrito"], "readwrite");
    const carritoStore = transaction.objectStore("carrito");

    carritoStore.delete(id).onsuccess = () => {
        actualizarHTMLCarrito();
    };

    carritoStore.delete(id).onerror = (event) => {
        console.error("Error al eliminar curso de IndexedDB", event);
    };
}

function cargarCarritoDB() {
    const transaction = db.transaction(["carrito"], "readonly");
    const carritoStore = transaction.objectStore("carrito");

    const request = carritoStore.getAll();

    request.onsuccess = (event) => {
        const cursosEnCarrito = event.target.result;
        cursosEnCarrito.forEach(curso => agregarCursoHTML(curso));
    };

    request.onerror = (event) => {
        console.error("Error al cargar cursos desde IndexedDB", event);
    };
}

function agregarCursoHTML(curso) {
    let fila = document.createElement("tr");

    let celdaImagen = document.createElement("td");
    let imagen = document.createElement("img");
    imagen.src = curso.img;
    imagen.width = 80;
    celdaImagen.appendChild(imagen);

    let celdaNombre = document.createElement("td");
    celdaNombre.textContent = curso.info;

    let celdaPrecio = document.createElement("td");
    celdaPrecio.textContent = curso.precio;

    let celdaCantidad = document.createElement("td");
    celdaCantidad.textContent = curso.cantidad;

    const botonBorrado = document.createElement("td");
    const boton = document.createElement("a");
    boton.classList.add("borrar-curso");
    boton.textContent = "x";
    boton.addEventListener("click", () => {
        eliminarCursoDB(curso.id);
    });
    botonBorrado.appendChild(boton);

    fila.appendChild(celdaImagen);
    fila.appendChild(celdaNombre);
    fila.appendChild(celdaPrecio);
    fila.appendChild(celdaCantidad);
    fila.appendChild(botonBorrado);

    listaArticulos.appendChild(fila);
}

function actualizarHTMLCarrito() {
    limpiarHTML();
    cargarCarritoDB();
}

function vaciarCarritoDB() {
    const transaction = db.transaction(["carrito"], "readwrite");
    const carritoStore = transaction.objectStore("carrito");

    const request = carritoStore.clear();

    request.onsuccess = () => {
        console.log("Carrito vaciado");
        actualizarHTMLCarrito();
    };

    request.onerror = (event) => {
        console.error("Error al vaciar carrito en IndexedDB", event);
    };
}

function limpiarHTML() {
    while (listaArticulos.firstChild) {
        listaArticulos.removeChild(listaArticulos.firstChild);
    }
}
 // AGREGAR CUENTA DE USUARIO
// Funciones de validación
function validarNombre() {
    limpiarError("nombre");
    const nombre = nombreInput.value.trim();
    if (!nombre) {
        mostrarError("El campo nombre es obligatorio", "nombre");
        return false;
    }
    return true;
}

function validarEmail() {
    limpiarError("email");
    const email = emailInput.value.trim();
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        mostrarError("El campo email no es válido", "email");
        return false;
    }
    return true;
}

// Agregar usuario a la base de datos
function agregarUsuarioDB(usuario) {
    const transaction = db.transaction(["usuarios"], "readwrite");
    const usuariosStore = transaction.objectStore("usuarios");

    const request = usuariosStore.add(usuario);

    request.onsuccess = () => {
        console.log("Usuario agregado a la base de datos");
        alert("Cuenta creada con éxito.");
        form.reset();
        limpiarUsuario();
        window.location.href = "login.html";
    };

    request.onerror = (event) => {
        console.error("Error al agregar usuario a la base de datos", event);
    };
}

// Función para validar el formulario al enviar
function envioUsuario(e) {
    e.preventDefault();

    const nombreValido = validarNombre();
    const emailValido = validarEmail();

    if (nombreValido && emailValido) {
        usuario.nombre = nombreInput.value.trim();
        usuario.email = emailInput.value.trim();
        agregarUsuarioDB(usuario);
    }
}

// Función para mostrar errores
function mostrarError(mensaje, campo) {
    const campoElemento = document.getElementById(campo);
    const error = document.createElement("p");
    error.textContent = mensaje;
    error.classList.add("error", "text-red-600", "text-sm");
    campoElemento.parentElement.appendChild(error);
}

// Función para limpiar errores
function limpiarError(campo) {
    const campoElemento = document.getElementById(campo);
    const error = campoElemento.parentElement.querySelector(".error");
    if (error) {
        error.remove();
    }
}

// Función para limpiar el objeto usuario
function limpiarUsuario() {
    usuario = {
        nombre: "",
        email: "",
    };
}
