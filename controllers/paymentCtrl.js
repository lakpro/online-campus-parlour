const Payments = require('../models/paymentModel')
const Users = require('../models/userModel')
const Products = require('../models/productModel')
const Razorpay = require("razorpay");
const crypto = require("crypto");


const paymentCtrl = {
    getPayments: async(req, res) =>{
        try {
            const payments = await Payments.find()
            res.json(payments)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    createPayment: async(req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('name email')
            if(!user) return res.status(400).json({msg: "User does not exist."})

            const {cart, paymentID} = req.body;

            const {_id, name, email} = user;

            const newPayment = new Payments({
                user_id: _id, name, email, cart, paymentID
            })

            cart.filter(item => {
                return sold(item._id, item.quantity, item.sold)
            })

            
            await newPayment.save()
            res.json({msg: "Payment Success!"})
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    payment: async(req, res) => {
        try {
            const instance = new Razorpay({
                key_id: process.env.KEY_ID,
                key_secret: process.env.KEY_SECRET,
            });
    
            const options = {
                amount: req.body.amount * 100,
                currency: "INR",
                receipt: crypto.randomBytes(10).toString("hex"),
            };
    
            instance.orders.create(options, (error, order) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Something Went Wrong!" });
                }
                res.status(200).json({ data: order });
            });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error!" });
            console.log(error);
        }
    }, 
    verify: async(req, res) => {
        try {
            
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
                req.body.response;
            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac("sha256", process.env.KEY_SECRET)
                .update(sign.toString())
                .digest("hex");
              

                
                
            if (razorpay_signature === expectedSign) {
                
                return res.status(200).json({ message: "Payment verified successfully" });

            } else {
                return res.status(400).json({ message: "Invalid signature sent!" });
            }
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error!" });
            console.log(error);
        }
    },
    UpdatePayment: async(req, res) => {
        try{
            
            const id = req.body._id;
            console.log(id)
            await Payments.findOneAndUpdate({_id: id}, {status: true})
            
            res.json({msg: "Completed the order"})


        }catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

const sold = async (id, quantity, oldSold) =>{
    await Products.findOneAndUpdate({_id: id}, {
        sold: quantity + oldSold
    })
}

module.exports = paymentCtrl
