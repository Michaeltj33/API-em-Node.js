const mysql = require('../mysql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Cadastro de Usuário
exports.cadastrarUsuario = async (req, res, next) => {
    try {
        const query1 = 'SELECT * FROM usuarios WHERE  email = ?'
        const result1 = await mysql.execute(query1, [req.body.email])

        if (result1.length > 0) {
            res.status(409).send({ mensagem: 'Usuário ja Cadastro' })
        } else {
            try {
                const hash = await new Promise((resolve, reject) => {
                    bcrypt.hash(req.body.senha, 10, (erroBcrypt, hash) => {
                        if (erroBcrypt) {
                            reject(erroBcrypt);
                        }
                        resolve(hash);
                    });
                });
                const query2 = 'INSERT INTO usuarios (email,senha) VALUES (?,?)'
                const result2 = await mysql.execute(query2, [req.body.email, hash])
                const response = {
                    mensagem: 'Usuário Criado com Sucesso',
                    usuarioCriado: {
                        id_usuario: result2.insertId,
                        email: req.body.email
                    }
                }
                return res.status(201).send(response)
            } catch (error) {
                returnError(error, res)
            }
        }
    } catch (error) {
        returnError(error, res)
    }
}
exports.login = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM usuarios WHERE email = ?'
        const results = await mysql.execute(query, [req.body.email])

        //Caso e-mail não seja encontrado
        if (results.length < 1) {
            return res.status(401).send({ mensagem: 'Falha na autenticação' })
        }

        //Uma senha resetada, indicando nova senha
        if (req.body.senha == 123) {
            return res.status(205).send({ mesangem: "senha padrão, favor criar uma nova senha" })
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