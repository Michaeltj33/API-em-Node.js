const express = require('express')
const router = express.Router()
const pedidoController = require('../controller/pedido-controller')


router.get('/', pedidoController.getPedido)
router.get('/:id_pedido', pedidoController.getUmPedido)

router.post('/', pedidoController.getPostPedidos)

router.delete('/', pedidoController.deletePedido)

module.exports = router


