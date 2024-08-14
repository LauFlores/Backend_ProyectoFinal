const supertest = require("supertest");
let expect;
let requester;
let cookie;

before(async function () {
    const chai = await import("chai");
    expect = chai.expect;
    requester = supertest("http://localhost:8080");
});

describe("Sessions Test", () => {
    it("Debe registrar un nuevo usuario", async () => {
        const mockUsuario = {
            first_name: "Juan",
            last_name: "Perez",
            email: "example@admin.com",
            password: "password123",
            age: 25
        };

        const response = await requester.post("/api/users").send(mockUsuario);
        
        // Verificamos que la respuesta tenga el mensaje esperado
        expect(response.text).to.contain("Usuario creado exitosamente");
    });

    it("Debe iniciar sesión con el usuario usando email y contraseña", async () => {
        const datosLogin = {
            email: "example@admin.com",
            password: "password123"
        };

        const resultado = await requester.post("/api/sessions/login").send(datosLogin);

        // Del header de la petición voy a recuperar la cookie
        const cookieResultado = resultado.headers['set-cookie'][0];

        // Verificamos que la cookie recuperada existe
        expect(cookieResultado).to.be.ok;

        // Se separa el nombre y el valor de la cookie y se guardan en un objeto:
        cookie = {
            name: cookieResultado.split("=")[0],
            value: cookieResultado.split("=")[1]
        };

        // Se verifica que el nombre de la cookie sea igual al "connect.sid"
        expect(cookie.name).to.be.equal("connect.sid");
        expect(cookie.value).to.be.ok;
    });

    it("Debe cerrar sesión correctamente", async () => {
        // Realiza una solicitud HTTP GET a la ruta de logout
        const response = await requester.get("/api/sessions/logout");

        // Verifica que la respuesta tenga un código de estado 302 (redirección)
        expect(response.status).to.equal(302);

        // Verifica que la respuesta incluya una redirección a la página de inicio
        expect(response.header).to.have.property("location", "/");
    });
});

describe("Product Controller", () => {
    before(async function () {
        // Inicia sesión antes de las pruebas de productos
        const datosLogin = {
            email: "example@admin.com",
            password: "password123"
        };

        const resultado = await requester.post("/api/sessions/login").send(datosLogin);
        const cookieResultado = resultado.headers['set-cookie'][0];
        cookie = {
            name: cookieResultado.split("=")[0],
            value: cookieResultado.split("=")[1]
        };
    });


    it("Debe obtener una lista de productos", async () => {
        const response = await requester.get("/api/products")
            .set("Cookie", [`${cookie.name}=${cookie.value}`]);

        const productos = response.body.docs;
        expect(productos).to.be.an("array").that.is.not.empty;
    });

    it("Debe obtener un producto por su ID", async () => {
        const response = await requester.get("/api/products")
            .set("Cookie", [`${cookie.name}=${cookie.value}`]);

        const productos = response.body.docs;
        expect(productos).to.be.an("array").that.is.not.empty;

        const productId = productos[0]._id;
        expect(productId).to.exist;

        const responseById = await requester.get(`/api/products/${productId}`)
            .set("Cookie", [`${cookie.name}=${cookie.value}`]);

        expect(responseById.status, `Error: ${responseById.text}`).to.equal(200);
        expect(responseById.body).to.have.property("title");
        expect(responseById.body).to.have.property("description");
    });
});


