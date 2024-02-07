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

//Middlewares -- add before routers
//==================================
app.use(express.static('./public'))
app.use(express.json()) //read json format data

//Routers
//==================================

app.get('/', async function ( req, res){
    const menuCol = db.collection('menu')
    const dishesRef = await menuCol.get()

    if (dishesRef.empty) return res.status(404).send('data not found')

    const dishes = []

    dishesRef.forEach((doc)=>{
        dishes.push(doc.data())
    })

    res.statusCode = 200
    res.json(dishes)
})


//utilisateurs

app.post("/utilisateurs/inscription", function(req, res){
    //
})

app.post("/utilisateurs/connexion", function(req, res){
    //
})


//start the server
//==================================
app.listen(3000, console.log("server running at http://127.0.0.1:3000"))