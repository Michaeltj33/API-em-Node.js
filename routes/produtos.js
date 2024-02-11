const express = require('express')
const router = express.Router()
const multer = require('multer')
const login = require('../middleware/login')
const produtoController = require('../controller/produto-controller')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toDateString().replace(/\s/g, '') + file.originalname)
    }
})

const FileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
        console.log("Erro: tipo de imagem não aceito ")
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1 //Max 5M
    },
    fileFilter: FileFilter
})

router.get('/', produtoController.getProdutos)
router.get('/:id_produto', produtoController.getUmproduto)

router.post('/',
    login.obrigatorio,
    upload.single('produto_imagem'),
    produtoController.postPorduto)

router.patch('/', login.obrigatorio, produtoController.updateProduto)

router.delete('/', login.obrigatorio, produtoController.deleteProduto)

module.exports = router


