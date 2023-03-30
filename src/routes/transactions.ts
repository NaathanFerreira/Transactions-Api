import { FastifyInstance } from 'fastify'
import crypto, { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  // middleware global, executa em toda chamada de qualquer rota
  app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`)
  })

  app.get('/', { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    const { sessionId } = req.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select('*')
    return { transactions }
  })

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (req, reply) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const params = getTransactionParamsSchema.parse(req.params)

      const { sessionId } = req.cookies
      const { id } = params

      const transaction = await knex('transactions')
        .where({
          id,
          session_id: sessionId,
        })
        .first()
      return { transaction }
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (req, reply) => {
      const { sessionId } = req.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    },
  )

  app.post('/', async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        // quais rotas do backend poderão acessar esses cookies
        path: '/',
        // tempo em milisegundos do quanto esse cookie vai durar
        maxAge: 1000 * 60 * 60 * 24 - 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      // caso seja débito, salva o amount com valor negativo
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
