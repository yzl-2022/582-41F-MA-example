//create an express server
const express = require('express')
const app = express()

//mustache -- templates
const mustacheExpress = require('mustache-express')

app.set('views','./views')
app.set('view engine', 'html');
app.engine('html', mustacheExpress());

//get the database from db.js
const db = require('./db')

//validation de données
const { check, validationResult } = require("express-validator");

//Middlewares -- add before routers
//==================================
app.use(express.static('./public'))
app.use(express.json()) //read json format data

//Routers
//==================================

//films

app.get('/', async function ( req, res){
    const menuCol = db.collection('menu')
    const dishesRef = await menuCol.get()

    if (dishesRef.empty) return res.status(404).send('data not found')

    const dishes = []

    dishesRef.forEach((doc)=>{
        dishes.push(doc.data())
    })

    //------------------------------------
    const userCol = db.collection('user')
    const userRef = await userCol.get()

    if (userRef.empty) return res.status(404).send('data not found')

    const users = []

    userRef.forEach((doc)=>{
        users.push(doc.data())
    })
    //------------------------------
    res.statusCode = 200
    //res.json(dishes)
    res.render('index', { dishes: dishes , users: users })
})


//utilisateurs

app.post("/utilisateurs/inscription", //add middleware to validate request
        [
            check('username').escape().trim().notEmpty().isEmail().normalizeEmail(),
            check('password').escape().trim().notEmpty().isLength({min:8, max:20}).isStrongPassword({minLength:8, minLowercase:0, minNumbers:1, minUppercase:0, minSymbols:0})
        ],
        async function(req, res){
            //valider la requête
            const validation = validationResult(req)
            if (validation.errors.length > 0) {
                res.statusCode = 400
                return res.json({message: "erreurs dans données envoyées"})
            }

            /** récupérer les valeurs envoyés par la methode POST
             * $_POST equals to req.body {object}
             * {string} const username = req.body.username 
             * {string} const password = req.body.password
             */ 
            const { username, password } = req.body

            // vérifie le username dans la base de données
            const docRef = await db.collection('user').where('username', '==', username).get()
            const userExist = []

            docRef.forEach( (doc) => {
                userExist.push(doc.data())
            })

            if(userExist.length > 0){
                res.statusCode = 400      //invalid request
                return res.json({message: "utilisateur déjà existe"})
            }

            // TODO:
            // valider username & password
            // ...

            // enregistre dans la base de données
            const newUser = { username, password }
            await db.collection('user').add(newUser)

            // renvoie true
            delete newUser.password    //effacer le mot de passe
            res.statusCode = 200
            res.json(newUser)
        }
)

app.post("/utilisateurs/connexion", //add middleware to validate request
        [
            check('username').escape().trim().notEmpty().isEmail().normalizeEmail(),
            check('password').escape().trim().notEmpty().isLength({min:8, max:20}).isStrongPassword({minLength:8, minLowercase:0, minNumbers:1, minUppercase:0, minSymbols:0})
        ],
        async function(req, res){
            //valider la requête
            const validation = validationResult(req)
            if (validation.errors.length > 0) {
                res.statusCode = 400
                return res.json({message: "erreurs dans données envoyées"})
            }

            /** récupérer les valeurs envoyés par la methode POST
             * $_POST equals to req.body {object}
             * {string} const username = req.body.username 
             * {string} const password = req.body.password
             */ 
            const { username, password } = req.body

            // vérifie le post dans la base de données
            const docRef = await db.collection('user').where('username', '==', username).get()
            const userExist = []

            docRef.forEach( (doc) => {
                userExist.push(doc.data())
            })

            // si utilisateur n'existe pas
            if(userExist.length < 1){
                res.statusCode = 400      //invalid request
                return res.json({message: "utilisateur n'existe pas"})
            }

            // si utilisateur existe
            const userValide = userExist[0]
            if(userValide.password !== password){
                res.statusCode = 400
                return res.json({message: "Mot de passe invalide"})
            }

            // username & mdp sont bons
            delete userValide.password
            res.statusCode = 200
            res.json(userValide)
        }
)

//middleware for error control -- no need for next() -- place after all routers
//==================================
app.use(function(req, res){
    res.statusCode = 404
    res.render('message', { url: req.url, message: '404' })
})


//start the server
//==================================
app.listen(3000, console.log("server is running at http://127.0.0.1:3000"))