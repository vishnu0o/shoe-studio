const userschema = require('../model/userModel')
const adminschema = require('../model/adminmodel')
const productschema = require('../model/productmodel')
const categoryschema = require('../model/categorymodel')
const bannerschema = require('../model/bannermodel')
const orderschema = require('../model/ordermodel')
const sharp = require('sharp')
const fs = require('fs')

let arrimage = []

const bcrypt = require('bcrypt')

let mess
let message
const securepassword = async (password) => {

    try {
        const passwordhash1 = await bcrypt.hash(password, 10)

        return passwordhash1
    }
    catch (error) {

        console.log(error.message)

    }
}

const adminlogin = async (req, res) => {
    try {
        console.log(req.session);
        res.render('adminlogin', { message })
        message = null
    }

    catch (error) {
        console.log(error)
    }
}

const userdetails = async (req, res) => {
    try {
        const details = await userschema.find({})
        res.render('dashboard', { details, mess, message })

    }
    catch (error) {
        console.log(error)
    }
}

const adminverify = async (req, res) => {
    try {
        const adminemail = req.body.email
        const adminpassword = req.body.password

        const admin = await adminschema.findOne({ email: adminemail })
        if (admin) {
            const adminpasswd = await bcrypt.compare(adminpassword, admin.password)


            if (adminpasswd) {

                req.session.admin_id = admin._id
                res.redirect('/admin/home')


            }
            else {
                message = 'Password is incorrect'
                res.redirect('/admin')
            }
        }
        else {
            message = 'Email is incorrect'
            res.redirect('/admin')
        }

    }




    catch (error) {
        console.log(error)
    }
}







const adminlogout = async (req, res) => {
    try {
        req.session.admin_id = null;
        res.redirect('/admin')
    }
    catch (error) {

        console.log(error)

    }
}






const updateproduct = async (req, res) => {
    try {

        const productId = req.query.id;
        const { name, brand, description, category, price, quantity, color, style, size } = req.body
        const categoryRef = await categoryschema.findOne({ categoryname: category })
        const productImg = await productschema.findOne({ _id: productId })
        let images = []
        if (req.files.length != 0) {
            for (let i = 0; i < 5 - productImg.images.length; i++) {
                if (req.files.length == i) break;
                images[i] = req.files[i].filename;
            }
        } if (images.length == 0 && productImg.images.length == 0) {
            message = 'Image field required'
            res.redirect('/admin/editproducts?id=' + productImg.id)
        }

        productImg.product_name = name;
        productImg.brand = brand;
        productImg.product_description = description;
        productImg.category = categoryRef._id;
        productImg.price = price;
        productImg.quantity_adding = quantity;
        productImg.size = size;
        productImg.color = color;
        productImg.style = style;
        productImg.images = productImg.images.concat(images);
        const editProductData = await productImg.save()
        if (editProductData) {
            mess = 'Edited successfuly'
            res.redirect('/admin/productlist')
        } else {
            message = "did'nt add any image"
            res.redirect(`/admin/editproducts?id=${productId}`)
        }

    } catch (error) {
        console.log(error.message);
    }
}


const adminproductlist = async (req, res) => {
    try {
        const productlist = await productschema.find({}).populate('category')
        res.render('productlist', { product: productlist, message })
        message = null

    }
    catch (error) {
        console.log(error)
    }
}
const adminaddproducts = async (req, res) => {
    try {
        const category = await categoryschema.find({})
        res.render('addproduct', { message, category, mess })
        message = null
        mess = null


    }
    catch (error) {
        console.log(error)
    }
}

const admineditproducts = async (req, res) => {
    try {

        const editproduct = req.query.id
        const findeditproduct = await productschema.findOne({ _id: editproduct }).populate('category')

        const category = await categoryschema.find({})
        res.render('editproducts', { list: findeditproduct, category, mess, message })
        message = null
        mess = null



    }
    catch (error) {
        console.log(error)
    }
}




const productsimagremove = async (req, res) => {
    try {
        const file = req.query.file

        const productId = req.query.productId
        console.log(file, productId, 'dfhhdgfh');
        await productschema.updateOne({ _id: productId }, { $pull: { images: file } })
        res.send({ success: true, janu: 'dddd' })

    } catch (error) {
        console.log(error.message);
    }
}

const add_product = async (req, res) => {

    try {
        const productdata = await productschema.findOne({ product_name: req.body.name });
        if (productdata) {
            message = 'Product already exists';
            return res.redirect('/admin/addproducts');
        }

        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']; // valid image extensions
        const images = [];

        for (let i = 0; i < req.files.length; i++) {
            const extension = req.files[i].filename.split('.').pop().toLowerCase(); // get the file extension
            if (validExtensions.includes(extension)) { // check if the file extension is valid
                if(req.files.length == i ) break;
                images[i] = req.files[i].filename;      

            } else {
                message = 'Invalid Format';
                return res.redirect('/admin/addproducts');
            }
        }

        const categoryreference = await categoryschema.findOne({ categoryname: req.body.category });

        const product = new productschema({
            product_name: req.body.name,
            brand: req.body.brand,
            product_description: req.body.description,
            category: categoryreference._id,
            price: req.body.price,
            quantity_adding: req.body.quantity,
            color: req.body.color,
            style: req.body.style,
            size: req.body.size,
            images:req.files.map((file) => file.filename),
            is_deleted: 0,
        });


        const product_data = await product.save();
        if (product_data) {
            mess = 'Product added successfully';
            return res.redirect('/admin/addproducts');
        } else {
            message = 'Product is not added';
            return res.redirect('/admin/addproducts');
        }


    }
    catch (error) {
        console.log(error);
    }
}





const deleteproducts = async (req, res) => {
    try {

        const id = req.query.id
        const product = await productschema.findOne({ _id: id })

        if (product.is_deleted == 0) {

            const deleteproduct = await productschema.findByIdAndUpdate({ _id: id }, { $set: { is_deleted: 1 } })
            res.redirect('/admin/productlist')
        } else {

            const deleteproduct = await productschema.findByIdAndUpdate({ _id: id }, { $set: { is_deleted: 0 } })
            res.redirect('/admin/productlist')
        }



    }
    catch (error) {
        console.log(error)
    }
}




///////////////////// delete images /////////////////////////

const deleteImage = async (req, res) => {
    try {

        const imageName = req.query.file
        const productId = req.query.id

        const imageUrl = imageName.url

        const product = await productschema.findById(productId)

        const imageIndex = product.images.findIndex(img => img.url === imageUrl)
        if (imageIndex === -1) {
            // handle image not found error
        }

        product.images.splice(imageIndex, 1)

        await product.save()

        res.redirect('/admin/productlist')


    } catch (error) {
        console.log(error);
    }
}




//////////////////////block user//////////////


const blockuser = async (req, res) => {
    try {
        const id = req.query.id
        const userdata = await userschema.findById({ _id: id })
        const userblockeddata = await userschema.updateOne({ _id: id }, { $set: { is_blocked: 1 } })
        res.redirect('/admin/dashboard')


    }
    catch (error) {
        console.log(error)
    }
}

const unblockuser = async (req, res) => {
    try {
        const id = req.query.id
        const userdata = await userschema.findById({ _id: id })
        const userblockeddata = await userschema.updateOne({ _id: id }, { $set: { is_blocked: 0 } })
        res.redirect('/admin/dashboard')


    }
    catch (error) {
        console.log(error)
    }
}


const category = async (req, res) => {
    try {



        const categorydetails = await categoryschema.find({})
        res.render('category', { categorydetails, message, mess })
        message = null
        mess = null


    }
    catch (error) {
        console.log(error)
    }
}


const addnewcategory = async (req, res) => {
    try {
        const { category } = req.body;
        const categoryname = category.toLowerCase()
        const existingCategory = await categoryschema.findOne({ categoryname: categoryname });
        if (existingCategory) {
            return res.json({ success: false, message: "Category already exists." });
        }
        const newCategory = new categoryschema({ categoryname: categoryname });
        await newCategory.save();

        return res.json({
            success: true,
            category: newCategory,
            message: 'Category Added successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Server error");
    }
}

const editcategory = async (req, res) => {
    const id = req.query.id
    const category = await categoryschema.findOne({ _id: id })
    res.render('editcategory', { category })
}

const categoryedit = async (req, res) => {
    try {
        const categoryid = req.query.id
        const updatecategory = await categoryschema.updateOne({ _id: categoryid }, { $set: { categoryname: req.body.category } })
        mess = 'Category edited successfully'
        res.redirect('/admin/category')
    }
    catch (error) {

    }
}

const deletecategory = async (req, res) => {
    try {

        const id = req.query.id
        const productdata = await productschema.findOne({ category: id })
        if (productdata) {
            const responseData = {
                success: true,
                message: 'Category already in use'
            };
            res.json(responseData);

        }

        else {
            await categoryschema.deleteOne({ _id: id })

            const responseData = {
                success: false,
                message: 'Successfully deleted'
            };
            res.json(responseData);

        }
    }
    catch (error) {
        console.log(error)
    }
}


///////////////////banner///////////////////


const banner = async (req, res) => {
    try {

        res.render('banner', { message, mess })
        message = null
        mess = null
    }
    catch (error) {
        console.log(error)
    }
}


const addbanner = async (req, res) => {
    try {

        let arrimage = []
        for (let i = 0; i < req.files.length; i++) {
            arrimage[i] = req.files[i].filename
        }
        const categoryreference = await categoryschema.findOne({ categoryname: req.body.category })

        var banner = new bannerschema({
            header: req.body.name,
            banner_text_upper: req.body.textupper,
            banner_description: req.body.description,
            banner_text_down: req.body.textdown,
            images: arrimage,

        })

        const banner_data = await banner.save()
        if (banner_data) {

            mess = 'Banner Added successfully'
            res.redirect('/admin/banner')
        }
        else {
            message = 'Banner is not added'
            res.redirect('/admin/banner')
        }


    }
    catch (error) {
        console.log(error)
    }
}

///////////////////// list banner /////////////////////////


const listbanner = async (req, res) => {
    try {

        const bannerdetails = await bannerschema.find({})
        res.render('bannerlist', { bannerdetails, message })
        message = null
    }
    catch (error) {
        console.log(error)
    }
}




////////////////////// edit banner //////////////////////


const editbanner = async (req, res) => {
    try {
        const id = req.query.id
        const banner = await bannerschema.findOne({ _id: id })
        res.render('editbanner', { banner, message, mess })
        mess = null
        message = null
    }
    catch (error) {
        console.log(error)
    }
}

const updatebanner = async (req, res) => {
    try {
        const id = req.query.id

        let arrimage = []
        for (let i = 0; i < req.files.length; i++) {
            arrimage[i] = req.files[i].filename
        }
        const banner = await bannerschema.findByIdAndUpdate({ _id: id }, {
            $set: {
                header: req.body.name,
                banner_text_upper: req.body.textupper,
                banner_description: req.body.description,
                banner_text_down: req.body.textdown,
                images: arrimage,
            }
        })

        mess = 'Banner update successfully'
        res.redirect('/admin/listbanner')

    }
    catch (error) {
        console.log(error)
    }
}

////////////////////// delete banner /////////

const deletebanner = async (req, res) => {
    try {
        const id = req.query.id
        const banner = await bannerschema.deleteOne({ _id: id })
        const response = {
            success: true,
            message: "Banner successfully deleted"

        }
        res.json(response)
    }
    catch (error) {
        console.log(error)
    }
}




//////////////orderdetails //////////////////




const orderdetails = async (req, res) => {
    try {

        const orderid = req.query.id
        const orderdata = await orderschema.findById({ _id: orderid }).populate('order.product')
        res.render('orderdata', { orderdata })

    }
    catch (error) {
        console.log(error)
    }
}



/////////////////////////////orderdelivered/////////////////////////



const orderdelivered = async (req, res) => {
    try {

        const id = req.query.id
        const Data = await orderschema.findOne({ _id: id })
        const ids = Data.order.map((value) => {
            return value._id
        })
        const deliveredDate = new Date()
        ids.forEach(async (element) => {
            await orderschema.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'OrderDelivered', 'order.$.deliveredDate': deliveredDate } })
        })
        const data = Data.order.map((value) => {
            return value.status

        })
        const responseData = {
            success: true,
            status: "OrderDelivered"
        };
        res.json(responseData);

    }

    catch (error) {
        console.log(error)

    }
}



/////////////////////// shipping order ////////////////////


const ordershipped = async (req, res) => {
    try {

        const id = req.query.id
        const Data = await orderschema.findOne({ _id: id })
        const ids = Data.order.map((value) => {
            return value._id
        })

        ids.forEach(async (element) => {
            await orderschema.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'OrderShipped' } })
        })
        const data = Data.order.map((value) => {
            return value.status

        })

        const responseData = {
            success: true,
            status: "OrderShipped"
        };
        res.json(responseData);

    }

    catch (error) {
        console.log(error)

    }
}





////////////////////////// return accept ///////////////////////////




const adminorderreturn = async (req, res) => {
    try {

        const id = req.query.id
        const Data = await orderschema.findOne({ _id: id })
        console.log(Data.user)
        const userdata = await userschema.find({_id:Data.use})
        const ids = Data.order.map((value) => {
            return value._id
        })

        ids.forEach(async (element) => {
            await orderschema.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'Returned' } })
        })
        const responseData = {
            success: true,
            status: 'Returned'
        };
        res.json(responseData);
       
       
        const wallet = await userschema.updateOne({ _id: Data.user }, { $inc: { wallet: Data.grandtotal } })

        

        Data.order.forEach(async (element) => {
            const product = await productschema.findByIdAndUpdate({ _id: element.product })
            const inventoryUpdate = await productschema.updateOne({ _id: element.product }, { $inc: { quantity_adding: element.quantity } })
        });


    }

    catch (error) {
        console.log(error)

    }
}


const loadSales = async (req, res) => {
    try {

        const filterData = await orderschema.find({ order: { $elemMatch: { status: "OrderDelivered" } } }).populate('order.product')
        res.render("salesreport", { filterData })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}


const sales = async (req, res) => {
    try {
        const { first, last } = req.body;
        const filterData = await orderschema.find({
            'order.status': "OrderDelivered",
            'order.date': { $gte: first, $lte: last }
        }).populate('order.product')
        res.render('salesreport', { filterData });

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}





////////////////////////////// dashboard ///////////////////////////


const loadDashbord = async (req, res) => {
    try {
        const orderdata = await orderschema.find({}).populate('order.product')
        let orderreturned
        orderdata.forEach(element => {

            orderreturned = element.order.filter((value) => {
                console.log(value);
                return value.status == "ReturnPending"
            }).length

        });
        console.log(orderreturned)
        let currentPage = 1
        if (req.query.currentpage) {
            currentPage = req.query.currentpage
        }
        const limit = 10
        offset = (currentPage - 1) * limit
        const orderdetails = await orderschema.find({})
        const orderData = await orderschema.find({}).skip(offset).limit(limit)
        const totalOrders = orderdetails.length
        const totalPage = Math.ceil(totalOrders / limit)
        const userData = await userschema.find()
        const usersLength = userData.length
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);

        const dailySalesReport = await orderschema.aggregate([
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
                    totalSales: { $sum: "$grandtotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);



        const weeklySalesReport = await orderschema.aggregate([
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: weekAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: weekAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
                    totalSales: { $sum: "$grandtotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);


        const yearlySalesReport = await orderschema.aggregate([
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: yearAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: yearAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
                    totalSales: { $sum: "$grandtotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        ////////////////////////////////// linechart//////////////////////////////////////////////////////

        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

        const monthlyStart = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const monthlyEnd = new Date(currentYear, currentMonth, daysInMonth);

        const monthlySalesData = await orderschema.find({
            'order.deliveredDate': {
                $gte: monthlyStart,
                $lte: monthlyEnd,
            },
        });

        const dailySalesDetails = []
        for (let i = 2; i <= daysInMonth + 1; i++) {
            const date = new Date(currentYear, currentMonth, i)
            const salesOfDay = monthlySalesData.filter((order) => {
                return new Date(order.order[0].deliveredDate).toDateString() === date.toDateString()
            })
            const totalSalesOfDay = salesOfDay.reduce((total, order) => {
                return total + order.grandtotal;
            }, 0);
            let productCountOfDay = 0;
            salesOfDay.forEach((order) => {
                productCountOfDay += order.order[0].quantity;
            });

            dailySalesDetails.push({ date: date, totalSales: totalSalesOfDay, totalItemsSold: productCountOfDay });
        }

        const order = await orderschema.aggregate([
            { $unwind: "$order" },  // deconstruct the "order" array
            {
                $group: {
                    _id: "$order.paymentmethod",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    codCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "cod"] }, then: "$count", else: 0 }
                        }
                    },
                    razorpayCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "razorpay"] }, then: "$count", else: 0 }
                        }
                    },
                    walletCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "wallet"] }, then: "$count", else: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    codCount: 1,
                    razorpayCount: 1,
                    walletCount: 1
                }
            }
        ]);


        res.render("adminhome", {
            dailySalesReport,
            weeklySalesReport,
            yearlySalesReport,
            message,
            usersLength,
            dailySalesDetails,
            order,
            admin: userdetails,
            orderData,
            currentPage,
            totalPage,
            orderreturned

        }),
            (message = null);






    } catch (error) {
        console.log(error.message);
    }
}












module.exports = {
    adminlogin,
    adminverify,
    adminlogout,
    userdetails,
    adminproductlist,
    adminaddproducts,
    admineditproducts,
    add_product,
    deleteproducts,
    blockuser,
    unblockuser,
    updateproduct,
    category,
    addnewcategory,
    editcategory,
    categoryedit,
    deletecategory,
    banner,
    addbanner,
    updatebanner,
    orderdetails,
    orderdelivered,
    ordershipped,
    deletebanner,
    editbanner,
    listbanner,
    loadSales,
    sales,
    loadDashbord,
    deleteImage,
    productsimagremove,
    adminorderreturn

}