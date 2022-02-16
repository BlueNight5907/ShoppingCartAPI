const Category = require("../model/Category");
const APIError = require("../helper/APIError");
const httpStatus = require("http-status");
const Product = require("../model/Product");
exports.getAll = async (req,res, next) =>{
    const Categorys = await Category.find({},'_id name active').exec()
    res.json({
        status:"success",
        data: Categorys
    })
}

exports.addCategory = async (req,res, next) =>{
    const {name} = req.body;
    if(!name){
        const error = new APIError("Vui lòng cung cấp dủ thông tin", httpStatus.BAD_REQUEST, true);
        return next(error);
    }
    const category = await Category.findOne({name},'_id name').exec();
    if(category){
        const error = new APIError("Danh mục đã tồn tại", httpStatus.UNPROCESSABLE_ENTITY, true);
        return next(error);
    }
    const newCategory = new Category({
        name
    })
    await newCategory.save();
    res.json({
        status:"success",
        message:"Thêm Category thành công",
        data: {
            _id:newCategory._id,
            name:newCategory.name,
            active:newCategory.active
        }
    })
}

exports.deleteCategory = async (req,res, next) =>{
    const {id} = req.params;
    if(!id){
        const error = new APIError("Vui lòng cung cấp dủ thông tin", httpStatus.BAD_REQUEST, true);
        return next(error);
    }
    let isUsing = false;
    let product = await Product.findOne({categoryID:id});
    if(product){
        isUsing = true;
    }
    if(isUsing){
        const error = new APIError("Category đang được sử dụng, không thể xóa", httpStatus.CONFLICT, true);
        return next(error);
    }

    try{
        await Category.deleteOne({
            _id:id
        });

        res.json({
            status:"success",
            message:"Xóa Category thành công"
        })
    }
    catch (err){
        const error = new APIError("Không có dữ liệu, vui lòng thử lại sau", httpStatus.UNPROCESSABLE_ENTITY, true);
        return next(error);
    }
}

exports.updateCategory = async (req,res, next) =>{
    const {id} = req.params;
    const {name, active} = req.body;
    if(!id || !name){
        const error = new APIError("Vui lòng cung cấp dủ thông tin", httpStatus.BAD_REQUEST, true);
        return next(error);
    }
    try{
        const category = await Category.findById(id);
        category.name = name;
        category.active = active != null?active:category.active;
        await category.save();
        res.json({
            status:"success",
            message:"Cập nhật Category thành công",
            data:{
                _id:category._id,
                name:category.name,
                active:category.active
            }
        })
    }
    catch (err){
        const error = new APIError("Không có dữ liệu, vui lòng thử lại sau", httpStatus.UNPROCESSABLE_ENTITY, true);
        return next(error);
    }
}