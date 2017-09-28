import Router from 'koa-router'
import workflow from '../../controllers/workflow'
import _log from '../../utils/logger'
import requestParser from '../requestParsers/didParser'

const log = _log(module)

const router = new Router({
    prefix: '/users'
})

/**
 * @api {post} /users/ Add user
 * @apiVersion 1.0.0
 * @apiPermission admin
 * @apiName AddUser
 * @apiGroup Users
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *
 *     }
 *
 * @apiUse TokenError
 */
router.post('/', async (ctx) => {
    const qs = ctx.request.query
    const body = ctx.request.body

    // get optional ledgers
    let optionalLedgers
    if (qs.ledger) {
        optionalLedgers = qs.ledger.split(',')
    }

    let result = {}
    try {
        log.debug('parsing request')
        // parse request body as per oem and message type
        const payload = requestParser(body)

        log.debug('starting transaction workflow')

        // invoke workflow with all ledgers
        result = await workflow(payload.asset, payload.metadata, optionalLedgers)

        log.debug('transaction workflow completed')
        ctx.body = result
        ctx.status = 200
    } catch (error) {
        log.error(error)
        ctx.body = error.message
        ctx.status = 500
    }
})

export default router
