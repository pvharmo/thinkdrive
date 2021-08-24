import { Router } from 'express'

import * as container from './applications/container/container.controller'
import * as obj from './applications/object/object.controller'
import * as share from './applications/share/share.controller'

const router: Router = Router()

router.get('/container/:userId/*', container.get)
router.post('/container/:userId/*', container.save)
router.delete('/container/:userId/*', container.destroy)
router.put('/container/move/:userId/*', container.move)
router.put('/container/trash/:userId/*', container.trash)

router.get('/object/:userId/*', obj.get)
router.post('/object/:userId/*', obj.upsert)
router.delete('/object/:userId/*', obj.destroy)
router.put('/object/move/:userId/*', obj.move)
router.put('/object/trash/:userId/*', obj.trash)

router.get('/metadata/:userId/*', obj.getMetadata)

router.get('/share/:userId/*', share.getStatus)
router.put('/share/:userId/*', share.setStatus)

export default router
