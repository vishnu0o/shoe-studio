const couponSchema = require('../model/couponemodel')
const userSchema = require('../model/userModel')

let message
let mess

/////////////////////// admin side coupone controller /////////////////////

const couponDetails = async (req, res) => {
  try {
    const couponDetails = await couponSchema.find({})
    const loginsession = req.session.admin_Id
    res.render('coupon', { couponDetails, message, mess, loginsession })
    message = null
    mess = null
  }
  catch (error) {
    console.log(error)
  }
}


const addcoupon = async (req, res) => {
  try {
    const { couponId, expiryDate, minAmount, maxAmount, discount, maxdiscount, couponName } = req.body
    const couponcheck = await couponSchema.findOne({ couponName: couponName })
    if (couponcheck) {
      message = 'Coupon already exist'
      res.redirect('/admin/coupon')
    }
    else {
      const insertcoupon = new couponSchema({
        couponName: couponName,
        couponId: couponId,
        expiryDate: expiryDate,
        maxAmount: maxAmount,
        minAmount: minAmount,
        discount: discount,
        max_discount: maxdiscount
      })
      const details = await insertcoupon.save()
      mess = 'Coupon added successfully'
      res.redirect('/admin/coupon')

    }
  }
  catch (error) {
    console.log(error)
  }
}


const deletecoupon = async (req, res) => {
  try {
    const deleteid = req.query.id
    const deletcoupon = await couponSchema.deleteOne({ _id: deleteid })
    mess = 'Coupon Deleted Successfully'
    res.redirect('/admin/coupon')
  }
  catch (error) {
    console.log(error)
  }
}

////////////////////////////// user side coupon ///////////////////////////



const useCoupon = async (req, res) => {
  try {

    const couponId = req.body.couponId
    const subTotal = req.body.subtotal
    const couponData = await couponSchema.findOne({ couponId: couponId });
    const userid = req.session.user_id

    const min = couponData.minAmount
    const max = couponData.maxAmount
    const Avg = (min + max) / 2
    console.log(subTotal)
    let discount = couponData.discount;
    const maxDiscount = couponData.max_discount
    let discountSubtotal
    let messa
    const checkUser = await couponSchema.findOne({ ref: userid, couponId: couponId })
    if (checkUser) {
      let wrong = 1
      discountSubtotal = subTotal
      discount = (discount - discount)
      messa = 'Already used'
      res.status(200).send({ messa, wrong, discountSubtotal, discount })
    } else {
      if (couponData) {
        const usedCoupon = await couponSchema.findOneAndUpdate({ couponId: couponId }, { $set: { ref: userid } })
        console.log(usedCoupon)

        if (couponData.expiryDate <= Date.now) {
          console.log(min)

          if (min <= subTotal) {
            if (subTotal <= Avg) {
              discountSubtotal = (subTotal * (1 - (couponData.discount) / 100)).toFixed(0);
              let userSchem = await userSchema.findByIdAndUpdate(userid, { discountedTotal: discountSubtotal })
              messa = 'Added'
              res.status(200).send({ discountSubtotal, discount, messa })
            } else {
              discountSubtotal = (subTotal * (1 - (couponData.max_discount) / 100)).toFixed(0)
              let userSchem = await userSchema.findByIdAndUpdate(userid, { discountedTotal: discountSubtotal })
              messa = 'Added'
              res.status(200).send({ discountSubtotal, maxDiscount, messa })
            }
          } else {
            messa = 'Min Amount for this coupon is' + couponData.minAmount
            discountSubtotal = subTotal
            discount = couponData.discount * 0;


            res.status(200).send({ messa, discountSubtotal, discount })
          }
        } else {
          messa = 'Coupon Expired'
          discountSubtotal = subTotal
          discount = couponData.discount * 0;
          res.status(200).send({ messa, discountSubtotal, discount })
        }
      } else {
        messa = 'Invalid Coupon'
        discountSubtotal = subTotal
        discount = couponData.discount * 0;
        res.status(200).send({ messa, discountSubtotal, discount })
      }

    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  couponDetails,
  addcoupon,
  deletecoupon,
  useCoupon
}