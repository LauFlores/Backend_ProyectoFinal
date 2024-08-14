
const socket = io();
const role = document.getElementById("role").textContent;
const email = document.getElementById("email").textContent;
const form = document.getElementById("formularioProductos");

socket.on("products", (data) => {
    renderproducts(data);
})

//Función para renderizar nuestros productos: 

const renderproducts = (products) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    contenedorProductos.innerHTML = "";

    products.docs.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = ` 
                        <p> ${item.title} </p>
                        <p> ${item.price} </p>
                        <p> Owner: ${item.owner} </p>
                        <button class="modificar"> Modificar </button>
                        <button class="eliminar"> Eliminar </button>
                        `;

        contenedorProductos.appendChild(card);
        card.querySelector(".eliminar").addEventListener("click", () => {
            if (role === "premium" && item.owner === email) {
                eliminarProducto(item._id);
            } else if (role === "admin") {
                eliminarProducto(item._id);
            } else {
                Swal.fire({
                    title: "Error",
                    text: "No tenes permiso para borrar ese producto",
                })
            }
        });

        // Evento para modificar producto
        card.querySelector(".modificar").addEventListener("click", () => {
            if (role === "premium" && item.owner === email || role === "admin") {
                abrirFormularioModificar(item);
            } else {
                Swal.fire({
                    title: "Error",
                    text: "No tienes permiso para modificar ese producto",
                });
            }
        });
    })
}


const eliminarProducto = (id) => {
    socket.emit("eliminarProducto", id);
}

//Agregamos productos del formulario: 

document.getElementById("btnEnviar").addEventListener("click", (e) => {
    e.preventDefault();
    agregarProducto();
    // form.reset();
})


const agregarProducto = () => {
    const role = document.getElementById("role").textContent;
    const email = document.getElementById("email").textContent;

    const owner = role === "premium" ? email : "admin";

    const products = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
        owner
    };

    socket.emit("agregarProducto", products);
}

// const abrirFormularioModificar = (item) => {
//     // Llenamos el formulario con los datos del producto
//     document.getElementById("title").value = item.title;
//     document.getElementById("description").value = item.description;
//     document.getElementById("price").value = item.price;
//     document.getElementById("img").value = item.img;
//     document.getElementById("code").value = item.code;
//     document.getElementById("stock").value = item.stock;
//     document.getElementById("category").value = item.category;
//     document.getElementById("status").value = item.status ? "true" : "false";

//     // Cambiamos el botón de enviar para que modifique el producto
//     const btnModificar = document.getElementById("btnEnviar");
//     btnModificar.textContent = "Modificar Producto";
//     btnModificar.removeEventListener("click", agregarProducto);
//     btnModificar.addEventListener("click", () => modificarProducto(item._id));
// }

const abrirFormularioModificar = (item) => {
    // Llenamos el formulario con los datos del producto
    document.getElementById("title").value = item.title;
    document.getElementById("description").value = item.description;
    document.getElementById("price").value = item.price;
    document.getElementById("img").value = item.img;
    document.getElementById("code").value = item.code;
    document.getElementById("stock").value = item.stock;
    document.getElementById("category").value = item.category;
    document.getElementById("status").value = item.status ? "true" : "false";

    // Cambiamos el botón de enviar para que modifique el producto
    const btnModificar = document.getElementById("btnEnviar");
    btnModificar.textContent = "Modificar Producto";
    btnModificar.removeEventListener("click", agregarProducto);
    btnModificar.addEventListener("click", () => {
        modificarProducto(item._id);
        btnModificar.textContent = "Agregar Producto"; // Restaurar el texto del botón después de modificar
        btnModificar.removeEventListener("click", modificarProducto);
        btnModificar.addEventListener("click", agregarProducto);
        vaciarFormulario(); // Vaciar el formulario después de modificar
        ocultarCancelar(); // Ocultar el botón de cancelar después de modificar
    });

    mostrarCancelar(); // Mostrar el botón de cancelar al abrir el formulario de modificación
};

const vaciarFormulario = () => {
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("price").value = "";
    document.getElementById("img").value = "Sin Imagen";
    document.getElementById("code").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("category").value = "";
    document.getElementById("status").value = "false"; // Asumiendo que el valor predeterminado es false para el estado
};

const mostrarCancelar = () => {
    const btnCancelar = document.getElementById("btnCancelar");
    btnCancelar.style.display = "inline-block"; // Mostrar el botón de cancelar
    btnCancelar.addEventListener("click", () => {
        vaciarFormulario();
        ocultarCancelar(); // Ocultar el botón de cancelar después de cancelar la modificación
    });
};

const ocultarCancelar = () => {
    const btnCancelar = document.getElementById("btnCancelar");
    btnCancelar.style.display = "none"; // Ocultar el botón de cancelar
};


const modificarProducto = (id) => {
    const products = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true"
    };

    console.log("Valores del formulario:", products); // Verifica los valores aquí

    socket.emit("modificarProducto", { id, products });

    // Restauramos el formulario para agregar productos
    const btnModificar = document.getElementById("btnEnviar");
    btnModificar.textContent = "Agregar Producto";
    btnModificar.removeEventListener("click", modificarProducto);
    btnModificar.addEventListener("click", agregarProducto);


}