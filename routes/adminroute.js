const express = require('express')
const admin_route= express()
const session = require('express-session')
const config = require("../config/config")
const multer = require('multer')
const path = require('path')
admin_route.use(session({secret:config.sessionsecret,resave:false,saveUninitialized:false}))

const adminauth = require('../middleware/adminauth')
const bodyparser=require('body-parser')
const admincontroller= require('../controllers/admincontroller')
const couponcontroller = require('../controllers/couponcontroller')

admin_route.set('view engine','ejs')
admin_route.set('views','./view/admin')
admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({extended:true}))

const storage = multer.diskStorage({
   destination:function(req,file,cb){
      
      cb(null,'./public/productimages/temp',function(err,sucess){
         if(err){
            throw err
         }
      })
   },
   filename:function(req,file,cb){
      const name = Date.now()+'-'+file.originalname
      cb(null,name,function(error,sucess){
         if(error)
         {
            throw error
         }
      })
   }
})


/////define image validation////////////


const upload = multer({storage:storage})

admin_route.post('/addproducts',upload.array('images',5),admincontroller.add_product)


admin_route.get('/',admincontroller.adminlogin) 
admin_route.post('/login',admincontroller.adminverify)
admin_route.get('/home',admincontroller.loadDashbord)
admin_route.get('/logout',admincontroller.adminlogout)
admin_route.get('/dashboard',admincontroller.userdetails)

admin_route.post('/editproducts',upload.array('images',5),admincontroller.updateproduct)

admin_route.get('/productlist',admincontroller.adminproductlist)
admin_route.get('/addproducts',admincontroller.adminaddproducts)
admin_route.get('/editproducts',admincontroller.admineditproducts)
admin_route.get('/deleteproducts',admincontroller.deleteproducts)
admin_route.post('/blockuser',admincontroller.blockuser)
admin_route.post('/unblockuser',admincontroller.unblockuser)
admin_route.get('/category',admincontroller.category)
admin_route.post('/addnewcategory',admincontroller.addnewcategory)
admin_route.get('/deletecategory',admincontroller.deletecategory)
admin_route.get('/editcategory',admincontroller.editcategory)
admin_route.post('/editcategory',admincontroller.categoryedit)
admin_route.get('/banner',admincontroller.banner)
admin_route.post('/addbanner',upload.array('images',5),admincontroller.addbanner)
admin_route.get('/editbanner',admincontroller.editbanner)
admin_route.post('/updatebanner',upload.array('images',5),admincontroller.updatebanner)
admin_route.get('/listbanner',admincontroller.listbanner)
admin_route.get('/deletebanner',admincontroller.deletebanner)
admin_route.get('/orderdetails',admincontroller.orderdetails)
admin_route.post('/orderdeliver',admincontroller.orderdelivered)
admin_route.post('/ordershipped',admincontroller.ordershipped)
admin_route.post('/returnaccept',admincontroller.adminorderreturn)

admin_route.get('/coupon',couponcontroller.couponDetails)
admin_route.post('/addcoupon',couponcontroller.addcoupon)
admin_route.get('/deletecoupon',couponcontroller.deletecoupon)
admin_route.get('/salesreport',admincontroller.loadSales)
admin_route.post('/salesreport',admincontroller.sales)
admin_route.get('/product/image-remove',admincontroller.productsimagremove)

// admin_route.get('*',function(req,res){

//    res. redirect('/admin')

// })



module.exports=admin_route