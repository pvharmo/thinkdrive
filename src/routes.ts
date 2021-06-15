import { Router } from 'express'

import * as container from './applications/container/container.controller'
import * as obj from './applications/object/object.controller'

const router: Router = Router()

router.get('/container/:userId/*', container.get)
router.post('/container/:userId/*', container.save)
router.delete('/container/:userId/*', container.destroy)

router.get('/object/:userId/*', obj.get)
router.post('/object/:userId/*', obj.create)

export default router
