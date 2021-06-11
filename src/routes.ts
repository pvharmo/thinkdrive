import { Router } from 'express'

import {
  get,
  save,
  destroy,
} from './applications/container/container.controller'

const router: Router = Router()

router.get('/container/:userId/*', get)
router.post('/container/:userId/*', save)
router.delete('/container/:userId/*', destroy)

export default router
