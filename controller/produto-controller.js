const mysql = require('../mysql')

//Retorna todos os produtos
exports.getProdutos = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM produtos")
        const response = {
            quantidade: result.length,
            produtos: result.map(prod => {
                return {
                    id_produto: prod.id_produto,
                    nome: prod.nome,
                    preco: prod.preco,
                    imagem_produto: prod.imagem_produto,
                    request: {
                        tipo: 'GET',
                        descricao: 'Retorna os detalhes de um produto específico',
                        url: 'http://localhost:3000/produtos/' + prod.id_produto
                    }
                }
            })
        }
        return res.status(200).send(response)
    } catch (error) {
        returnError(error, res)
    }
}

//Insere um produtos
exports.postProduto = async (req, res, next) => {
    try {
        const query = 'INSERT INTO produtos (nome,preco,imagem_produto) VALUES (?,?,?)'
        const result = await mysql.execute(query, [req.body.nome, req.body.preco, req.file.path])
        const response = {
            mensagem: 'Produto Inserido com Sucesso',
            produtoCriado: {
                id_produto: result.insertId,
                nome: req.body.nome,
                preco: req.body.preco,
                imagem_produto: req.file.path,
                request: {
                    tipo: "GET",
                    descricao: 'Retorna todos os produto',
                    url: 'http://localhost:3000/produtos/'
                }
            }
        }
        return res.status(201).send(response)

    } catch (error) {
        returnError(error, res)
    }
}

//Retorna dados de um produto
exports.getUmProduto = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM produtos WHERE id_produto = ?'
        const result = await mysql.execute(query, [req.params.id_produto])
        if (result.length == 0) {
            return res.status(404).json({
                mensagem: 'Não foi encontrado um Produto com esse ID'
            })
        }
        const response = {
            produto: {
                id_produto: result[0].id_produto,
                nome: result[0].nome,
                preco: result[0].preco,
                imagem_produto: result[0].imagem_produto,
                request: {
                    tipo: "GET",
                    descricao: 'Retorna um produto',
                    url: 'http://localhost:3000/produtos/'
                }
            }
        }
        return res.status(201).send(response)
    } catch (error) {
        returnError(error, res)
    }
}

//Altera um produto
exports.updateProduto = async (req, res, next) => {
    try {
        const query = 'UPDATE produtos Set nome = ?, preco = ? WHERE id_produto = ?'
        await mysql.execute(query, [req.body.nome, req.body.preco, req.body.id_produto])
        const response = {
            mensagem: 'Produto Atualizado com Sucesso',
            produtoAtualizado: {
                id_produto: req.body.id_produto,
                nome: req.body.nome,
                preco: req.body.preco,
                request: {
                    tipo: "PATCH",
                    descricao: 'Retorna os Detalhes de um produto específico',
                    url: 'http://localhost:3000/produtos/' + req.id_produto
                }
            }
        }
        return res.status(202).send(response)
    } catch (error) {
        returnError(error, res)
    }

}

//Deleta um produto
exports.deleteProduto = async (req, res, next) => {
    try {
        const query = 'DELETE FROM produtos WHERE id_produto = ?'
        await mysql.execute(query, [req.body.id_produto])
        const response = {
            mensagem: "Produto removido com Sucesso",
            request: {
                tipo: 'POST',
                descricao: 'Insere um produto',
                url: 'http://localhost:3000/produtos',
                body: {
                    nome: "String",
                    preco: 'Number'
                }
            }
        }
        res.status(202).send(response)
    } catch (error) {
        returnError(error, res)
    }

}

function returnError(error, res) {
    console.error('Erro na conexão do banco de dados:', error);
    return res.status(500).json({
        error: error,
        response: null
    });
}

