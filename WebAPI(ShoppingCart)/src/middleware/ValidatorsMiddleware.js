const {check,validationResult} = require('express-validator');
let validateRegisterUser = [
    check('username', 'Tên đăng nhập không được để trống').not().isEmpty(),
    check('username', 'Tên đăng nhập không hợp lệ').isAlphanumeric(),
    check('username', 'Tên đăng nhập phải lớn hơn 6 ký tự').isLength({ min: 6 }),
    check('email', 'Email không được để trống').not().isEmpty(),
    check('email', 'Email không hợp lệ').isEmail(),
    check('password', 'Password phải lớn hơn 6 ký tự').isLength({ min: 6 }),
    check('confirmPassword').trim()
    // Validate confirmPassword
    .custom(async (confirmPassword, {req}) => {
      const password = req.body.password
      // If password and confirm password not same
      // don't allow to sign up and throw error
      if(password !== confirmPassword){
        throw new Error('Mật khẩu không khớp')
      }
    }),
    check('firstName',"Tên không được để trống").not().isEmpty(),
    check('lastName',"Họ không được để trống").not().isEmpty(),
    check('telephone',"Số điện thoại không được để trống").not().isEmpty(),
    check('telephone',"Số điện thoại không hợp lệ ").isNumeric().isLength({min:10}),
];

let validateLogin = [
    check('username', 'Tên đăng nhập không được để trống').not().isEmpty(),
    check('password', 'Mật khẩu không được nhỏ hơn 6 ký tự').isLength({ min: 6 })
];

let validateProduct = [
    check('name',"Tên sản phẩm không được để trống").notEmpty(),
    check('price',"Giá tiền phải là số").isNumeric()
];
let validateCart = [
    check('quantity').custom(async ( quantity ) => {
    if(quantity && (isNaN(quantity) || quantity <= 0)){
        throw new Error("Kiểu dữ liệu không hợp lệ");
    }
})
];
let handleValidateError = (req,res,next) => {
  const {errors} = validationResult(req);
  if(errors?.length == 0){
    return next();
  }
  return res.status(422).json({status:'error',"message":errors[0].msg})
}

let validate = {
  validateRegisterUser,
  validateLogin,
  handleValidateError,
  validateProduct,
  validateCart
};

module.exports = validate;