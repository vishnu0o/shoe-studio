const islogin = async(req,res,next)=>{


    try {
        if(req.session.user_id){
            next()
        } 
    
    else{
        res.redirect('/login')
    }
   
}
    catch(error){
        console.log(error.message)
    }
}
const islogout = async(req,res,next)=>{


    try {

        if(req.session.user_id){
            res.redirect('/home')
        }else{
            next()
        }
       

    }
    catch(error){
        console.log(error.message)
    }
}

module.exports={islogin,islogout}