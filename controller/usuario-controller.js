const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Cadastro de Usuário
exports.cadastrarUsuario = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            console.error('Erro na conexão do banco de dados:', error);
            return res.status(500).json({
                error: 'Erro na conexão do banco de dados',
                response: null
            });
        }

        conn.query('SELECT * FROM usuarios WHERE  email = ?', [req.body.email], (error, result) => {
            if (error) {
                console.error('Erro na conexão do banco de dados:', error);
                return res.status(500).json({
                    error: 'Erro na conexão do banco de dados',
                    response: null
                });
            }
            if (result.length > 0) {
                res.status(409).send({ mensagem: 'Usuário ja Cadastro' })
            } else {
                bcrypt.hash(req.body.senha, 10, (erroBcrypt, hash) => {
                    if (erroBcrypt) {
                        return res.status(500).send({ error: erroBcrypt })
                    }
                    conn.query(
                        'INSERT INTO usuarios (email,senha) VALUES (?,?)', [req.body.email, hash], (error, result) => {
                            conn.release()
                            if (error) {
                                console.error('Erro na conexão do banco de dados:', error);
                                return res.status(500).json({
                                    error: 'Erro na conexão do banco de dados',
                                    response: null
                                });
                            }

                            const response = {
                                mensagem: 'Usuário Criado com Sucesso',
                                usuarioCriado: {
                                    id_usuario: result.insertId,
                                    email: req.body.email
                                }
                            }

                            return res.status(201).send(response)
                        }
                    )
                })
            }
        })
    })
}

exports.login = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        returnErro(error)
        const query = `SELECT * FROM usuarios WHERE email = ?`
        conn.query(query, [req.body.email], (error, results, fields) => {
            conn.release()
            returnErro(error)
            if (results.length < 1) {//email não encontrado
                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            }

            if(req.body.senha == 123){
                return res.status(205).send({ mesangem : "senha padrão, favor criar uma nova mensagem"})
            }

            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação' })
                }

                if (result) {  
                    const token = jwt.sign({
                        id_usuario: results[0].id_usuario,
                        email: results[0].email
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        })

                    return res.status(200).send({
                        mensagem: 'Autenticado com Sucesso',
                        token: token
                    })
                }

                return res.status(401).send({ mensagem: 'Falha na autenticação' })
            })
        })
    })
}

function returnErro(error) {
    if (error) {
        console.error('Erro na conexão do banco de dados:', error);
        return res.status(500).json({
            error: 'Erro na conexão do banco de dados',
            response: null
        });
    }
}