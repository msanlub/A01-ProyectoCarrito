

// //variables
// const nombreInput = document.getElementById("nombre");
// const emailInput = document.getElementById("email");
// const form = document.getElementById("crear-cuenta");
// let db; 
// let usuario = {
//     nombre: "",
//     email: "",
// };

// //listener
// document.addEventListener("DOMContentLoaded", () => {
//     iniciarDB();

//     nombreInput.addEventListener("blur", validarNombre);
//     emailInput.addEventListener("blur", validarEmail);
//     form.addEventListener("submit", envioUsuario);
// });

// // Funciones

// // Función para validar el nombre
// function validarNombre() {
//     limpiarError("nombre");
//     const nombre = document.getElementById("nombre").value.trim();
//     if (!nombre) {
//         mostrarError("El campo nombre es obligatorio", "nombre");
//         return false;
//     }
//     return true;
// }


// // Función para validar el correo electrónico
// function validarEmail() {
//     limpiarError("email");
//     const email = document.getElementById("email").value.trim();
//     const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
//     if (!emailRegex.test(email)) {
//         mostrarError("El campo email no es válido", "email");
//         return false;
//     }
//     return true;
// }

// function agregarUsuarioDB(usuario) {
//     const transaction = db.transaction(["usuarios"], "readwrite");
//     const usuariosStore = transaction.objectStore("usuarios");

//     const request = usuariosStore.add(usuario);

//     request.onsuccess = () => {
//         console.log("Usuario agregado a la base de datos");
//         alert("Cuenta creada con éxito.");
//         form.reset(); 
//         limpiarUsuario(); 
        
//         window.location.href = "login.html";
//     };

//     request.onerror = (event) => {
//         console.error("Error al agregar usuario a IndexedDB", event);
//     };
// }

// // Función para validar el formulario al enviar
// function validarFormulario(e) {
//     e.preventDefault(); 

//     const nombreValido = validarNombre();
//     const emailValido = validarEmail();

//     //si son validos añade el objeto usuario
//     if (nombreValido && emailValido) {
//         usuario.nombre = nombreInput.value.trim();
//         usuario.email = emailInput.value.trim();

//         agregarUsuarioDB(usuario); 
//     }
// }

// // Función para mostrar errores

// function mostrarError(mensaje, campo) {
//     const campoElemento = document.getElementById(campo);
//     campoElemento.nextElementSibling.textContent = mensaje; 
// }

// // Función para limpiar errores
// function limpiarError(campo) {
//     const campoElemento = document.getElementById(campo);
//     campoElemento.nextElementSibling.textContent = ""; 
// }

// function envioUsuario(e) {
//     e.preventDefault(); // Evita el envío del formulario por defecto

//     const nombreValido = validarNombre();
//     const emailValido = validarEmail();

//     // Si los datos son válidos, añade el objeto usuario
//     if (nombreValido && emailValido) {
//         usuario.nombre = nombreInput.value.trim();
//         usuario.email = emailInput.value.trim();

//         agregarUsuarioDB(usuario); // Añade el usuario a la base de datos
//     }
// }


// // Función para limpiar el objeto usuario
// function limpiarUsuario() { 
//     usuario = {
//         nombre: "",
//         email: "",
//     };
// }