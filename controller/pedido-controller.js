const mysql = require('../mysql').pool

//Retorna todos os produtos
exports.getPedido = (req, res, next) => {
    mysql.getConnection((error, conn) => {

        if (error) {
            console.error('Erro na conexão do banco de dados: ' + error)
            return res.status(500).json({
                error: "Erro na conexão ao banco de dados",
                response: null
            })
        }
        conn.query(
            `SELECT pedidos.id_pedido,
           pedidos.quantidade,
           produtos.id_produto,
           produtos.nome,
           produtos.preco
           FROM pedidos
           INNER JOIN produtos
           ON produtos.id_produto = pedidos.id_produto`,
            (error, result, fields) => {
                if (error) {
                    console.error('Erro na conexão do banco de dados:', error)
                    return res.status(500).json({
                        error: 'Erro na conexão do banco de dados',
                        response: null
                    });
                }

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
            }
        )
    })
}

//Insere um Pedidos
exports.getPostPedidos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('Erro na conexão do banco de dados:', error)
            return res.status(500).json({
                error: 'Erro na conexão do banco de dados',
                response: null
            })
        }

        conn.query(
            'SELECT * from produtos where id_produto = ?', [req.body.id_produto], (error, result, flieds) => {
                if (error) {
                    console.error('Erro na conexão do banco de dados:', error)
                    return res.status(500).json({
                        error: 'Erro na conexão do banco de dados',
                        response: null
                    })
                }

                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Produto não encontrado'
                    })
                }
            }
        )

        conn.query(
            'INSERT INTO pedidos (id_produto,quantidade) VALUES (?,?)',
            [req.body.id_produto, req.body.quantidade],
            (error, result, fields) => {
                conn.release()
                if (error) {
                    console.error('Erro na conexão do banco de dados:', error)
                    return res.status(500).json({
                        error: 'Erro na conexão do banco de dados',
                        response: null
                    })
                }

                const response = {
                    mensagem: "Pedido Criado com Sucesso",
                    pedidoCriado: {
                        id_pedido: result.id_pedido,
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
            }
        )
    })
}

//Retorna dados de um Pedidos
exports.getUmPedido = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('Erro na conexão do banco de dados:' + error)
            return res.status(500).send({
                error: 'Erro na conexão do banco de dados:',
                response: null
            })
        }

        conn.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?', [req.params.id_pedido],
            (error, result, fields) => {
                if (error) {
                    console.error('Erro na conexão do banco de dados:' + error)
                    return res.status(500).send({
                        error: 'Erro na conexão do banco de dados:',
                        response: null
                    })
                }

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
            }
        )
    })
}

//Deletar um Pedidos
exports.deletePedido = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('Erro na conexão do banco de dados:' + error)
            return res.status(500).json({
                error: 'Erro na conexão do banco de dados',
                response: null
            })
        }
        conn.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?', [req.body.id_pedido], (error, results, fields) => {
                if (error) {
                    console.error('Erro na conexão do banco de dados:' + error)
                    return res.status(500).json({
                        error: 'Erro na conexão do banco de dados:',
                        response: null
                    })
                }

                if (results.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado pedido com esse ID'
                    })                    
                }
            }
        )

        conn.query(
            'DELETE FROM pedidos WHERE id_pedido = ?', [req.body.id_pedido],
            (error, result, fields) => {
                conn.release()
                if (error) {
                    console.error('Erro na conexão do banco de dados:' + error)
                    return res.status(500).json({
                        error: 'Erro na conexão do banco de dados:',
                        response: null
                    })
                }

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
        )
    })
}