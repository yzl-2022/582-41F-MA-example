const http = require("http");

const dotenv = require('dotenv');
dotenv.config();

const fs = require("fs");


const server = http.createServer((request, response) => {
    if (request.method == 'GET' && request.url == '7'){
        const film = fs.readFileSync('./public/index.html','utf-8');

        response.setHeader('Content-Type', 'text/html');
        response.statusCode = 200;

        response.end(film);
    }else{
        const film = fs.readFileSync('./public/404.html','utf-8');

        response.setHeader('Content-Type', 'text/html');
        response.statusCode = 404;

        response.end(film);
    }
}).listen(3000);