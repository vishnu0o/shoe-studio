const mongoose= require('mongoose')
const express=require('express')
const path=require('path')
const app=express()
const nocache=require('nocache')
const  morgan = require('morgan')
app.use(nocache())
app.use(morgan('dev'));
const env = require('dotenv').config();
///////////user route/////
const user_route=require('./routes/userRoute')


//////////////admin route//////
const admin_route=require('./routes/adminroute')

/////////////// 404/////////////
const error_route=require('./routes/404page')
const { log } = require('console')


mongoose.set('strictQuery', false)

mongoose.connect(process.env.url,(err)=>{
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

app.listen(process.env.port,()=>{
    console.log('server is running....')
})