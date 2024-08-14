const express = require("express");
const session = require("express-session");
const app = express();
const PUERTO = 8080;
const handlebars = require("express-handlebars");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const initializePassport = require("./config/passport.config.js");
const passport = require("passport");
require("./database.js");

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");
const sessionRouter = require("./routes/sessions.router.js");
const mockRouter = require("./routes/mock.router.js");
const errorHandler = require("./middleware/error.js");
const { addLogger } = require("./utils/logger.js");
const configObject = require("./config/config.js");
const testRouter = require('./routes/test.router.js');
const swaggerConfig = require('./config/swagger.js');

//const socket = require("socket.io");
//const { initialize } = require("passport");

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));
app.use(session({
    secret:"secretCoder",
    resave: true, 
    saveUninitialized:true,   
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://floreslaura1787:coderhouse@cluster0.das1njd.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0", ttl: 100
    })
}));
app.use(cors());
app.use(addLogger);


//Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

//Swagger
app.use('/apidocs', swaggerConfig.serve, swaggerConfig.setup);

// Middleware de autenticación
const { isAuthenticated } = require("./middleware/auth.middleware.js"); // Ajusta la ruta correctamente
app.use(isAuthenticated);

//Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

//Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/", viewsRouter);
app.use("/", mockRouter);
app.use(errorHandler);
app.use("/loggertest", testRouter);


const server = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});


///Websockets: 
const SocketManager = require("./sockets/socketManager.js");
new SocketManager(server);

