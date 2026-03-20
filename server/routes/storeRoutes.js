import { Router } from 'express'
import { getStoreItems, purchaseItem, getInventory, activateItem, getStoreCatalogue, purchaseBySlug, getOwnedSlugs } from '../controllers/storeController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/items',      getStoreItems)
router.get('/catalogue',  getStoreCatalogue)
router.get('/inventory',  getInventory)
router.get('/owned',      getOwnedSlugs)
router.post('/purchase',  purchaseItem)
router.post('/purchase/slug', purchaseBySlug)
router.post('/activate',  activateItem)

export default router
