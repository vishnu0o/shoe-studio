const express = require("express");
const router = express();

router.set('view engine','ejs')
router.set('views','./view/user')

 const errorpage = router.get('*',(req,res) => res.render('404page'));



module.exports = errorpage ;   