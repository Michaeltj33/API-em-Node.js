const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParse = require('body-parser')

const rotaProdutos = require('./routes/produtos')
const rotaPedido = require ('./routes/pedidos')

app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'))
app.use(bodyParse.urlencoded({extended : false})) //Aceita apenas dados simples
app.use(bodyParse.json()) //so aceita json como entrada no body

//rotas
app.use('/produtos',rotaProdutos) 
app.use('/pedidos',rotaPedido)

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers',
                'Origin', 'X-Request-With' , 'Content-Type' , 'Accept' , 'Authorization'
    )

    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Melhods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200,({}))
    }

    res.status(404).send({
        Error: 'Rota não encontrada'
    })

    next()
})

module.exports = app