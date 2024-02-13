const mysql = require('../mysql')

//Retorna todos os produtos
exports.getPedido = async (req, res, next) => {
    try {
        const query = `SELECT pedidos.id_pedido,
                    pedidos.quantidade,
                    produtos.id_produto,
                    produtos.nome,
                    produtos.preco
                    FROM pedidos
                    INNER JOIN produtos
                    ON produtos.id_produto = pedidos.id_produto`
        const result = await mysql.execute(query)
        const response = {
            pedido: result.map(pedido => {
                return {
                    id_pedido: pedido.id_pedido,
                    quantidade: pedido.quantidade,
                    produto: {
                        id_produto: pedido.id_produto,
                        nome: pedido.nome,
                        preco: pedido.preco,
                    },

                    request: {
                        tipo: 'GET',
                        descricao: 'Retorna detalhes um produto espífico',
                        url: 'http://localhost:3000/pedidos/' + pedido.id_pedido
                    }
                }
            })
        }

        return res.status(200).send(response)
    } catch (error) {
        returnError(error, res)
    }
}

//Insere um Pedidos
exports.getPostPedidos = async (req, res, next) => {
    try {
        const query1 = 'SELECT * from produtos where id_produto = ?'
        const result1 = await mysql.execute(query1, [req.body.id_produto])
        if (result1.length == 0) {
            return res.status(404).send({
                mensagem: 'Produto não encontrado'
            })
        }
        const query2 = 'INSERT INTO pedidos (id_produto,quantidade) VALUES (?,?)'
        result2 = await mysql.execute(query2, [req.body.id_produto, req.body.quantidade])

        const response = {
            mensagem: "Pedido Criado com Sucesso",
            pedidoCriado: {
                id_pedido: result2.id_pedido,
                id_produto: req.body.id_produto,
                quantidade: req.body.quantidade,
                request: {
                    tipo: 'GET',
                    descricao: 'Retornar todos os pedidos',
                    url: 'http://localhost:3000/produtos/'
                }
            }
        }
        return res.status(201).send(response)
    } catch (error) {
        returnError(error, res)
    }
}

//Retorna dados de um Pedidos
exports.getUmPedido = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM pedidos WHERE id_pedido = ?'
        const result = await mysql.execute(query, [req.params.id_pedido])
        if (result.length == 0) {
            return res.status(404).send({
                mensagem: 'Não foi encontrado pedido com esse ID'
            })
        }

        const response = {
            pedido: {
                id_produto: result[0].id_produto,
                id_pedido: result[0].id_pedido,
                quantidade: result[0].quantidade,
                request: {
                    tipo: 'GET',
                    descricao: 'Retorna todos os pedidos',
                    url: 'http://localhost:3000/pedidos/'
                }
            }
        }
        res.status(200).send(response)
    } catch (error) {
        returnError(error, res)
    }
}

//Deletar um Pedidos
exports.deletePedido = async (req, res, next) => {
    const query1 = 'SELECT * FROM pedidos WHERE id_pedido = ?'
    const result = await mysql.execute(query1, [req.body.id_pedido])
    if (result.length == 0) {
        return res.status(404).send({
            mensagem: 'Não foi encontrado pedido com esse ID'
        })
    }

    const query2 = 'DELETE FROM pedidos WHERE id_pedido = ?'
    await mysql.execute(query2, [req.body.id_pedido])

    const response = {
        mensagem: 'Produto removido com Sucesso',
        request: {
            tipo: 'POST',
            descricao: 'Inserir um pedido',
            url: 'http://localhost:3000/pedido/',
            body: {
                id_produto: 'Number',
                quantidade: 'Number'
            }
        }
    }
    res.status(202).send(response)
}

function returnError(error, res) {
    console.error('Erro na conexão do banco de dados:', error);
    return res.status(500).json({
        error: error,
        response: null
    });
}