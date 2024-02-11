const express = require('express')
const router = express.Router()
const usuarioController = require('../controller/usuario-controller')


router.post('/cadastro', usuarioController.cadastrarUsuario)

router.post('/login', usuarioController.login)

module.exports = router