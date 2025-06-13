import express, { request, response } from 'express'
import pkg from '@prisma/client'
const { PrismaClient } = pkg


const prisma = new PrismaClient()


const app = express()
app.use(express.json())

const users = []

app.post('/usuarios', async (req, res) => {

    await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            age: req.body.age
        }
    })

    res.status(201).json(req.body)
})

app.get('/usuarios', async (req, res) => {
  const allUsers = await prisma.user.findMany()
  res.status(200).json(allUsers)
})


app.listen(3000)

//joao

//JuniorVach
//g81U8s7sTslnFwvV