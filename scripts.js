const obtenerCarritoLS = () => JSON.parse(localStorage.getItem("carrito")) || []

function getArray(){
    fetch("./data.json")
    .then((response) => response.json())
    .then(productos => 
        principal(productos)
    )
}
getArray()


function principal(productos) {
    renderizarCarrito()


    let botonMostrarCarrito = document.getElementById("mostarOcultar")
    botonMostrarCarrito.addEventListener("click", mostarOcultar)

    let botonBuscar = document.getElementById("botonBuscar")
    botonBuscar.addEventListener("click", () => filtrarYRenderizar(productos))

    let inputBusqueda = document.getElementById("inputBusqueda")
    inputBusqueda.addEventListener("keypress", (e) => filtrarYRenderizarEnter(productos, e))

    renderizarProductos(productos)

    let botonComprar = document.getElementById("botonComprar")
    botonComprar.addEventListener("click", finalizarCompra)

    let botonesFiltros = document.getElementsByClassName("botonFiltro")
    for (const botonFiltro of botonesFiltros) {
        botonFiltro.addEventListener("click", (e) => filtrarYRenderizarProductosPorArtista(e, productos))

        let dropdownMenu = document.querySelectorAll(".dropdown-menu.botonFiltro")
        for (const dropdown of dropdownMenu) {
            dropdown.addEventListener("click", (e) => filtrarYRenderizarProductosPorArtista(e, productos))
        }
    }
}

function filtrarYRenderizarProductosPorArtista(e, productos) {
    console.log(e.target.getAttribute("value"))
    let productosFiltrados = productos.filter(producto => producto.artist.includes(e.target.getAttribute("value")))
    renderizarProductos(productosFiltrados)
}

function finalizarCompra() {
    Swal.fire({
        title: "¡Enhorabuena!",
        text: "¡Tu compra ha finalizado!",
        icon: "success",
        timer: 5000,

    });

    localStorage.removeItem("carrito")
    renderizarCarrito([])
}

function mostarOcultar(e) {
    let contenedorCarrito = document.getElementById("contenedorCarrito")
    let contenedorProductos = document.getElementById("contenedorProductos")

    //toggle
    if (contenedorCarrito.classList.contains("oculto") || contenedorProductos.classList.contains("visible")) {
        contenedorCarrito.classList.toggle("visiblecont")
        contenedorCarrito.classList.remove("oculto")
        contenedorProductos.classList.toggle("oculto")
        contenedorProductos.classList.remove("visible")
    } else {
        contenedorCarrito.classList.toggle("oculto")
        contenedorCarrito.classList.remove("visiblecont")
        contenedorProductos.classList.toggle("visible")
        contenedorProductos.classList.remove("oculto")
    }

    if (e.target.innerText === "Ver Carrito") {
        e.target.innerText = "Ocultar Carrito"
    } else {
        e.target.innerText = "Ver Carrito"
    }

}



function filtrarYRenderizarEnter(productos, e) {
    e.keyCode === 13 && renderizarProductos(filtrarProducto(productos))
}

function filtrarYRenderizar(productos) {
    let productosFiltrados = filtrarProducto(productos)
    renderizarProductos(productosFiltrados)
}


//Filtro de productos x value del input, con boton click e keypress
function filtrarProducto(productos) {
    let inputBusqueda = document.getElementById("inputBusqueda")
    return productos.filter(producto => producto.name.includes(inputBusqueda.value))
}

//Creacion de Tarjetas
function renderizarProductos(productos) {
    let contenedorProductos = document.getElementById("contenedorProductos")
    contenedorProductos.innerHTML = ""

    productos.forEach(producto => {
        let tarjetaProducto = document.createElement("div")
        tarjetaProducto.className = "tarjetaProducto"

        tarjetaProducto.innerHTML = `
        <div>
        <h3>${producto.name}</h3>
        <video src="videos/${producto.rutaImagen}" autoplay width="200"></video>
        <h4>precio: $${producto.price}</h4>
        <input type="number" id="cantidad${producto.id}" min="1" max="${producto.stock}" value="1">
        <button  class="btn btn-secondary" id=botonCarrito${producto.id}>Agregar al carrito</button>
        </div>
    `
        contenedorProductos.appendChild(tarjetaProducto)

        let botonAgregarAlCarrito = document.getElementById("botonCarrito" + producto.id)
        botonAgregarAlCarrito.addEventListener("click", (e) => agregarProductoAlCarrito(e, productos))

    })
}

function agregarProductoAlCarrito(e, productos) {
    let carrito = obtenerCarritoLS()

    let idDelProducto = Number(e.target.id.substring(12))
    let cantidad = Number(document.getElementById("cantidad" + idDelProducto).value);


    let posProductoEnCarrito = carrito.findIndex(producto => producto.id === idDelProducto)
    let productoBuscado = productos.find(producto => producto.id === idDelProducto)

    if (posProductoEnCarrito !== -1) {
        carrito[posProductoEnCarrito].unidades += cantidad
        carrito[posProductoEnCarrito].subtotal = carrito[posProductoEnCarrito].precioUnitario * carrito[posProductoEnCarrito].unidades

    } else {
        carrito.push({
            id: productoBuscado.id,
            nombre: productoBuscado.name,
            precioUnitario: productoBuscado.price,
            unidades: cantidad,
            subtotal: productoBuscado.price * cantidad
        })
    }

    localStorage.setItem("carrito", JSON.stringify(carrito))
    renderizarCarrito()

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });
    Toast.fire({
        icon: "success",
        title: "Producto agregado al carrito"
    });
}

function renderizarCarrito(carrito = obtenerCarritoLS()) {
    let contenedorCarrito = document.getElementById("contenedorCarrito")
    contenedorCarrito.innerHTML = ""

    let total = 0

    carrito.forEach(producto => {
        let tarjetaProductoCarrito = document.createElement("div")
        tarjetaProductoCarrito.className = "tarjetaProductoCarrito"
        tarjetaProductoCarrito.id = `tarjetaProductoCarrito${producto.id}`

        tarjetaProductoCarrito.innerHTML = `
            <p>${producto.nombre}</p>
            <div>
            <p>unidades:
            <button class="btn btn-secondary" id=restar${producto.id}>-</button> ${producto.unidades} <button class="btn btn-secondary" id=sumar${producto.id}>+</button></p>
            </div>
            <p>precio: ${producto.precioUnitario}</p>
            <button class="btn btn-secondary" id=eliminar${producto.id}>ELIMINAR</button>
        `
        contenedorCarrito.appendChild(tarjetaProductoCarrito)

        let botonEliminar = document.getElementById(`eliminar${producto.id}`)
        botonEliminar.addEventListener("click", (e) => eliminarProductoDelCarrito(e))

        let botonRestarUnidad = document.getElementById(`restar${producto.id}`)
        botonRestarUnidad.addEventListener("click", (e) => restarUnidad(e, producto.id))

        let botonSumarUnidad = document.getElementById(`sumar${producto.id}`)
        botonSumarUnidad.addEventListener("click", (e) => sumarUnidad(e, producto.id))

        total += producto.precioUnitario * producto.unidades
    })

    let precioTotal = document.createElement("div")
    precioTotal.innerHTML = `<h3>Total: $${total}</h3>`
    contenedorCarrito.appendChild(precioTotal)
}

function sumarUnidad(e, id) {
    let carrito = obtenerCarritoLS()

    let producto = carrito.find(producto => producto.id === id)
    producto.unidades++
    producto.subtotal = producto.precioUnitario * producto.unidades
    localStorage.setItem("carrito", JSON.stringify(carrito))
    renderizarCarrito()
}

function restarUnidad(e, id) {
    let carrito = obtenerCarritoLS()

    let producto = carrito.find(producto => producto.id === id)
    if (producto.unidades > 1) {
        producto.unidades--
        producto.subtotal = producto.precioUnitario * producto.unidades
        localStorage.setItem("carrito", JSON.stringify(carrito))
        renderizarCarrito()
    }
}

function eliminarProductoDelCarrito(e) {
    let carrito = obtenerCarritoLS()
    let id = Number(e.target.id.substring(8))
    let index = carrito.findIndex(producto => producto.id === id)
    if (index !== -1) {
        carrito.splice(index, 1)
        localStorage.setItem("carrito", JSON.stringify(carrito))  // Actualizar localStorage
        renderizarCarrito()
    }
}
