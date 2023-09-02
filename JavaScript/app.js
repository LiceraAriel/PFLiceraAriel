class Producto{
    constructor(codigo,nombre,precio,descripcion,unidades,img){
        this.codigo = codigo
        this.nombre = nombre
        this.precio = precio
        this.unidades = unidades
        this.cantidad = 1
        this.descripcion = descripcion
        this.img = img
    }
    
    aumentarCantidad(){
        this.cantidad++
    }

    disminuirCantidad(){
        if (this.cantidad > 1) {
            this.cantidad--
            return true
        }
        return false
    }

    descripcionHTML(){
        return `
        <div class="card" style="width: 18rem;">
            <img src="${this.img}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${this.nombre}</h5>
                <p class="card-text">${this.descripcion}</p>
                <p class="card-text">$ ${this.precio}</p>
                <p class="card-text">Unidades por paquete: ${this.unidades}</p>
                <button class="btn btn-primary" id="ap-${this.codigo}">Agregar a carrito</button>
            </div>
        </div>`
    }
}

class Carrito{
    constructor(){
        this.listaCarrito = []
        this.contenedor_carrito = document.getElementById('contenedor_carrito')
        this.nodo_total = document.getElementById("total")
        this.nodo_neto = document.getElementById("neto")
        this.nodo_iva = document.getElementById("iva")
        this.vaciar = document.getElementById("vaciar")
    }

    cargarProductos(){
        let listaCarritoJSON = localStorage.getItem("listaCarrito")
        if(listaCarritoJSON){
            this.listaCarrito = JSON.parse(listaCarritoJSON)
        }else{
            this.listaCarrito = []
        }
    }

    guardarProductos(){
        let listaCarritoJSON = JSON.stringify(this.listaCarrito)
        localStorage.setItem("listaCarrito", listaCarritoJSON)
    }

    agregar(productoAgregar){
        let productoExistente = this.listaCarrito.some(producto => producto.codigo == productoAgregar.codigo)
        if(productoExistente){
            let producto = this.listaCarrito.find(producto => producto.codigo == productoAgregar.codigo)
            producto.cantidad = producto.cantidad + 1
        }else{
            this.listaCarrito.push(productoAgregar)
        }
    }

    eliminar(productoEliminar){
        let producto = this.listaCarrito.find( producto => producto.codigo == productoEliminar.codigo)
        let indice = this.listaCarrito.indexOf(producto)
        this.listaCarrito.splice(indice,1)
        this.guardarProductos()
    }

    limpiarCarrito(){
        this.contenedor_carrito.innerHTML = ""
    }

    mostrarProductos(){
        this.contenedor_carrito.innerHTML = ""

        this.listaCarrito.forEach( producto => {
            contenedor_carrito.innerHTML += `
            <div class="card mb-3" style="max-width: 540px;">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${producto.img}" class="img-fluid rounded-start" alt="...">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text">Precio: $${producto.precio}</p>
                            <p class="card-text">Cantidad: <button class="btn btn-danger" id="restar-${producto.codigo}"><i class="fa-solid fa-minus"></i></button> ${producto.cantidad} <button class="btn btn-primary" id="sumar-${producto.codigo}"><i class="fa-solid fa-plus"></i></button></p>
                            <button class="btn btn-primary" id="eliminar-${producto.codigo}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>`
        })

        this.listaCarrito.forEach(producto => {
            let btn_eliminar = document.getElementById(`eliminar-${producto.codigo}`)
            let btn_plus = document.getElementById(`sumar-${producto.codigo}`)
            let btn_minus = document.getElementById(`restar-${producto.codigo}`)

            btn_eliminar.addEventListener("click", () =>{
                this.eliminar(producto)
                this.guardarProductos()
                this.mostrarProductos()
                Swal.fire({
                    title: '¿Está seguro de eliminar el producto?',
                    text: "¡No podrá revertir la acción!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, quiero eliminarlo!',
                    cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                        Swal.fire(
                        'Eliminado!',
                        'El producto a sido eliminado del carrito',
                        'success'
                        )
                    }
                })
            })
            btn_plus.addEventListener("click", () =>{
                producto.aumentarCantidad()
                this.mostrarProductos()
            })
            btn_minus.addEventListener("click", () =>{
                producto.disminuirCantidad()
                this.mostrarProductos()
            })
        })

        neto.innerHTML = "Precio Neto: $ " + this.calcularNeto()
        iva.innerHTML = "IVA: $ " + this.calcularIVA()
        total.innerHTML = "Precio Total: $ " + this.calcularTotal()
    }

    calcularNeto(){
        return this.listaCarrito.reduce((acumulador, producto) => acumulador + producto.precio * producto.cantidad , 0)
    }

    calcularIVA(){
        return this.calcularNeto() * 0.21
    }

    calcularTotal(){
        return this.calcularNeto() + this.calcularIVA()
    }

    eventoFinalizar(){
        const finalizar = document.getElementById("finalizar")

        finalizar.addEventListener("click", () => {
            if(this.listaCarrito.length > 0){
                let total = this.calcularTotal()
                this.listaCarrito = []
                localStorage.removeItem("listaCarrito")
                this.mostrarProductos()
                this.nodo_total.innerHTML = ""
                this.nodo_neto.innerHTML = ""
                this.nodo_iva.innerHTML = ""
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: '¡La compra se realizó con éxito!',
                    text: 'Por un total de $' + total,
                    timer: 4000
                })
            }else{
                Swal.fire({
                    position: 'center',
                    icon: 'warning',
                    title: 'ERROR',
                    text: '¡No se agregaron porductos!',
                    timer: 3000
                })
            }
        })
    }

    eventoVaciarCarrito(){
        this.vaciar.addEventListener("click", () =>{
            this.listaCarrito = []
            this.limpiarCarrito()
            localStorage.clear()
            this.nodo_total.innerHTML = ""
            this.nodo_neto.innerHTML = ""
            this.nodo_iva.innerHTML = ""
        })
    }
}

class ProductoController{
    constructor (){
        this.listaProductos = []
    }

    agregar(producto){
        this.listaProductos.push(producto)
    }

    eventoAgregaralCarrito(){
        this.listaProductos.forEach( producto => {
            const btn = document.getElementById(`ap-${producto.codigo}`)
            btn.addEventListener("click",() => {
                carrito.agregar(producto)
                carrito.guardarProductos()
                carrito.mostrarProductos()
                Toastify({
                    avatar: `${producto.img}`,
                    text: "Producto agregado al carrito.",
                    duration: 1500,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                }).showToast();
            })
        })
    }

    mostrarProductos(){
        let contenedor_productos = document.getElementById("contenedor_productos")
        this.listaProductos.forEach( producto => {
            contenedor_productos.innerHTML += producto.descripcionHTML()
        })

        this.eventoAgregaralCarrito()
    }
}


// Productos //
const p1 = new Producto (1,"Milanesa de Soja con Sal", 600, "Milanesas a base de soja con sal, no poseen conservantes, adictivos ni quimicos industriales.", 4, "https://d22fxaf9t8d39k.cloudfront.net/487d3a956afcec8960d335a67a27592b039f9ac9e759f29a7d1a488a1c1ebff4142920.jpeg")
const p2 = new Producto (2,"Milanesa de Soja sin Sal", 600, "Milanesas a base de soja sin sal, no poseen conservantes, adictivos ni quimicos industriales.", 4, "https://vrill.com.ar/wp-content/uploads/2022/02/Milanesa-de-soja-prasat-240x300-sin-sal.jpeg")
const p3 = new Producto (3,"Milanesa de Soja de Parmesano", 750, "Milanesas a base de soja con rebozado de parmesano, no poseen conservantes, adictivos ni quimicos industriales.", 4, "https://cayenatiendanatural.com.ar/wp-content/uploads/2023/06/prasat-queso-parmesano-scaled-1.jpg")
const p4 = new Producto (4,"Milanesa de Soja Rellenas", 900, "Milanesas a base de soja, no poseen conservantes, adictivos ni quimicos industriales.", 4, "https://cdn.bwebly.com/media/2/2021/10/prasat-queso-600x600_l.jpg")
const p5 = new Producto (5,"Chorizo Vegano", 750, "Hecho a base de harina de soja, no poseen conservantes, adictivos ni quimicos industriales.", 3, "https://d3ugyf2ht6aenh.cloudfront.net/stores/001/144/382/products/whatsapp-image-2021-04-14-at-23-43-351-c76306acfa96feb58416184546953607-240-0.jpeg")
const p6 = new Producto (6,"Seitan Vegano", 750, "Hecho a base de harina de trigo fortificada con gluten y harina de soja, no poseen conservantes, adictivos ni quimicos industriales.", 4, "https://d3ugyf2ht6aenh.cloudfront.net/stores/001/126/866/products/prasat-seitan1-eeb063c94b442bcd9916331875769004-640-0.png")
const p7 = new Producto (7,"Matambre Vegano", 650, "Hecho a base de harina de trigo fortificada con gluten y harina de soja, no poseen conservantes, adictivos ni quimicos industriales.", 4, "https://d22fxaf9t8d39k.cloudfront.net/3352a7b8df0c5dc3ce9e09f97c43c9ece9de033413d57f5ddd3c418526e3d04c142920.jpeg")
const p8 = new Producto (8,"Matambre Vegetariano", 650, "Hecho a base de harina de trigo fortificada con gluten y harina de soja, no poseen conservantes, adictivos ni quimicos industriales. Contiene huevo.", 4, "https://acdn.mitiendanube.com/stores/001/187/090/products/601245df-1238-450b-9882-2ba81d7f0a78_nube-86cc9c2e5ea287b53715950288154580-240-0.jpg")


const carrito = new Carrito()
carrito.cargarProductos()
carrito.mostrarProductos()
carrito.eventoFinalizar()
carrito.eventoVaciarCarrito()

const controlador_productos = new ProductoController()

controlador_productos.agregar(p1)
controlador_productos.agregar(p2)
controlador_productos.agregar(p3)
controlador_productos.agregar(p4)
controlador_productos.agregar(p5)
controlador_productos.agregar(p6)
controlador_productos.agregar(p7)
controlador_productos.agregar(p8)

controlador_productos.mostrarProductos()



