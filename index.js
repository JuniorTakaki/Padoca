const express = require('express');
const pool = require('./db/conn');
const router = require('./router/router'); 
const port = 5000;
const app = express();


app.use(
    express.urlencoded({
         extended: true,
        }),
    );
app.use(express.json());

app.use(express.static('public')); 
app.use(router);


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/index `); 
});

