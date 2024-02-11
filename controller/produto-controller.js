const mysql = require('../mysql').pool

//Retorna todos os produtos
exports.getProdutos = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('Erro na conexão do banco de dados:', error);
            return res.status(500).json({
                error: 'Erro na conexão do banco de dados',
                response: null
            });
        }

        conn.query(
            'SELECT * FROM produtos',
            (error, result, fields) => {
                if (error) {
                    console.error('Erro na conexão do banco de dados:', error);
                    return res.status(500).json({
                        error: 'Erro na conexão do banco de dados',
                        response: null
                    });
                }

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
                return res.status(200).send({ response: response })
            }
        )
    })
}

//Insere um produtos
exports.postPorduto = (req, res, next) => {
    console.log(req.file)//mostra quando uma imagem é enviada
    mysql.getConnection((error, conn) => {
        //Verificar se houver erro de conexão
        if (error) {
            console.error('Erro na conexão do banco de dados:', error);
            return res.status(500).json({
                error: 'Erro na conexão do banco de dados',
                response: null
            });
        }

        conn.query(
            'INSERT INTO produtos (nome,preco,imagem_produto) VALUES (?,?,?)',
            [req.body.nome, req.body.preco, req.file.path],
            (error, resultado, fields) => {
                //req.file.path -> pega o caminho da iamgem
                conn.release()
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    })
                }

                const response = {
                    mensagem: 'Produto Criado com Sucesso',
                    produtoCriado: {
                        id_produto: resultado.id_produto,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        imagem_produto: req.file.path,
                        request: {
                            tipo: "POST",
                            descricao: 'Insere um produto',
                            url: 'http://localhost:3000/produtos/'
                        }
                    }
                }
                return res.status(201).send(response)
            }
        )
    })
}

//Retorna dados de um produto
exports.getUmproduto = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('Erro na conexão do banco de dados:', error);
            return res.status(500).json({
                error: 'Erro na conexão do banco de dados',
                response: null
            });
        }

        conn.query(
            'SELECT * FROM produtos WHERE id_produto = ?', [req.params.id_produto],
            (error, result, fields) => {
                if (error) {
                    console.error('Erro na conexão do banco de dados:', error);
                    return res.status(500).json({
                        error: 'Erro na conexão do banco de dados',
                        response: null
                    });
                }
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
            }
        )
    })
}

//Altera um produto
exports.updateProduto = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        //Verificar se houver erro de conexão
        if (error) {
            console.error('Erro na conexão do banco de dados:', error);
            return res.status(500).json({
                error: 'Erro na conexão do banco de dados',
                response: null
            });
        }

        conn.query(
            'UPDATE produtos Set nome = ?, preco = ? WHERE id_produto = ?',
            [req.body.nome, req.body.preco, req.body.id_produto],
            (error, result, fields) => {
                conn.release()
                if (error) {
                    console.error('Erro na conexão do banco de dados:', error);
                    return res.status(500).json({
                        error: 'Erro na conexão do banco de dados',
                        response: null
                    });
                }

                const response = {
                    mensagem: 'Produto Atualizado com Sucesso',
                    produtoCriado: {
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
            }
        )
    })
}

//Deleta um produto
exports.deleteProduto = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        //Verificar se houver erro de conexão
        if (error) {
            console.error('Erro na conexão do banco de dados:', error);
            return res.status(500).json({
                error: 'Erro na conexão do banco de dados',
                response: null
            });
        }

        conn.query(
            'DELETE FROM produtos WHERE id_produto = ?',
            [req.body.id_produto],
            (error, resultado, fields) => {
                conn.release()
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null
                    })
                }

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
            }
        )
    })
}

