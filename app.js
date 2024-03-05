const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParse = require('body-parser')

const rotaProdutos = require('./routes/produtos')
const rotaPedido = require('./routes/pedidos')
const rotaUsuarios = require('./routes/usuarios')

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json())
app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'))
//app.use(bodyParse.urlencoded({ extended: false })) //Aceita apenas dados simples
//app.use(bodyParse.json()) //so aceita json como entrada no body

//rotas
app.use('/produtos', rotaProdutos)
app.use('/pedidos', rotaPedido)
app.use('/usuarios', rotaUsuarios)

module.exports = app