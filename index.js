const mongoose= require('mongoose')
const express=require('express')
const path=require('path')
const app=express()
const nocache=require('nocache')
const  morgan = require('morgan')
app.use(nocache())
app.use(morgan('dev'));
///////////user route/////
const user_route=require('./routes/userRoute')


//////////////admin route//////
const admin_route=require('./routes/adminroute')

/////////////// 404/////////////
const error_route=require('./routes/404page')


mongoose.set('strictQuery', false)


mongoose.connect('mongodb://127.0.0.1:27017/user_managment_system',(err)=>{
    if (err) {
      console.log('database not connected')  
    }
    else {
        console.log('databse connected')
    }
}) 
app.use(express.static(__dirname + '/public'));

app.use('/admin',admin_route)
app.use('/',user_route)
app.use('/',error_route)

app.use((err,req,res,next)=>{
   res.status()
})

app.listen(3000,()=>{
    console.log('server is running....')
})