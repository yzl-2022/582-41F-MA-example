const path = require('path')

//create an express server
const express = require('express')
const app = express()

//mustache -- templates
const mustacheExpress = require('mustache-express')

app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'html')
app.engine('html', mustacheExpress())

//get the database from db.js
const db = require(path.join(__dirname, './db'))

//validation de données
const { check, validationResult } = require("express-validator");

//Middlewares -- add before routers
//==================================
app.use(express.static(path.join(__dirname, './public'))) //make available the folder /public
app.use(express.json()) //to read json format data in express
app.use(express.urlencoded({extended: false})); //to read form data in express

//Routers
//==================================

//films

//if there is no data inside collection `films`, implant local data into collection `films`
app.get(['/films/initialiser','/api/films/initialiser'], async function(req, res){
    try{
        const donneesFilms = require(path.join(__dirname,'./data/filmsTest.js'))

        donneesFilms.forEach(async (item, index)=>{ 
            item.id = index + 1
            await db.collection('films').add(item)
        })

        res.redirect('/films')

    }catch(err){
        console.log(err)
        res.status(500).send(err)
    }
})

app.get(['/','/films','/api/films'], async function(req, res){
    try{
        const filmsRef = await db.collection('films').get()

        if (filmsRef.empty) return res.redirect('/films/initialiser') //implant local data if collection is empty

        const films = []

        filmsRef.forEach((doc)=>{
            films.push(doc.data())  //only instrested in the .data() attribute
        })
        
        res.statusCode = 200
        res.render('index', { films: films })

    }catch(err){
        console.log(err)
        res.status(500).send(err)
    } 
})

/* app.post(['/','/films','/api/films'],
        [
            check('titre').escape().trim().notEmpty(),
            check('genres').optional().escape().trim().notEmpty(),
            check('description').optional().escape().trim().notEmpty(),
            check('annee').escape().trim().notEmpty(),
            check('realisation').escape().trim().notEmpty(),
            check('titreVignette').escape().trim().notEmpty()
        ],
        async function(req,res){
            //valider la requête
            const validation = validationResult(req)
            if (validation.errors.length > 0) {
                res.statusCode = 400
                //return res.json({message: "erreurs dans données envoyées"})
                return res.render('message', { message: "Erreurs dans données envoyées" })
            }
        })
*/

//app.get()

/* app.put(['/','/films','/api/films'],
        [
            check('titre').escape().trim().notEmpty(),
            check('genres').optional().escape().trim().notEmpty(),
            check('description').optional().escape().trim().notEmpty(),
            check('annee').escape().trim().notEmpty(),
            check('realisation').escape().trim().notEmpty(),
            check('titreVignette').escape().trim().notEmpty()
        ],
        async function(req,res){
            //valider la requête
            const validation = validationResult(req)
            if (validation.errors.length > 0) {
                res.statusCode = 400
                //return res.json({message: "erreurs dans données envoyées"})
                return res.render('message', { message: "Erreurs dans données envoyées" })
            }
        })
*/

//app.delete()

//utilisateurs

app.post(['/utilisateurs/inscription','/api/utilisateurs/inscription'], //add middleware to validate request
        [
            check('username').escape().trim().notEmpty().isEmail().normalizeEmail(),
            check('password').escape().trim().notEmpty().isLength({min:8, max:20}).isStrongPassword({minLength:8, minLowercase:0, minNumbers:1, minUppercase:0, minSymbols:0})
        ],
        async function(req, res){
            try {
                //valider la requête
                const validation = validationResult(req)
                if (validation.errors.length > 0) {
                    res.statusCode = 400
                    //return res.json({message: "erreurs dans données envoyées"})
                    return res.render('message', { message: "Erreurs dans données envoyées" })
                }

                /** récupérer les valeurs envoyés par la methode POST
                 * $_POST equals to req.body {object}
                 * {string} const username = req.body.username 
                 * {string} const password = req.body.password
                 */ 
                const { username, password } = req.body

                //vérifie le username dans la base de données
                const docRef = await db.collection('user').where('username', '==', username).get()
                const userExist = []

                docRef.forEach( (doc) => {
                    userExist.push(doc.data())
                })

                if(userExist.length > 0){
                    res.statusCode = 400      //invalid request
                    //return res.json({message: "utilisateur déjà existe"})
                    return res.render('message', { message: "Utilisateur déjà existe" })
                }

                //enregistre dans la base de données
                const userRef = await db.collection('user').count().get()
                let id = userRef.data().count + 1                

                const newUser = { username, password , "id": id }
                await db.collection('user').add(newUser)

                //si renvoie true
                delete newUser.password    //effacer le mot de passe
                res.statusCode = 200
                //res.json(newUser)
                res.render('message', { message: `Bonjour ${newUser.username}, votre compte est créé avec succès.`})

            }catch(err){
                console.log(err)
                res.status(500).send(err)
            }
        }
)

app.post(['/utilisateurs/connexion','/api/utilisateurs/connexion'], //add middleware to validate request
        [
            check('username').escape().trim().notEmpty().isEmail().normalizeEmail(),
            check('password').escape().trim().notEmpty().isLength({min:8, max:20}).isStrongPassword({minLength:8, minLowercase:0, minNumbers:1, minUppercase:0, minSymbols:0})
        ],
        async function(req, res){
            try{
                //valider la requête
                const validation = validationResult(req)
                if (validation.errors.length > 0) {
                    res.statusCode = 400
                    //return res.json({message: "erreurs dans données envoyées"})
                    return res.render('message', { message: "Erreurs dans données envoyées" })
                }

                /** récupérer les valeurs envoyés par la methode POST
                 * $_POST equals to req.body {object}
                 * {string} const username = req.body.username 
                 * {string} const password = req.body.password
                 */ 
                const { username, password } = req.body

                //vérifie le post dans la base de données
                const docRef = await db.collection('user').where('username', '==', username).get()
                const userExist = []

                docRef.forEach( (doc) => {
                    userExist.push(doc.data())
                })

                //si utilisateur n'existe pas
                if(userExist.length < 1){
                    res.statusCode = 400      //invalid request
                    //return res.json({message: "utilisateur n'existe pas"})
                    return res.render('message', { message: "Utilisateur n'existe pas" })
                }

                //si utilisateur existe
                const userValide = userExist[0]

                if(userValide.password !== password){
                    res.statusCode = 400
                    //return res.json({message: "Mot de passe invalide"})
                    return res.render('message', { message: "Mot de passe invalide" })
                }

                //si username & mdp sont bons
                delete userValide.password
                res.statusCode = 200
                //res.json(userValide)
                res.render('message', { message: `Bonjour ${userValide.username}, vous êtes connecté avec succès.`})

            }catch(err){
                console.log(err)
                res.status(500).send(err)
            }
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