const mongoose = require('mongoose')
const bannerschema = mongoose.Schema({

    header:{
        type:String,
        required:true
    },

    banner_text_upper:{
        type:String,
        required:true
    },

    banner_description:{
        type:String,
        required:true
    },
    banner_text_down:{
        type:String,
        required:true
    },
    images:{
        type:Array,
        required:true
    }

})

module.exports=mongoose.model('bannerdetails',bannerschema)