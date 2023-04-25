const mongoose=require('mongoose')
const Mail = require('nodemailer/lib/mailer')
const userschema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobile:{
        type:String,
        required:true,
       
    },  

    password:{
        type:String,
        required:true
    },
   
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Number,
        required:true
    },
    discountedTotal:{
        type:Number
    },


    cart:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productdetails'
        },
        Quantity:{
            type:Number,
            required:true,
           
        },
        price:{
            type:Number,
            
        },
        totalprice:{
            type:Number,
            required:true
        },
        grandtotal:{
            type:Number,
            required:true
        }
       
    }],

    wishlist:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productdetails'
        }
    }],

    address:[{
        name:{
            type:String,
        },
        houseName:{
            type:String,
        },
        townCity:{
            type:String,
        },
        district:{
            type:String,
        },
        state:{
            type:String,
        },
        pincode:{
            type:String,
        },
        mobileNo:{
            type:Number,
        },
        email:{
            type:String,
        }

    }],


    wallet:{
        type:Number,
        default:0
    }
    
    
})



const usermodel = mongoose.model('user',userschema)
module.exports=usermodel