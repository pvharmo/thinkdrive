import { Router } from 'express'

import { get, save } from './applications/container/container.controller'

const router: Router = Router()

router.get('/container/:userId/*', get)
router.post('/container/:userId/*', save)

export default router
