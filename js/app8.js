const listaCursos = document.querySelector("#lista-cursos")
const carrito = document.querySelector("#carrito")
const listaArticulos = document.querySelector("#lista-carrito tbody");
const botonVaciar = document.querySelector("#vaciar-carrito");
let articulosCarrito = []

/**
 * Agrego al carrito según la info necesaria, seleccionando el div del curso 
 */
function agregarCarrito(){
    listaCursos.addEventListener("click", (e) => {
        if (e.target.classList.contains("agregar-carrito")){
            const curso = e.target.parentElement.parentElement;
            const datosCurso = leerDatosCurso(curso);
    
            const cursoExistente = articulosCarrito.find(curso => curso.info === datosCurso.info);
    
            if (cursoExistente) {
                cursoExistente.cantidad++
            } else {
                articulosCarrito.push(datosCurso) ;
            }
        }
        actualizarCarrito();
    })
}

/**
 * Vacio la lista de productos del carrito y el tbody del HTML
 */
function vaciarCarrito(){
    botonVaciar.addEventListener("click", (evento) => {
        articulosCarrito = [];
        listaArticulos.innerHTML = "";
    })

}

/**
 * Selecciono los datos que me interesan meter en el carrito del curso
 * @param {div} curso 
 * @returns {object} datosCurso
 */
function leerDatosCurso(curso){
    let datosCurso = {
        img: curso.querySelector("img").src,
        info: curso.querySelector("h4").textContent,
        precio: curso.querySelector("span").textContent,
        cantidad: 1
    }
    //console.log(datosCurso)
    return datosCurso;
}

/**
 * Crea los elementos necesarios del carrito y actualiza el HTML
 */
function actualizarCarrito() {
    listaArticulos.innerHTML = "";

    articulosCarrito.forEach(curso => {
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
        boton.textContent = "x"
        boton.addEventListener("click", (e) => {
            borrarCurso(curso)
        })
        botonBorrado.appendChild(boton)

        fila.appendChild(celdaImagen);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaCantidad);
        fila.appendChild(botonBorrado);

        listaArticulos.appendChild(fila);
    });
}

/**
 * Eliminar elemento del carrito
 * @param {div} curso 
 */
function borrarCurso(curso) {
    articulosCarrito = articulosCarrito.filter((item) => item.info !== curso.info);

    actualizarCarrito();
}

agregarCarrito();
vaciarCarrito();