//importación de modulos

const passport = require("passport");
const local = require("passport-local");

//Github
const GitHubStrategy = require("passport-github2");

const UserModel = require("../models/user.model.js");
const { createHash, isValidPassword } = require("../utils/hashbcrypt");

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const {first_name, last_name, email, age} = req.body;
        try {
            let user = await UserModel.findOne({email:email});
            if(user) return done(null, false);

            let newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            }

            let result = await UserModel.create(newUser);
            return done(null, result);

        } catch (error) {
            return done(error);
        }
    }))

    //Login

    passport.use("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {
        try {
            const user = await UserModel.findOne({email});
            if(!user) {
                console.log("El usuario no existe");
                return done(null, false);
            }

            if(!isValidPassword(password, user)) return done(null, false);

            // Agregar lógica de asignación de roles
            if (email.endsWith("@admin.com")) {
                user.role = "admin";
            } else {
                user.role = "user";
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById({_id:id});
        done(null, user);
    })

    //Estrategia para Github
    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.e1040b2ff014eb78",
        clientSecret: "bc3fd90c0b8aca9173d0bd9806e9657e2554706a",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accesToken, refresToken, profile, done) => {
        console.log(profile);
        try {
            let user = await UserModel.findOne({email: profile._json.email});
            if(!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "secreto",
                    age: 39,
                    email: profile._json.email,
                    password: "secreto"
                }

                let result = await UserModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))
}

module.exports = initializePassport;