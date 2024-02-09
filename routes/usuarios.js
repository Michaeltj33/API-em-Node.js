const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool
const bcrypt = require('bcrypt')

router.post('/cadastro', (req, res, next) => {
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
})




module.exports = router