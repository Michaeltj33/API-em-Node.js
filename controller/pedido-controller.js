const mysql = require('../mysql')
const redis = require('../redis')
const client = redis.client

//Retorna todos os produtos
exports.getPedido = async (req, res, next) => {
    try {
        const limit = req.query._limit || 1000

        const pedidoFromCache = await client.get('getPedido')
        const isPedidoFromCacheStale = await client.get('getPedido:validation')
        const query = `SELECT pedidos.id_pedido,
                    pedidos.quantidade,
                    produtos.id_produto,
                    produtos.nome,
                    produtos.preco
                    FROM pedidos
                    INNER JOIN produtos
                    ON produtos.id_produto = pedidos.id_produto order by id_pedido limit ${limit}`

        if (isPedidoFromCacheStale) {
            const isRefetcing = !!(await client.get('getPedido:id-refetaching'))
            if (!isRefetcing) {
                await client.set('getPedido:id-refetaching', 'true', { EX: 20 })
                setTimeout(async()=>{
                    const resultVerify = await mysql.execute(query)
                    await client.set('getPedido', JSON.stringify(resultVerify))
                    await client.set('getPedido:validation', "true", { EX: 5 })
                    await client.del('getPedido:id-refetaching')
                })
            }
        }

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
        if (pedidoFromCache) {
            return res.status(200).json(response)
        }

        await client.set('getPedido', JSON.stringify(response))

        return res.status(200).json(response)
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
            return res.status(404).json({
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
        return res.status(201).json(response)
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
            return res.status(404).json({
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
        res.status(200).json(response)
    } catch (error) {
        returnError(error, res)
    }
}

//Deletar um Pedidos
exports.deletePedido = async (req, res, next) => {
    const query1 = 'SELECT * FROM pedidos WHERE id_pedido = ?'
    const result = await mysql.execute(query1, [req.body.id_pedido])
    if (result.length == 0) {
        return res.status(404).json({
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
    res.status(202).json(response)
}

function returnError(error, res) {
    console.error('Erro na conexão do banco de dados:', error);
    return res.status(500).json({
        error: error,
        response: null
    });
}