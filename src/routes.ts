import { Router } from 'express'

import * as container from './applications/container/container.controller'
import * as obj from './applications/object/object.controller'
import * as share from './applications/share/share.controller'

const router: Router = Router()

router.get('/container/:userId/*', container.get)
router.post('/container/:userId/*', container.save)
router.delete('/container/:userId/*', container.destroy)
router.put('/container/:userId/*', container.move)

router.get('/object/:userId/*', obj.get)
router.post('/object/:userId/*', obj.upsert)
router.put('/object/:userId/*', obj.move)
router.delete('/object/:userId/*', obj.destroy)

router.get('/metadata/:userId/*', obj.getMetadata)

router.get('/share/:userId/*', share.getStatus)
router.put('/share/:userId/*', share.setStatus)

export default router
