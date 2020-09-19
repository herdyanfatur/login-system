const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");



const passportJWT = require("passport-jwt");
const passport = require("passport");

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // fromAuthHeaderAsBearerToken() ???
jwtOptions.secretOrKey = "anu itu tetap anu";

let strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
    let user = getUser({ id: jwt_payload.id});

    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

passport.use(strategy);

const getUser = async obj => {
    return await User.findOne({
        where: obj
    });
};

app.use(express.urlencoded({ extended: true}));

const db = require("./config/db");
const User = require("./models/users");
const { Passport } = require("passport");

db.authenticate().then(() => console.log("database telah berhasil terkonek"));


app.get("/", (req, res) => res.send("node bisa di buka di REST API"));

app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        console.log(email, password);

        if (email && password) {
            let user = await getUser({email: email});

            if (!user) {
                res.status(401).json({message: "email salah atau belum terdaftar!"})
            }

            //decrypt password for login
            let checkPass = bcrypt.compareSync(password, user.password); // true

            if (checkPass) {
                let payload = {id: user.id}

                let token = jwt.sign(payload, jwtOptions.secretOrKey)

                res.json({
                    message: "berhasil !!",
                    token: token
                })
            } else {
                res.status(401).json({message: "password salah"})
            }
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});

app.get("/protected", passport.authenticate("jwt", {session: false}), (req, res) => {
    try {
        res.send("selamat !! sekarang kamu bisa mengakses router ini ")
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
})

app.post("/register",async (req, res) =>{
    try {
        const {email, password} = req.body
        
        //bcrypt password for register
        const hash = bcrypt.hashSync(password, 10);
        const newUser = new User({
            email, password:hash
        })
        await newUser.save();

        res.json(newUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});

app.listen(4500, () => console.log("port berjalan di port 4500"));