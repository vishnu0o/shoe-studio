const mongoose = require('mongoose')
const categoryschema=mongoose.Schema({
    categoryname:{
    type:String,
    required:true
    },

})


module.exports=mongoose.model('categorydetails',categoryschema)