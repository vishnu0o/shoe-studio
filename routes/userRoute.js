const express = require('express')
const user_route= express()
const session = require('express-session')
// const config = require("../config/config")
const errorpage = require('../routes/404page')

user_route.use(session({secret:process.env.sessionsecre,resave:false,saveUninitialized:true}))


const auth = require('../middleware/auth')
const blocked = require('../middleware/is_blocked')

const bodyparser=require('body-parser')
const userController= require('../controllers/userController')
const couponcontroller = require('../controllers/couponcontroller')

user_route.set('view engine','ejs')
user_route.set('views','./view/user')
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}))

user_route.get('/',blocked.is_blocked,userController.homepage)
user_route.get('/home',userController.homepage)

user_route.post('/register',userController.insertuser)
user_route.get('/login',auth.islogout,userController.login)
user_route.get('/otp',auth.islogout,userController.otplogin)
user_route.get('/otppage',userController.enterotp)
user_route.post('/otppage',userController.verifyotpMail)
user_route.get('/resend',userController.resendotpMail)
user_route.post('/otpenter',userController.otpVerify)
user_route.post('/home',userController.verifylogin)
user_route.get('/register',userController.loadRegister)
user_route.get('/logout',userController.userlogout)
user_route.get('/verify',userController.verifymail)
user_route.get('/productdetails',blocked.is_blocked,userController.productdetails,errorpage)
user_route.get('/cart',blocked.is_blocked,auth.islogin,userController.cartdetails)
user_route.post('/addtocart',userController.addtocart)
user_route.get('/addtocart',blocked.is_blocked,userController.addtocart)
user_route.post('/increment',userController.increment)
user_route.post('/decrement',userController.decrement)
user_route.get('/wishlist',blocked.is_blocked,userController.wishlist)
user_route.get('/addtowishlist',blocked.is_blocked,userController.addtowishlist)
user_route.get('/shop',blocked.is_blocked,userController.shop)
user_route.get('/deletewishlist',blocked.is_blocked,userController.deletewishlist)
user_route.get('/deletecart',blocked.is_blocked,userController.deletecart)
user_route.get('/checkout',blocked.is_blocked,userController.checkout)
user_route.get('/profile',blocked.is_blocked,userController.profile)
user_route.get('/editprofile',blocked.is_blocked,userController.editprofile)
user_route.post('/updateprofile',userController.updateprofile)
user_route.get('/address',blocked.is_blocked,userController.address)
user_route.get('/addaddress',blocked.is_blocked,userController.addaddress)
user_route.post('/insertaddress',userController.insertaddress)
user_route.get('/deleteaddress',blocked.is_blocked,userController.deleteaddress)
user_route.get('/editaddress',blocked.is_blocked,userController.editaddress)
user_route.post('/editaddress',userController.updateaddress)
user_route.post('/placeorder',userController.placeorder)
user_route.get('/orderlist',blocked.is_blocked,userController.orderlist)
user_route.get('/orderdetails',blocked.is_blocked,userController.orderdetails)
user_route.post('/ordercancel',blocked.is_blocked,userController.cancelorder)
user_route.post('/orderreturn',blocked.is_blocked,userController.returnorder)
user_route.get('/orderSucess',blocked.is_blocked,userController.ordersuccess)
user_route.get('/razorpay',blocked.is_blocked,userController.razorpay)
user_route.get('/categoryfilter',blocked.is_blocked,userController.categoryfilter)


//////////// coupon ////////////

user_route.post('/coupon',couponcontroller.useCoupon)







module.exports=user_route