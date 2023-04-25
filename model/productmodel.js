
const mongoose=require('mongoose')

const productschema=mongoose.Schema({
    product_name:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true,
       
    },
  product_description:{
        type:String,
        required:true,
       
    },

    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'categorydetails',
        required:true
    },
   
    price:{
        type:Number,
        required:true
    },
    quantity_adding:{
        type:Number,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    style:{
        type:String,
        required:true
    },
    size:{
        type:Array,
        required:true
    },
    images:{
        type:Array,
        required:true
    },
    is_deleted:{
        type:Number,
        required:true
    }

   
    
})


module.exports=mongoose.model('productdetails',productschema)