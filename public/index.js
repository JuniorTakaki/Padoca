const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

app.use(
    express.urlencoded({
         extended: true,
        }),
    );
app.use(express.json());

app.use(express.static('public')); 
app.use(router);  


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

