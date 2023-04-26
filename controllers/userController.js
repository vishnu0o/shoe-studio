const userschema = require('../model/userModel')
const productschema = require('../model/productmodel')
const bannerschema = require('../model/bannermodel')
const orderschema = require('../model/ordermodel')
const categoryschema = require('../model/categorymodel')
const couponschema = require('../model/couponemodel')
const { v4: uuidv4 } = require('uuid');

const nodemailer = require('nodemailer')

const bcrypt = require('bcrypt')
const { ConnectionPoolMonitoringEvent, ObjectId } = require('mongodb')
let msg
let message
let mess
let cartalert
let blocked
let messa


const securepassword = async (password) => {

    try {
        const passwordhash1 = await bcrypt.hash(password, 10)

        return { passwordhash1 }
    }
    catch (error) {

        console.log(error.message)

    }
}

//////////// for-email verification///////////////



const sendverifymail = async (name, email, user_id) => {
    try {


        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            require: true,
            auth: {
                user: 'shoestudio195@gmail.com',
                pass: 'uorwjvetdvkbfjhg'
            }
        })
        const mailoptions = {
            from: 'shoestudio195@gmail.com',
            to: email,
            subject: 'For email verification',
            html: '<p>Hi ' + name + ', please click here to <a href="https://shoestudio.store/verify?id=' + user_id + '">verify</a> your mail.</p>'
        }
        transporter.sendMail(mailoptions, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log('email has been send: - ', info
                    .response)
            }
        })
    }
    catch (error) {
        console.log(error)
    }
}

const loadRegister = async (req, res) => {
    try {

        res.render('registration', { message })
        message = null
    }
    catch (error) {
        console.log(error.message)
        next(err)
    }
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8}$/;
const phoneRegex = /^\d{10}$/;
const insertuser = async (req, res) => {
    try {

        const repeat = await userschema.findOne({ email: req.body.email })

        if (req.body.name == '' && req.body.email == '' && req.body.password == '' && req.body.mobile == '' && req.body.repassword == '') {
            message = 'enter email and password'
            res.redirect('/register')


        }
        else if (req.body.name == '') {
            message = 'enter you name'
            res.redirect('/register')
        }
        else if (req.body.email == '') {
            message = 'enter your email'
            res.redirect('/register')
        }

        else if (!emailRegex.test(req.body.email)) {
            message = 'email is not valid'
            res.redirect('/register')
        }

        else if (repeat) {
            message = 'Email already exist'
            res.redirect('/register')
        }
        else if (req.body.mobile == '') {
            message = 'Enter phone number'
            res.redirect('/register')
        }
        else if (!phoneRegex.test(req.body.mobile)) {
            message = 'Invalid phone number'
            res.redirect('/register')
        }
        else if (req.body.password == '') {
            message = 'enter your password'
            res.redirect('/register')
        }

        //    else if (!passwordRegex.test(req.body.password)) {
        //         message = 'password must have 8 character'
        //         res.redirect('/register')
        //     }
        else if (req.body.password != req.body.repassword) {
            message = 'Re-enter password incorrect'
            res.redirect('/register')
        }

        else {
            console.log('hai')
            const { passwordhash1 } = await securepassword(req.body.password)
            const user = new userschema({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: passwordhash1,
                is_admin: 0,
                is_verified: 0,
                is_blocked: 0,
                wallet: 0



            })

            const userdata = await user.save()

            if (userdata) {
                sendverifymail(req.body.name, req.body.email, userdata._id)

                res.redirect('/login')

            }
            else {
                res.render('registration', { message: "your registration has been failed" })
                message = null

            }

        }
    }
    catch (error) {
        console.log(error);
        next(err)
    }


}

////////////login function//////////////

const login = async (req, res) => {
    try {
        console.log(req.session)
        res.render('login', { message, mess })
        message = null
        mess = null

    }
    catch (error) {
        console.log(error)
    }
}


const otplogin = async (req, res) => {
    try {
        res.render('otplogin', { msg })
        msg = null

    }
    catch (error) {
        console.log(error)
    }
}

const enterotp = async (req, res) => {
    try {
        res.render('otpenter', { message })
        message = null
    }
    catch (error) {
        console.log(error)
    }
}

// otp generate  ///////


function otpgen() {
    OTP = Math.random() * 1000000
    OTP = Math.floor(OTP)
    return OTP
}
let otp

////////////Otp send //////////

let otpChechMail
let otpTimer = null
const verifyotpMail = async (req, res) => {
    try {
        if (req.body.email.trim().length == 0) {
            res.redirect('/otp')
            msg = 'Please fill the form'
        } else {
            otpChechMail = req.body.email
            const userData = await userschema.findOne({ email: otpChechMail })
            console.log(userData);

            if (userData) {
                if (otpChechMail) {
                    if (userData.is_verified == 1) {
                        if (userData.is_blocked == 0) {
                            res.redirect('/otppage')
                            const mailtransport = nodemailer.createTransport({
                                host: 'smtp.gmail.com',
                                port: 465,
                                secure: true,
                                auth: {
                                    user: 'shoestudio195@gmail.com',
                                    pass: 'uorwjvetdvkbfjhg'
                                },
                            });

                            otp = otpgen()
                            let details = {
                                from: "shoestudio195@gmail.com",
                                to: otpChechMail,
                                subject: "shoe studio",
                                text: otp + " is your shoe studio verification code. Do not share OTP with anyone "
                            }
                            mailtransport.sendMail(details, (err) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("success");
                                }
                            })


                        } else {
                            res.redirect('/otp')
                            msg = 'Your account has been blocked'
                        }
                    } else {
                        res.redirect('/otp')
                        msg = 'Mail is not verified'
                    }
                }
            } else {
                res.redirect('/otp')
                msg = 'user not found'
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

/////verify otp////////////


const otpVerify = async (req, res) => {
    try {

        const userotp = req.body.otp.join('')
        if (userotp.trim().length == 0) {
            res.redirect('/otppage')
            msg = 'Please Enter OTP'
        } else {
            const OTP = userotp
            // if(regex_otp.test(OTP)==false){
            //     res.redirect('/otppage')
            //     msg='Only numbers allowed'
            if (otp == OTP) {
                const userData = await userschema.findOne({ email: otpChechMail })
                req.session.user_id = userData._id;
                console.log(req.session.user_id);
                res.redirect('/')
            } else {
                console.log('hai')
                message = 'OTP is incorrect'
                res.redirect('/otppage')

            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////resend otp ////////////////////

const resendotpMail = async (req, res) => {
    try {

        console.log(otpChechMail)
        if (otpChechMail == null) {

            res.redirect('/otp')
            msg = 'Please fill the form'
        } else {

            const userData = await userschema.findOne({ email: otpChechMail })


            if (userData) {
                if (otpChechMail) {
                    if (userData.is_verified == 1) {
                        if (userData.is_blocked == 0) {
                            res.redirect('/otppage')
                            const mailtransport = nodemailer.createTransport({
                                host: 'smtp.gmail.com',
                                port: 465,
                                secure: true,
                                auth: {
                                    user: 'shoestudio195@gmail.com',
                                    pass: 'uorwjvetdvkbfjhg'
                                },
                            });

                            otp = otpgen()
                            let details = {
                                from: "shoestudio195@gmail.com",
                                to: otpChechMail,
                                subject: "shoe studio",
                                text: otp + " is your shoe studio verification code. Do not share OTP with anyone "
                            }
                            mailtransport.sendMail(details, (err) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("success");
                                }
                            })


                        } else {
                            res.redirect('/otp')
                            msg = 'Your account has been blocked'
                        }
                    } else {
                        res.redirect('/otp')
                        msg = 'Mail is not verified'
                    }
                }
            } else {
                res.redirect('/otp')
                msg = 'user not found'
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifylogin = async (req, res) => {
    try {
        if (req.body.email == '' && req.body.password == '') {
            message = 'enter email and password'
            res.redirect('/login')


        }
        else if (req.body.email == '') {
            message = 'enter you email'
            res.redirect('/login')
        }
        else if (req.body.password == '') {
            message = 'enter your password'
            res.redirect('/login')
        }
        else {
            const emailid = req.body.email
            const passwordid = req.body.password

            const userid = await userschema.findOne({ email: emailid })

            if (userid) {
                const passwordmatch = await bcrypt.compare(passwordid, userid.password)


                if (passwordmatch) {

                    if (userid.is_verified == 1) {
                        if (userid.is_blocked == 1) {
                            message = 'User is blocked'
                            res.redirect('/login')
                        }
                        else {
                            req.session.user_id = userid.id
                            console.log(req.session)

                            res.redirect('/')

                        }
                    }
                    else {
                        res.redirect('/login')
                        message = 'Please verify your mail'
                    }

                }
                else {

                    message = "password incorrect"
                    res.redirect('/login')

                }


            }
            else {
                message = "email incorrect"
                res.render('login', { message })



            }

        }


    }
    catch (err) {
        console.log(err)
    }
}


const homepage = async (req, res) => {
    try {
        const loginsession = req.session.user_id
        const products = await productschema.find({})

        const banner = await bannerschema.find({})

        res.render('home', { product: products, loginsession, banner, cartalert, mess })
        cartalert = null
    }
    catch (error) {
        console.log(error)
    }
}


const userlogout = async (req, res) => {
    try {
        req.session.user_id = null
        res.redirect('/')

    }
    catch (error) {
        console.log(error)
    }
}


const verifymail = async (req, res) => {
    try {

        const updateinfo = await userschema.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } })

        res.render('emailverified')

    }
    catch (error) {
        console.log(error)
    }
}



const productdetails = async (req, res,next) => {
    try {

        const id = req.query.id
        const loginsession = req.session.user_id
        const productdetails = await productschema.findOne({ _id: id })
        console.log(productdetails)
        const product = await productschema.find({})

        res.render('productdetails', { productdetails, product, loginsession })



    }
    catch (error) {
        console.log(error)

        next()
    }
}


const cartdetails = async (req, res) => {

    try {
        if (req.session.user_id) {
            const loginsession = req.session.user_id
            let incrementprice = await userschema.findOne({ _id: loginsession })
            const map = incrementprice.cart.map((value) => {

                return value.totalprice
            }).reduce((a, b) => {
                return a = a + b
            }, 0)

            incrementprice.cart.forEach(async (element) => {
                const updategrandtotal = await userschema.updateOne({ _id: loginsession, 'cart.product': element.product }, { $set: { 'cart.$.grandtotal': map } })

            });

            const cartdetails = await userschema.findOne({ _id: loginsession }).populate('cart.product')


            res.render('cart', { cartdetails, message, loginsession, mess })
            message = null
            mess = null

        }
        else {
            message = 'plese loging first'
            res.redirect('/login')

        }
    }
    catch (error) {
        console.log(error)
    }
}



const addtocart = async (req, res) => {
    try {
        const id = req.query.id
        const userid = req.session.user_id
        const productdetails = await productschema.findOne({ _id: id })


        if (userid) {
            const cartid = await userschema.findOne({ _id: userid, 'cart.product': id })

            if (cartid) {
                console.log('hai')

                const x = await userschema.updateOne({ _id: userid, 'cart.product': id }, { $inc: { 'cart.$.Quantity': 1 } })
                let incrementprice = await userschema.findOne({ _id: userid, 'cart.product': id })
                const productdata = incrementprice.cart.filter((value) => {
                    return value.product == id
                })
                const productprice = await productschema.findOne({ _id: id })
                const totalprice = await productdata[0].Quantity * productprice.price

                const y = await userschema.updateOne({ _id: userid, 'cart.product': id }, { $set: { 'cart.$.totalprice': totalprice } })
                incrementprice = await userschema.findOne({ _id: userid, 'cart.product': id })
                const map = incrementprice.cart.map((value) => {

                    return value.totalprice
                }).reduce((a, b) => {
                    return a = a + b
                }, 0)
                incrementprice.cart.forEach(async (element) => {
                    const updategrandtotal = await userschema.updateOne({ _id: userid, 'cart.product': element.product }, { $set: { 'cart.$.grandtotal': map } })

                });


                const responseData = {
                    success: true,
                    grandtotal: map,
                    message: 'item added to cart sucessfully'
                };
                res.json(responseData);
                return true

            }
            else {
                const x = await userschema.updateOne({ _id: userid }, {
                    $push: {
                        cart: {
                            product: productdetails._id,
                            Quantity: 1,
                            totalprice: productdetails.price,
                            grandtotal: productdetails.price,


                        }
                    }
                })


                const responseData = {
                    success: true,
                    message: 'Item  added to cart sucessfully'
                };
                res.json(responseData);
            }


        } else {

            message = 'please login and  continue'
            const responseData = {
                success: false
            };
            res.json(responseData);
        }
    }
    catch (error) {
        console.log(error)
    }
}



const getaddtocart = async (req, res) => {
    try {
        const id = req.query.id

        const userid = req.session.user_id
        const loginsession = req.session.user_id
        if (userid) {
            const productdetails = await productschema.findOne({ _id: id })
            const cartid = await userschema.findOne({ _id: userid, 'cart.product': id })

            if (cartid) {
                const x = await userschema.updateOne({ _id: userid, 'cart.product': id }, { $inc: { 'cart.$.Quantity': 1 } })
                let incrementprice = await userschema.findOne({ _id: userid, 'cart.product': id })
                const productdata = incrementprice.cart.filter((value) => {
                    return value.product == id
                })
                const productprice = await productschema.findOne({ _id: id })
                const totalprice = await productdata[0].Quantity * productprice.price

                const y = await userschema.updateOne({ _id: userid, 'cart.product': id }, { $set: { 'cart.$.totalprice': totalprice } })
                incrementprice = await userschema.findOne({ _id: userid, 'cart.product': id })
                const map = incrementprice.cart.map((value) => {

                    return value.totalprice
                }).reduce((a, b) => {
                    return a = a + b
                }, 0)
                incrementprice.cart.forEach(async (element) => {
                    const updategrandtotal = await userschema.updateOne({ _id: userid, 'cart.product': element.product }, { $set: { 'cart.$.grandtotal': map } })

                });



                res.redirect('/cart')
                return true
            } else {
                const x = await userschema.updateOne({ _id: userid }, {
                    $push: {
                        cart: {
                            product: productdetails._id,
                            Quantity: 1,
                            totalprice: productdetails.price,
                            grandtotal: productdetails.price,


                        }
                    }
                })


                const product = await productschema.find({})
                res.redirect('/cart')
            }
        } else {
            message = 'please login and  continue'
            res.redirect('/login')
        }
    }
    catch (error) {
        console.log(error)
    }
}




const increment = async (req, res) => {
    try {
        const id = req.body.id;
        const user_id = req.session.user_id;
        const productData = await productschema.findOne({ _id: id });

        const count = await userschema.updateOne(
            { _id: user_id, "cart.product": id },
            { $inc: { "cart.$.Quantity": 1 } }
        );


        const incrementOne = await userschema.findOne({
            _id: user_id,
            "cart.product": id,
        });
        let productDetails = incrementOne.cart.filter((value) => {
            return value.product == id;
        });

        const totalFind = productDetails[0].Quantity * productData.price;
        const total = await userschema.updateOne(
            { _id: user_id, "cart.product": id },
            { $set: { "cart.$.totalprice": totalFind } }
        );
        const itemData2 = await userschema.findOne({
            _id: user_id,
            "cart.product": id,
        });
        const grandTotal = itemData2.cart
            .map((k) => {
                return k.totalprice;
            })
            .reduce((a, b) => {
                return (a = a + b);
            });
        itemData2.cart.forEach(async (element) => {
            const updatedGrandTotal = await userschema.updateOne(
                { _id: user_id, "cart.product": element.product },
                { $set: { "cart.$.grandtotal": grandTotal } }
            );
        });


        const productData1 = await productschema.findOne({ _id: id })
        const cartData = await userschema.findOne({ _id: user_id, 'cart.product': id })
        const cartData2 = cartData.cart.filter((value) => {
            return value.product == id
        })
        const totalFind1 = cartData2[0].Quantity * productData1.price
        const total1 = await userschema.updateOne({ _id: user_id, 'cart.product': id }, { $set: { 'cart.$.totalprice': totalFind1 } })
        const setOne1 = await userschema.findOne({ _id: user_id, 'cart.product': id })
        const findTotal = setOne1.cart.map((value) => {
            return value.totalprice
        }).reduce((a, b) => {
            return a = a + b
        })
        const Quantity = setOne1.cart.filter((value) => {
            return value.product == id
        })
        const x = Quantity[0].Quantity
        res.json({ cartData2, totalFind, findTotal, id, x });
    } catch (error) {
        console.log(error);

    }
};


const decrement = async (req, res) => {
    try {
        const id = req.body.id;
        const user_id = req.session.user_id;
        const cart = await userschema.findOne({ _id: user_id })
        const quantity = cart.cart.filter((value) => {
            return value.product == id
        })
        console.log(quantity)
        if (quantity[0].Quantity > 1) {


            const count = await userschema.updateOne(
                { _id: user_id, "cart.product": id },
                { $inc: { "cart.$.Quantity": -1 } }
            );
            const productData = await productschema.findOne({ _id: id });
            const incrementOne = await userschema.findOne({
                _id: user_id,
                "cart.product": id,
            });
            let productDetails = incrementOne.cart.filter((value) => {
                return value.product == id;
            });
            const totalFind = productDetails[0].Quantity * productData.price;
            const total = await userschema.updateOne(
                { _id: user_id, "cart.product": id },
                { $set: { "cart.$.totalprice": totalFind } }
            );
            const itemData2 = await userschema.findOne({
                _id: user_id,
                "cart.product": id,
            });
            const grandtotal = itemData2.cart
                .map((k) => {
                    return k.totalprice;
                })
                .reduce((a, b) => {
                    return (a = a + b);
                });
            itemData2.cart.forEach(async (element) => {
                const updatedGrandTotal = await userschema.updateOne(
                    { _id: user_id, "cart.product": element.product },
                    { $set: { "cart.$.grandtotal": grandtotal } }
                );
            });


            const productData1 = await productschema.findOne({ _id: id })
            const cartData = await userschema.findOne({ _id: user_id, 'cart.product': id })
            const cartData2 = cartData.cart.filter((value) => {
                return value.product == id
            })
            const totalFind1 = cartData2[0].Quantity * productData1.price
            const total1 = await userschema.updateOne({ _id: user_id, 'cart.product': id }, { $set: { 'cart.$.totalprice': totalFind1 } })
            const setOne1 = await userschema.findOne({ _id: user_id, 'cart.product': id })
            const findTotal = setOne1.cart.map((value) => {
                return value.totalprice
            }).reduce((a, b) => {
                return a = a + b
            })
            const Quantity = setOne1.cart.filter((value) => {
                return value.product == id
            })
            const y = Quantity[0].Quantity
            res.json({ cartData2, totalFind, findTotal, id, y });
        } else {

        }
    } catch (error) {
        console.log(error);

    }
};





////////wishlist///////////////////


const wishlist = async (req, res) => {
    try {

        const loginsession = req.session.user_id
        if (loginsession) {
            const wishlistdetails = await userschema.findOne({ _id: loginsession }).populate('wishlist.product')

            res.render('wishlist', { mess, wishlistdetails, loginsession, message })
            message = null
            mess = null
        }
        else {
            res.redirect('/login')
        }
    }
    catch (error) {
        console.log(error)
    }
}


const addtowishlist = async (req, res) => {
    try {
        const id = req.query.id
        const userid = req.session.user_id
        const loginsession = req.session.user_id
        if (userid) {
            const productdetails = await productschema.findOne({ _id: id })
            const wishlistid = await userschema.findOne({ _id: userid, 'wishlist.product': id })
            if (wishlistid) {
                const responseData = {
                    success: true,
                    message: 'Item already Exist'
                };
                res.json(responseData);
            } else {
                await userschema.updateOne({ _id: userid }, {
                    $push: {
                        wishlist: {
                            product: productdetails._id,

                        }
                    }
                })

                const responseData = {
                    success: true,
                    message: 'Item added to Wishlist successfully'
                };
                res.json(responseData);
            }
        } else {
            message = 'please login and  continue'
            const responseData = {
                success: false
            };
            res.json(responseData);
        }
    }
    catch (error) {
        console.log(error)
    }


}



//////////////////////// shop ///////////////////////


const shop = async (req, res) => {
    try {

        const loginsession = req.session.user_id

        const productdetails = await productschema.find({ is_deleted: 0 })

        const category = await categoryschema.find({})


        res.render('shop', { loginsession, message, productdetails, category })
        message = null
    }
    catch (error) {
        console.log(error)
    }
}





////////////////////////// category filter ///////////////////////////////

const categoryfilter = async (req, res) => {
    try {
        // const id = req.query.id
        const { id, search } = req.query
        const loginsession = req.session.user_id
        const category = await categoryschema.find({})
        let productdetails
        if (search !== 'undefined') {
            console.log(1);
            if (id != 'undefined') {
                console.log(id);
                productdetails = await productschema.find({
                    category: id, $or: [
                        { product_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                    ]
                })
            } else {
                console.log(3);
                productdetails = await productschema.find({
                    $or: [
                        { product_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
                    ]
                })
            }
        } else if (id) {
            console.log(12);
            console.log(id);
            productdetails = await productschema.find({ category: id })
            console.log(productdetails);
        }


        res.send({ success: true, products: productdetails })
        // res.render('shop',{productdetails,loginsession,category})
    }
    catch (error) {

    }
}



//////////////////////// delete wishlist/////////////////////////////


const deletewishlist = async (req, res) => {
    try {
        const id = req.query.id
        const userid = req.session.user_id
        if (userid) {
            const wishlist = await userschema.findByIdAndUpdate({ _id: userid }, { $pull: { wishlist: { product: id } } })

            const responseData = {
                success: true,
                qua: wishlist.wishlist.length,
                message: 'removed sucssesfully'
            };
            res.json(responseData);

        }
        else {
            message = 'please login for continue'
            res.redirect('/login')
        }

    }
    catch (error) {
        console.log(error)
    }
}



////////////////////////////deletecart////////////////////////////


const deletecart = async (req, res) => {
    try {

        const id = req.query.id
        const userid = req.session.user_id
        if (userid) {
            const cartData = await userschema.findOne({ _id: userid })
            const productdetails = cartData.cart.filter((value) => {
                return value.product == id
            })
            console.log(productdetails)
            const grandTot = productdetails[0].grandtotal - productdetails[0].totalprice

            const cart = await userschema.findByIdAndUpdate({ _id: userid }, { $pull: { cart: { product: id } } })
            cart.cart.forEach(async (value) => {
                await userschema.updateOne({ _id: userid, "cart.product": value.product }, { $set: { 'cart.$.grandtotal': grandTot } })

            })




            const responseData = {
                success: true,
                grandtotal: grandTot,
                qua: cart.cart.length,
                message: 'removed sucssesfully'
            };
            res.json(responseData);

        }
        else {
            message = 'please login for continue'
            res.redirect('/login')
        }

    }
    catch (error) {
        console.log(error)
    }
}


/////////////////////// checkout ////////////////////////


const checkout = async (req, res) => {
    try {

        const id = req.query.id
        const loginsession = req.session.user_id
        const order = req.session.order
        const cartdetails = await userschema.findOne({ _id: loginsession }).populate('cart.product')
        const coupons = await couponschema.find({})
        if (cartdetails.cart[0] !== undefined) {

            const userdetails = await userschema.findOne({ _id: loginsession })

            const address = userdetails.address.filter((value) => {

                return value._id == id
            })

            res.render('checkout', { loginsession, message, cartdetails, userdetails, address, order, mess, messa, coupons })
            req.session.order = null
            message = null
            mess = null
            messa = null
        } else {
            res.redirect('/')
        }

    }

    catch (error) {
        console.log(error.message)
    }
}

///////////////////////////////// profile//////////////////////


const profile = async (req, res) => {
    try {

        const loginsession = req.session.user_id
        console.log(loginsession)


        if (loginsession) {
            const userdetails = await userschema.findOne({ _id: loginsession })
            res.render('profile', { loginsession, userdetails, message, mess })
            mess = null
            message = null
        } else {
            res.redirect('/login')
        }

    }
    catch (error) {
        console.log(error)
    }
}



////////////////////edit profile ///////////////




const editprofile = async (req, res) => {
    try {

        const loginsession = req.session.user_id
        if (loginsession) {
            const userdetails = await userschema.findOne({ _id: loginsession })
            res.render('editprofile', { loginsession, userdetails, message, mess })
            message = null
            mess = null
        } else {
            res.redirect('/login')
        }

    }
    catch (error) {
        console.log(error)
    }
}



////////////////////////update profile //////////////

const updateprofile = async (req, res) => {
    try {

        const loginsession = req.session.user_id
        const { name, email, mobile } = req.body
        if (loginsession) {
            const profile = await userschema.findOneAndUpdate({ _id: loginsession }, {
                $set: {
                    name: name,
                    mobileNo: mobile,
                    email: email
                }
            })
            mess = 'Profile updated sucessfully'
            res.redirect('/profile')
        }

        else {
            message = 'Profile  not updated'
            res.redirect("/profile")
        }
    }
    catch (error) {
        console.log(error)
    }
}



////////////////////////////address //////////////////////////////////////



const address = async (req, res) => {
    try {
        const loginsession = req.session.user_id
        const userdetails = await userschema.findOne({ _id: loginsession })
        res.render('address', { loginsession, userdetails, mess, message })
        mess = null
        message = null
    }
    catch (error) {
        console.log(error)
    }

}


/////////////////////add address /////////////////////////

const addaddress = async (req, res) => {
    try {
        const loginsession = req.session.user_id
        const userdetails = await userschema.findOne({ _id: loginsession })
        res.render('addaddress', { loginsession, userdetails })
    }
    catch (error) {
        console.log(error)
    }
}

///////////////////////////// insert address////////////////////

const insertaddress = async (req, res) => {
    try {
        const loginsession = req.session.user_id

        const userdetails = await userschema.findOne({ _id: loginsession })
        const { name, house, towncity, district, state, pincode, mobile, email } = req.body
        if (loginsession) {
            const address = await userschema.updateOne({ _id: loginsession }, {
                $push: {
                    address: {

                        name: name,
                        houseName: house,
                        townCity: towncity,
                        district: district,
                        state: state,
                        pincode: pincode,
                        mobileNo: mobile,
                        email: email
                    }
                }
            })
            mess = 'Address added successfully'
            res.redirect('/address')
        }

        else {
            message = 'Address not added'
            res.redirect("/address")
        }
    }
    catch (error) {
        console.log(error)
    }
}



/////////////////////////////// deleteaddress /////////////////////////


const deleteaddress = async (req, res) => {
    try {
        const id = req.query.id
        const userid = req.session.user_id
        if (userid) {
            await userschema.updateOne({ _id: userid }, { $pull: { address: { _id: id } } })
            mess = 'Address removed from list'
            res.redirect('/address')
        }
        else {
            message = 'please login for continue'
            res.redirect('/login')
        }

    }
    catch (error) {
        console.log(error)
    }
}

////////////////////// edit address /////////////////////////

const editaddress = async (req, res) => {
    try {
        const id = req.query.id
        const loginsession = req.session.user_id
        const index = req.query.index
        const userdetails = await userschema.findOne({ _id: loginsession, 'address._id': id })
        const editaddress = userdetails.address[index]

        res.render('editaddress', { editaddress, mess, message, loginsession })
        mess = null
        message = null
    }
    catch (error) {
        console.log(error)
    }
}

///////////////////////////////////////////// update edit address//////////////////


const updateaddress = async (req, res) => {
    try {
        const id = req.query.id
        const loginsession = req.session.user_id
        const { name, house, towncity, district, state, pincode, mobile, email } = req.body
        if (loginsession) {
            const address = await userschema.findOneAndUpdate({ _id: loginsession, 'address._id': id }, {
                $set: {
                    'address.$': {
                        name: name,
                        houseName: house,
                        townCity: towncity,
                        district: district,
                        state: state,
                        pincode: pincode,
                        mobileNo: mobile,
                        email: email
                    }
                }
            })
            mess = 'Address updated successfully'
            res.redirect('/address')
        }

        else {
            message = 'Address not updated'
            res.redirect("/address")
        }
    }
    catch (error) {
        console.log(error)
    }
}

///////////////////// placeorder ///////////////////////////////////////////
const Razorpay = require("razorpay");

const instance = new Razorpay({
    key_id: "rzp_test_13fjlwwvmTKtGb",
    key_secret: "V6sys5SdZold2oNLYR9rVdU6",
});

const placeorder = async (req, res) => {

    try {


        const orderId = uuidv4();
        const userid = req.session.user_id
        const userSchema = await userschema.findOne({ _id: userid })
        const orderdate = new Date()
        const orderarravingdate = new Date()
        orderarravingdate.setDate(orderdate.getDate() + 7)
        const orderreturndate = new Date()
        orderreturndate.setTime(orderarravingdate.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        const payment = req.body

        const paymentmethod = req.body.payment
        let total = userSchema.discountedTotal
        const grand = req.query.grand
        if (total == null || total == 0) {
            total = grand
        }

        userSchema.discountedTotal = 0
        await userSchema.save()


        const { name, house, phone, email, country, district, state, pincode } = req.body
        if (payment.payment == 'cod') {
            const cartdata = await userschema.findOne({ _id: userid }).populate('cart.product')
            console.log(orderreturndate,'klknlnlnlnln');
            const orderitem = cartdata.cart.map((value) => {
                return { product: value.product._id, price: value.product.price, quantity: value.Quantity, total: value.totalprice, date: orderdate, paymentmethod: req.body.payment, deliveredDate: orderarravingdate,returndate:orderreturndate }
            })
            console.log(orderitem)
           
            const grandtotal = cartdata.cart.map((value) => {
                return value.totalprice
            }).reduce((a, b) => {
                return a = a + b
            })

            const order = await orderschema({
                orderid: orderId,
                user: userid,
                order: orderitem,
                grandtotal: total,
                subtotal: grand,
                address: [{
                    name: name,
                    house: house,
                    mobileNo: phone,
                    email: email,
                    townCity: country,
                    district: district,
                    state: state,
                    pincode: pincode
                }],
                paymentmethod: paymentmethod

            })
            const saveorder = await order.save()
            const orderdata = await orderschema.findOne({ _id: saveorder._id }).populate('order.product')
            cartdata.cart = []
            const ucart = await cartdata.save()

            // res.render("ordersucess",{orderdata,loginsession:userid})

            orderitem.forEach(async (element) => {
                const product = await productschema.findByIdAndUpdate({ _id: element.product })
                const inventoryUpdate = await productschema.updateOne({ _id: element.product }, { $inc: { quantity_adding: -element.quantity } })
            });
            res.redirect(`/orderSucess?id=${orderdata._id}`)

        } else if (payment.payment == 'razorpay') {
            const cartData = await userschema.findOne({ _id: userid }).populate('cart.product')
            const orderItem = cartData.cart.map((value) => {
                return {
                    product: value.product._id,
                    price: value.product.price,
                    quantity: value.Quantity,
                    total: value.totalprice,
                    date: orderdate,
                    paymentmethod: 'razorpay',
                    deliveredDate: orderarravingdate,
                    returndate:orderreturndate
                }
            })

            const grandTot = cartData.cart.map((value) => {
                return value.totalprice
            }).reduce((a, b) => {
                return a = a + b
            })

            // create a Razorpay order
            const options = {

                amount: total * 100, // amount in paisa (multiply by 100)
                currency: "INR", // currency code
                receipt: "order_" + orderdate.getTime(), // unique order ID
            }

            const order = await instance.orders.create(options)
            req.session.order = order
            req.session.orderDatas = {
                amount: total * 100,
                currency: "INR",
                orderId: order.id,
                address: {
                    name: name,
                    house: house,
                    mobileNo: phone,
                    email: email,
                    townCity: country,
                    district: district,
                    state: state,
                    pincode: pincode
                },
                order: orderItem,
                grandtotal: total,
                subtotal: grandTot

            };

            res.redirect("/checkout?orderId=" + order.id)


        } else if (payment.payment == 'wallet') {
            const cartdata = await userschema.findOne({ _id: userid }).populate('cart.product')
            const orderitem = cartdata.cart.map((value) => {
                return { product: value.product._id, price: value.product.price, quantity: value.Quantity, total: value.totalprice, date: orderdate, paymentmethod: req.body.payment, deliveredDate: orderarravingdate,returndate:orderreturndate }
            })
            const grandtotal = cartdata.cart.map((value) => {
                return value.totalprice
            }).reduce((a, b) => {
                return a = a + b
            })

            const order = await orderschema({
                orderid: orderId,
                user: userid,
                order: orderitem,
                grandtotal: total,
                subtotal: grand,
                address: [{
                    name: name,
                    house: house,
                    mobileNo: phone,
                    email: email,
                    townCity: country,
                    district: district,
                    state: state,
                    pincode: pincode
                }],
                paymentmethod: paymentmethod

            })
            const saveorder = await order.save()
            const orderdata = await orderschema.findOne({ _id: saveorder._id }).populate('order.product')
            cartdata.cart = []
            const ucart = await cartdata.save()

            // res.render("ordersucess",{orderdata,loginsession:userid})

            orderitem.forEach(async (element) => {
                const product = await productschema.findByIdAndUpdate({ _id: element.product })
                const inventoryUpdate = await productschema.updateOne({ _id: element.product }, { $inc: { quantity_adding: -element.quantity } })
            });
            const walletamount = await userschema.updateOne({ _id: userid }, { $set: { wallet: cartdata.wallet - orderdata.grandtotal } })
            res.redirect(`/orderSucess?id=${orderdata._id}`)

        }


        else {
            res.redirect("/checkout")
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}

const razorpay = async (req, res) => {

    const orderDatas = req.session.orderDatas
    console.log(orderDatas)
    const userId = req.session.user_id
    const order = new orderschema({
        user: userId,
        order: orderDatas.order,
        paymentId: orderDatas.orderId,
        grandtotal: orderDatas.grandtotal,
        subtotal: orderDatas.subtotal,
        address: [orderDatas.address],
        paymentmethod: orderDatas.paymentmethod,


    });
    console.log(orderDatas.paymentmethod)
    const save = await order.save();
    const orderData = await orderschema.findOne({ _id: save._id }).populate('order.product')
    const cartData = await userschema.findOne({ _id: userId }).populate('cart.product')
    cartData.cart = [];


    //   cartData.cart.forEach(async(value)=>{
    //    const x= await userschema.updateOne({_id:userId,'cart._id':value._id},{$pull:{cart:{_id:value._id}}})
    //    console.log(x);
    //   })
    const Ucart = await cartData.save()
    orderDatas.order.forEach(async (element) => {
        const product = await productschema.findByIdAndUpdate({ _id: element.product })
        const inventoryUpdate = await productschema.updateOne({ _id: element.product }, { $inc: { quantity_adding: -element.quantity } })

    })



    res.json({ orderData })


}

const ordersuccess = async (req, res) => {

    try {
        req.session.order = null
        const orderId = req.query.id
        console.log(orderId)
        const orderdata = await orderschema.findOne({ _id: orderId }).populate("order.product")
        res.render("ordersucess", { orderdata, loginsession: req.session.user_Id, })


    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}





////////////////////////////// order list ////////////////////////////////////



const orderlist = async (req, res) => {
    try {
        let currentPage = 1
        if (req.query.currentpage) {
            currentPage = req.query.currentpage
        }
        const limit = 10
        offset = (currentPage - 1) * limit
        const userid = req.session.user_id
        const user = await userschema.findById({ _id: userid })
        const userdata = await orderschema.find({})
        const orderData = await orderschema.find({ user: user._id }).skip(offset).limit(limit)
        const totalOrders = userdata.length
        console.log(totalOrders)
        const totalPage = Math.ceil(totalOrders / limit)

        res.render('orderlist', { loginsession: userid, orderData, currentPage, totalPage })


    }
    catch (error) {
        console.log(error)
    }
}



//////////////////////////order details ////////////////////////////////////



const orderdetails = async (req, res) => {
    try {
        const orderid = req.query.id
        const orderdata = await orderschema.findById({ _id: orderid }).populate('order.product')
        res.render('orderdetails', { loginsession: req.session.user_id, orderdata })

    }
    catch (error) {
        console.log(error)
    }
}



/////////////////////////// cancel order ////////////////////////


const cancelorder = async (req, res) => {
    try {

        const id = req.query.id
        const Data = await orderschema.findOne({ _id: id })
        const ids = Data.order.map((value) => {
            return value._id
        })

        ids.forEach(async (element) => {
            await orderschema.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'OrderCancelled' } })
        })

        Data.order.forEach(async (element) => {
            const product = await productschema.findByIdAndUpdate({ _id: element.product })
            const inventoryUpdate = await productschema.updateOne({ _id: element.product }, { $inc: { quantity_adding: element.quantity } })
        });
        const responseData = {
            success: true,
            status: 'OrderCancelled'
        };
        res.json(responseData);






    }

    catch (error) {
        console.log(error)

    }
}


///////////////////////// return order ////////////////////////



const returnorder = async (req, res) => {
    try {

        const id = req.query.id
        const Data = await orderschema.findOne({ _id: id })
        const ids = Data.order.map((value) => {
            return value._id
        })

        ids.forEach(async (element) => {
            await orderschema.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'ReturnPending' } })
        })
        const responseData = {
            success: true,
            status: 'ReturnPending'
        };
        res.json(responseData);
       

    }

    catch (error) {
        console.log(error)

    }
}






module.exports = {
    loadRegister,
    insertuser, login, verifylogin, homepage, userlogout, verifymail, otplogin, enterotp, verifyotpMail,
    otpVerify,
    productdetails,
    cartdetails,
    addtocart,
    increment,
    decrement,
    wishlist,
    addtowishlist,
    shop,
    deletewishlist,
    deletecart,
    resendotpMail,
    checkout,
    profile,
    address,
    addaddress,
    insertaddress,
    deleteaddress,
    editaddress,
    updateaddress,
    placeorder,
    orderlist,
    orderdetails,
    getaddtocart,
    editprofile,
    updateprofile,
    cancelorder,
    returnorder,
    razorpay,
    ordersuccess,
    categoryfilter

}