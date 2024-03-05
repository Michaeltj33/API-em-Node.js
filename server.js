const http = require('http')
const port = process.env.PORT || 3000
const app = require('./app')
const redis = require('./redis')

const server = http.createServer(app)

const startup = async () => {
    await redis.client.connect()
    server.listen(port, () => { console.log('Servidor Rodando na porta ' + port) })
}
startup()





