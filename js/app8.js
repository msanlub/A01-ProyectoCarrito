// Selectores
//cursos
const listaCursos = document.querySelector("#lista-cursos");
const carrito = document.querySelector("#carrito");
const listaArticulos = document.querySelector("#lista-carrito tbody");
const botonVaciar = document.querySelector("#vaciar-carrito");
//usuario
const imgUsuario = document.querySelector("#img-usuario");
const nombreInput = document.querySelector("#nombre");
const emailInput = document.querySelector("#email");
const passInput = document.querySelector("#pass");
const form = document.querySelector("#crear-cuenta-form");
//login
const formLogin = document.querySelector("#inicio-sesion-form");
//favoritos
const botonQuitarFavorito = document.querySelectorAll(".quitar-favorito");
const botonesFavoritos = document.querySelectorAll(".favorite-button");

let usuario = {
    nombre: "",
    email: "",
    pass: ""
};
let db;

// Listeners
document.addEventListener("DOMContentLoaded", () => {
    iniciarDB();

    // Eventos para index
    botonVaciar.addEventListener("click", vaciarCarritoDB);
    listaCursos.addEventListener("click", agregarCarrito);
    imgUsuario.addEventListener("click", () => {
        window.location.href = "login.html";
    });

    // Eventos para crear-cuenta
    form.addEventListener("submit", envioUsuario);
    document.getElementById("nombre").addEventListener("blur", validarCampoNombre);
    document.getElementById("email").addEventListener("blur", validarCampoEmail);
    document.getElementById("pass").addEventListener("blur", validarCampoPass);

    // Eventos para login
    formLogin.addEventListener("submit", verificarCredenciales);

    // Eventos para favoritos
    cargarFavoritosDB();
    botonQuitarFavorito.forEach(boton => {
        boton.addEventListener("click", quitarFavorito);
    });
    botonesFavoritos.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const cursoId = e.target.closest("button").getAttribute("data-id");
            agregarFavoritos(cursoId);
        });
    });

});


// Funciones
/**
 * Inicializa la base de datos indexedDB con tres almacenes diferentes (carrito,usuario,favoritos)
 */
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

// FUNCIONES CARRITO CRUD

/**
 *  Desglosa los datos de cada curso seleccionado para el carrito
 * @param {Object} curso 
 * @returns 
 */
function leerDatosCurso(curso) {
    return {
        id: curso.querySelector("a.agregar-carrito").getAttribute("data-id"),
        img: curso.querySelector("img").src,
        info: curso.querySelector("h4").textContent,
        precio: curso.querySelector(".precio span").textContent,
        cantidad: 1,
    };
}

/**
 * Define el evento al agregar un curso a carrito, llamando a agregar curso DB
 * @param {event} e 
 */
function agregarCarrito(e) {
    if (e.target.classList.contains("agregar-carrito")) {
        const curso = e.target.parentElement.parentElement;
        const datosCurso = leerDatosCurso(curso);
        agregarCursoDB(datosCurso);
    }
}

/**
 * Añade el curso a la db, en el almacen de carrito
 * @param {Object} curso 
 */
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

/**
 * Mediante el parametro id del curso, elimina un curso de la db
 * @param {Parameters} id 
 */
function eliminarCursoDB(id) {
    const transaction = db.transaction(["carrito"], "readwrite");
    const carritoStore = transaction.objectStore("carrito");

    const request = carritoStore.get(id);

    request.onsuccess = (event) => {
        const cursoExistente = event.target.result;

        if (cursoExistente) {
            if (cursoExistente.cantidad > 1) {
                cursoExistente.cantidad -= 1;
                carritoStore.put(cursoExistente);
            } else {
                carritoStore.delete(id);
            }
        }
        actualizarHTMLCarrito();
    };

    carritoStore.delete(id).onerror = (event) => {
        console.error("Error al eliminar curso de IndexedDB", event);
    };
}

/**
 * Lee la info de un curso de carrito de la db
 */
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

/**
 * Crea los elementos necesarios para mostrar en la interfaz el curso seleccionado de la db
 * @param {Object} curso 
 */
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

/**
 * limpia y actualiza el carrito de compra cuando se elimina o se añade cursos
 */
function actualizarHTMLCarrito() {
    limpiarHTML();
    cargarCarritoDB();
}

/**
 * Elimina el carrito por completo  de la db
 */
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

/**
 * Limpia el carrito de la interfaz de usuario
 */
function limpiarHTML() {
    while (listaArticulos.firstChild) {
        listaArticulos.removeChild(listaArticulos.firstChild);
    }
}

// FUNCIONES USUARIO CRUD
/**
 * Valida si nombre no está vacío
 * @returns Boolean
 */
function validarCampoNombre() {
    limpiarError("nombre");
    const nombre = document.getElementById("nombre").value.trim();
    if (!nombre) {
        mostrarError("El campo nombre es obligatorio", "nombre");
        return false;
    }
    return true;
}

/**
 * Validación del campo email, devuelve true cuando es formato correcto
 * @returns Boolean
 */
function validarCampoEmail() {
    limpiarError("email");
    const email = document.getElementById("email").value.trim();
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        mostrarError("El campo email no es válido", "email");
        return false;
    }
    return true;
}

/**
 * Valida si contraseña no está vacío y tiene más de 8 caracteres
 * @returns Boolean
 */
function validarCampoPass() {
    limpiarError("pass");
    const passw = document.getElementById("pass").value.trim();
    if (!passw || passw.length < 8) {  
        mostrarError("El campo contraseña debe tener mínimo 8 caracteres", "pass");
        return false;
    }
    return true;
}

/**
 * Valida si el formulario es correcto y llama a la funcion para añadir al usuario con nuevos datos a la db
 * @param {event} e 
 */
function envioUsuario(e) {
    e.preventDefault(); 

    // Validar los campos
    const nombreValido = validarCampoNombre();
    const emailValido = validarCampoEmail();
    const passValido = validarCampoPass();

    // Si todo es válido crea el usuario y lo añade a la db
    if (nombreValido && emailValido && passValido) {
        const usuario = {
            nombre: document.getElementById("nombre").value.trim(),
            email: document.getElementById("email").value.trim(),
            contraseña: document.getElementById("pass").value.trim() 
        };

        agregarUsuarioDB(usuario);

        document.getElementById("formulario").reset(); 
        limpiarUsuario(); 
    }
}


/**
 * Añade el nuevo usuario a la db en el almacén usuarios
 * @param {object} usuario 
 */
function agregarUsuarioDB(usuario) {
    const transaction = db.transaction(["usuarios"], "readwrite");
    const usuariosStore = transaction.objectStore("usuarios");

    const request = usuariosStore.get(usuario.email); 

    request.onsuccess = function(event) {
        const usuarioExistente = event.target.result;

        if (usuarioExistente) {
            alert("El usuario ya existe.");
        } else {
            const addRequest = usuariosStore.add(usuario);

            addRequest.onsuccess = function() {
                console.log("Usuario agregado:", usuario.nombre);
                limpiarUsuario();
                window.location.href = "login.html"; 
            };

            addRequest.onerror = function(event) {
                console.error("Error al agregar el usuario:", event.target.error);
            };
        }
    };

    request.onerror = function(event) {
        console.error("Error al verificar si el usuario existe:", event.target.error);
    };
}

/**
 * Muestra el error de validación si hubiera
 * @param {String} mensaje 
 * @param {Parameters} campo 
 */
function mostrarError(mensaje, campo) {
    const campoElemento = document.getElementById(campo);
    const error = document.createElement("p");
    error.textContent = mensaje;
    error.classList.add("error", "text-red-600", "text-sm");
    campoElemento.parentElement.appendChild(error);
}

/**
 * Limpia el error corregido
 * @param {Parameters} campo 
 */
function limpiarError(campo) {
    const campoElemento = document.getElementById(campo);
    const error = campoElemento.parentElement.querySelector(".error");
    if (error) {
        error.remove();
    }
}

/**
 * Limpia el objeto usuario una vez de añade a la base de datos para futuras necesidades
 */
function limpiarUsuario() {
    usuario = {
        nombre: "",
        email: "",
        contraseña: ""
    };
}


//FUNCIONES DE LOGIN
/**
 * Define el evento que una vez validada la contraseña pueda acceder a su cuenta
 * @param {event} e 
 */
function verificarCredenciales(e) {
    e.preventDefault();

    const email = document.querySelector("#username").value.trim();
    const password = document.querySelector("#password").value.trim();

    if (!email || !password) {
        mostrarMensajeError("Todos los campos son obligatorios.");
        return;
    }

    const transaction = db.transaction(["usuarios"], "readonly");
    const usuariosStore = transaction.objectStore("usuarios");

    const request = usuariosStore.get(email);

    request.onsuccess = function(event) {
        const usuario = event.target.result;

        if (usuario) {
            if (usuario.contraseña === password) {
                console.log("Inicio de sesión exitoso");
                window.location.href = "favoritos.html"; 
            } else {
                mostrarMensajeError("Contraseña incorrecta.");
            }
        } else {
            mostrarMensajeError("El usuario no existe.");
        }
    };

    request.onerror = function(event) {
        console.error("Error al verificar las credenciales:", event.target.error);
        mostrarMensajeError("Hubo un error al iniciar sesión. Inténtalo de nuevo.");
    };
}

/**
 * Muestra error si no es correcta la validacion de contraseña
 * @param {String} mensaje 
 */
function mostrarMensajeError(mensaje) {
    const errorDiv = document.createElement("p");
    errorDiv.textContent = mensaje;
    errorDiv.classList.add("error", "text-red-600", "text-sm");
    const form = document.querySelector("#inicio-sesion-form");
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

//FUNCIONES DE FAVORITOS
/**
 * Define el evento que crea un objeto curso para agregarlo a favoritos, llamando a la funcion agregar a db
 * @param {event} e 
 */
function agregarFavoritos(e) {
    if (e.target.closest(".favorite-button")) {
        const curso = e.target.closest(".card");
        const cursoData = {
            id: curso.getAttribute("data-id"),
            img: curso.querySelector("img").src,
            info: curso.querySelector(".info").textContent,
            precio: curso.querySelector(".precio").textContent,
            cantidad: 1 
        };

        agregarCursoFavoritosDB(cursoData);
    }
}

/**
 * Añade el curso a la db al almacen de favoritos
 * @param {object} curso 
 */
function agregarCursoFavoritosDB(curso) {
    const transaction = db.transaction(["favoritos"], "readwrite");
    const favoritosStore = transaction.objectStore("favoritos");

    const request = favoritosStore.add(curso);

    request.onsuccess = () => {
        console.log("Curso agregado a favoritos");
    };

    request.onerror = (event) => {
        console.error("Error al agregar curso a favoritos", event);
    };
}

/**
 * Muestra la lista de cursos favoritos, creando los elementos necesarios HTML
 * @param {object} curso 
 */
function agregarCursoFavoritosHTML(curso) {
    let fila = document.createElement("tr");

    // Celda para la imagen
    let celdaImagen = document.createElement("td");
    let imagen = document.createElement("img");
    imagen.src = curso.img;
    imagen.width = 80;
    celdaImagen.appendChild(imagen);

    // Celda para el nombre del curso
    let celdaNombre = document.createElement("td");
    celdaNombre.textContent = curso.info;

    // Celda para el precio
    let celdaPrecio = document.createElement("td");
    celdaPrecio.textContent = curso.precio;

    // Botón de eliminación
    const celdaBorrado = document.createElement("td");
    const botonEliminar = document.createElement("button");
    botonEliminar.classList.add("eliminar-favorito");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => {
        eliminarCursoFavoritosDB(curso.id);
        fila.remove(); // Eliminar la fila del HTML
    });
    celdaBorrado.appendChild(botonEliminar);

    // Agregar celdas a la fila
    fila.appendChild(celdaImagen);
    fila.appendChild(celdaNombre);
    fila.appendChild(celdaPrecio);
    fila.appendChild(celdaBorrado);

    // Agregar fila a la tabla
    document.querySelector("#lista-favoritos tbody").appendChild(fila);
}

/**
 * Elimina un curso de favoritos segun su id
 * @param {Parameters} id 
 */
function eliminarCursoFavoritosDB(id) {
    const transaction = db.transaction(["favoritos"], "readwrite");
    const favoritosStore = transaction.objectStore("favoritos");

    const request = favoritosStore.delete(id);

    request.onsuccess = () => {
        console.log(`Curso con ID ${id} eliminado de favoritos`);
    };

    request.onerror = (event) => {
        console.error("Error al eliminar curso de favoritos", event);
    };
}

/**
 * Carga la info de un curso de favoritos para posteriormente mostrarlo en la interfaz
 */
function cargarFavoritosDB() {
    const transaction = db.transaction(["favoritos"], "readonly");
    const favoritosStore = transaction.objectStore("favoritos");

    const request = favoritosStore.getAll();

    request.onsuccess = (event) => {
        const cursosEnFavoritos = event.target.result;
        if (cursosEnFavoritos.length === 0) {
            console.log("No hay cursos en favoritos");
        }
        cursosEnFavoritos.forEach(curso => agregarCursoHTMLFavoritos(curso));
    };

    request.onerror = (event) => {
        console.error("Error al cargar cursos desde IndexedDB", event);
    };
}

/**
 * Limpia la lista de la interfaz para poder actualizarse y que no haya duplicados
 */
function actualizarHTMLFavoritos() {
    limpiarHTML();
    cargarFavoritosDB();
}

