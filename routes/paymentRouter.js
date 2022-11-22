const router = require('express').Router()
const paymentCtrl = require('../controllers/paymentCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')


router.route('/payment')
    .get(auth, authAdmin, paymentCtrl.getPayments)
    .post(auth, paymentCtrl.createPayment)

router.route('/orders')
    .post(auth, paymentCtrl.payment)

router.route('/verify')
    .post(paymentCtrl.verify)

router.route('/UpdateOrder').put(auth, authAdmin, paymentCtrl.UpdatePayment)

module.exports = router
