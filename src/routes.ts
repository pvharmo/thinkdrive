import { Router } from 'express'

import * as container from './applications/container/container.controller'
import * as obj from './applications/object/object.controller'
import * as share from './applications/share/share.controller'
import * as auth from './applications/auth/auth.controller'

const router: Router = Router()

router.post('/internal/new-user', auth.newUser)

router.get('/container/*', container.get)
router.post('/container/*', container.save)
router.delete('/container/*', container.destroy)
router.put('/container/move/*', container.move)
router.put('/container/trash/*', container.trash)

router.get('/object/*', obj.get)
router.post('/object/*', obj.upsert)
router.delete('/object/*', obj.destroy)
router.put('/object/move/*', obj.move)
router.put('/object/trash/*', obj.trash)

router.get('/metadata/*', obj.getMetadata)

router.get('/share/*', share.getStatus)
router.put('/share/*', share.setStatus)

export default router
