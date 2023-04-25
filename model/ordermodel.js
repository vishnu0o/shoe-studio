const mongoose = require('mongoose')


const orderschema = new mongoose.Schema({

    orderid:{
        type:String,
        require:true
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    orderedProduct:{
        type:Array,
        require:true
    },

    order:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productdetails',
            require:true


        },
        price:{
            type:Number,

        },
        total:{
            type:Number,
            require:true

        },
        quantity:{
            type:Number,
            require:true
        },
        paymentmethod:{
            type:String,
            require:true
        },
       
       
        date:{
            type:Date,
            require:true
        },
        
        deliveredDate:{
            type:Date,
            
        },
        returndate:{
            type:Date,
            require:true
        },
        status:{
            type:String,
            require:true,
            default:'OrderConfirmed'
        },
        
        
    }],
    address:{
        type:Object,
        require:true
    },
    grandtotal:{
        type:Number,
        require:true
    },
    subtotal:{
        type:Number
    },
    discount:{
        type:Number
    }
    
})


const ordermodel = mongoose.model('order',orderschema)
module.exports=ordermodel