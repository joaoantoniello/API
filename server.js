import express from 'express'
import pkg from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

const app = express()
app.use(express.json())

const SECRET_KEY = 'chave_secreta_aqui' 


function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.sendStatus(401)

    jwt.verify(token, SECRET_KEY, (err, usuario) => {
        if (err) return res.sendStatus(403)
        req.usuario = usuario
        next()
    })
}


app.post('/usuarios', async (req, res) => {
    const { email, name, age, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            name,
            age,
            password: hashedPassword
        }
    })

    res.status(201).json(user)
})


app.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

    const senhaCorreta = await bcrypt.compare(password, user.password)

    if (!senhaCorreta) return res.status(401).json({ message: 'Senha incorreta' })

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' })

    res.json({ token })
})


app.get('/usuarios', autenticarToken, async (req, res) => {
    const allUsers = await prisma.user.findMany()
    res.status(200).json(allUsers)
})

app.put('/usuarios/:id', autenticarToken, async (req, res) => {
    await prisma.user.update({
        where: {
            id: req.params.id
        },
        data: {
            email: req.body.email,
            name: req.body.name,
            age: req.body.age
        }
    })

    res.status(200).json(req.body)
})

app.delete('/usuarios/:id', autenticarToken, async (req, res) => {
    await prisma.user.delete({
        where: {
            id: req.params.id,
        },
    })

    res.status(200).json({ message: 'Usuário deletado com Sucesso!' })
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})