//create an express server
const express = require('express')
const app = express()

//get the database from db.js
const db = require('./db')

//Middlewares -- add before routers
//==================================
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
    res.json(dishes) // this is equals to res.send() and will terminate the response
})

//start the server
//==================================
app.listen(3000, console.log("server running at http://127.0.0.1:3000"))