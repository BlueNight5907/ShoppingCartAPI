const Tag = require("../model/Tag");
const APIError = require("../helper/APIError");
const httpStatus = require("http-status");
exports.getAll = async (req,res, next) =>{
    const tags = await Tag.find({},'_id name').exec()
    res.json({
        status:"success",
        data: tags
    })
}

exports.addTag = async (req,res, next) =>{
    const {name} = req.body;
    if(!name){
        const error = new APIError("Vui lòng cung cấp dủ thông tin", httpStatus.BAD_REQUEST, true);
        return next(error);
    }
    const tag = await Tag.findOne({name},'_id name').exec();
    if(tag){
        const error = new APIError("Nhãn đã tồn tại", httpStatus.UNPROCESSABLE_ENTITY, true);
        return next(error);
    }
    const newTag = new Tag({
        name
    })
    await newTag.save();
    res.json({
        status:"success",
        message:"Thêm tag thành công",
        data: {
            _id:newTag._id,
            name:newTag.name
        }
    })
}

exports.deleteTag = async (req,res, next) =>{
    const {id} = req.params;
    if(!id){
        const error = new APIError("Vui lòng cung cấp dủ thông tin", httpStatus.BAD_REQUEST, true);
        return next(error);
    }
    try{
        await Tag.deleteOne({
            _id:id
        });

        res.json({
            status:"success",
            message:"Xóa tag thành công"
        })
    }
    catch (err){
        const error = new APIError("Không có dữ liệu, vui lòng thử lại sau", httpStatus.UNPROCESSABLE_ENTITY, true);
        return next(error);
    }
}