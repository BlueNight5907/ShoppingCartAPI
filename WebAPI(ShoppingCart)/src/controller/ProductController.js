const httpStatus = require("http-status");
const path = require('path');
const Product = require("../model/Product");
const Tag = require("../model/Tag");
const Category = require("../model/Category");
const APIError = require("../helper/APIError");
const {moveFile, deleteFile, existFile} = require("../helper/fileSystem")

const getProducts = async (req, res, next) => {
    let {page} = req.params;
    let perPage = 20;
    if(!page){
        page = 1;
    }

    try{
        let totalPage = Math.ceil(await Product.estimatedDocumentCount()/20);
        if(page > totalPage || page < 0){
            const error = new APIError("Not Found", httpStatus.NOT_FOUND, true);
            return next(error);
        }
        let products = await Product.find({isDeleted:false}).skip((perPage * page) - perPage).limit(perPage).exec();
        products = await Promise.all(products.map(async pd => {
            let product = pd.toObject();
            delete product.createdAt;
            delete product.__v;
            delete product.isDeleted;
            let tags = await Promise.all(product.tags.map( (Id) => {
                return Tag.findById(Id,{"_id":1,"name":1});
            }))
            product.tags = tags;
            let category = await Category.findById(product.categoryID,{"_id":1,"name":1});
            product.category = category;
            delete product.categoryID;
            return product
        }))
        res.json({
            totalPage:totalPage,
            currentPage:parseInt(page),
            productList:products
        })
    }catch (err){
        console.log(err.message)
        const error = new APIError("Có lỗi xảy ra", httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(error);
    }
}
const getProduct = async (req, res, next) => {
    const {id} = req.params;
    if(!id){
        return res.json({
            status:'success',
            message:'Chào bạn đến với Product API'
        })
    }
    try{
        let product = (await Product.findById(id).exec())?.toObject();
        if(!product || product.isDeleted){
            const error = new APIError("Sản phẩm không tồn tại! Vui lòng thử lại với sản phẩm khác", httpStatus.NOT_FOUND, true);
            return next(error);
        }
        delete product.updatedAt;
        delete product.__v;
        delete product.isDeleted;
        let tags = await Promise.all(product.tags.map( (Id) => {
            return Tag.findById(Id,{"_id":1,"name":1});
        }))
        product.tags = tags;
        let category = await Category.findById(product.categoryID,{"_id":1,"name":1});
        product.category = category;
        delete product.categoryID;
        res.json({
            status:"success",
            data:product
        })
    }catch (err){
        console.log(err.message)
        const error = new APIError("Sản phẩm không tồn tại! Vui lòng thử lại với sản phẩm khác", httpStatus.NOT_FOUND, true);
        return next(error);
    }
}
const deleteProduct = async (req, res, next) => {
    const {id} = req.params;
    if(!id){
        const error = new APIError("Vui lòng cung cấp dủ thông tin", httpStatus.BAD_REQUEST, true);
        return next(error);
    }
    try{
        let product = await Product.findById(id).exec();
        if(!product || product.isDeleted){
            const error = new APIError("Sản phẩm không tồn tại! Vui lòng thử lại với sản phẩm khác", httpStatus.NOT_FOUND, true);
            return next(error);
        }

        product.isDeleted = true;
        product.save();
        res.json({
            status:"success",
            message:"Xóa sản phẩm thành công"
        })
    }
    catch (err){
        if (err.name === 'ValidationError') {
            const error = new APIError("Sản phẩm không tồn tại! Vui lòng thử lại với sản phẩm khác", httpStatus.NOT_FOUND, true);
            return next(error);
        }
        else {
            let error = new APIError("Có lỗi xảy ra",httpStatus.INTERNAL_SERVER_ERROR,true);
            return next(error);
        }
    }
}
const updateProduct = async (req, res, next) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({
            status:'error',
            message:'Chưa cung cấp đủ thông tin!!'
        })
    }

    try{
        let product = await Product.findById(id).exec();
        if(!product || product.isDeleted){
            return res.status(404).json({
                status:'error',
                message:'Sản phẩm không tồn tại! Vui lòng thử lại với sản phẩm khác',
            })
        }
        const {name, desc, price, tags, active, categoryID, productPicture} = req.body;
        if(name){
            product.name = name;
        }
        if(desc){
            product.desc = desc;
        }
        if(tags){
            product.tags = (await Promise.all(tags.map(async id => {
                return (await Tag.findById(id, {'_id': 1}))?._id
            }))).filter(e => e!=null);
        }
        if(categoryID){
            const  category = await Category.findById(categoryID,{'_id': 1});
            if(!category){
                const error = new APIError("Sai định dạng Category hoặc Category không tồn tại", httpStatus.BAD_REQUEST, true);
                return next(error);
            }
            product.categoryID = category._id;
        }
        if(productPicture){
            if(productPicture != product.productPicture){
                const newPicture = path.join(__dirname,"../../"+productPicture);
                if(await existFile(newPicture)){
                    product.productPicture = productPicture;
                }
                else {
                    const error = new APIError("Product Picture Không tồn tại", httpStatus.BAD_REQUEST, true);
                    return next(error);
                }
            }
        }
        product.price = price || product.price;
        product.active = (active != null)?active:product.active;
        await product.save();
        //Xử lý thông tin trả về cho người dùng
        product = product.toObject();
        delete product.updatedAt;
        delete product.__v;
        delete product.isDeleted;
        let tagsArr = await Promise.all(product.tags.map( (Id) => {
            return Tag.findById(Id,{"_id":1,"name":1});
        }))
        product.tags = tagsArr;
        let category = await Category.findById(product.categoryID,{"_id":1,"name":1});
        product.category = category;
        delete product.categoryID;

        res.json({
            status:"success",
            message:"Cập nhật thành công",
            data:product
        })
    }
    catch (err){
        console.log(err)
        const error = new APIError("Có lỗi xảy ra, vui lòng thử lại sau", httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(error);
    }
}
const upload = async (req, res, next) => {
    try{
        moveFile(req.file.path,path.join(__dirname,"../../public/images/products/"+req.file.filename))
        return res.json({
            status:'success',
            message:'Upload ảnh thành công',
            data:"/public/images/products/"+req.file.filename
        })
    }catch (err){
        console.log(err.message)
        const error = new APIError("Có lỗi xảy ra, vui lòng thử lại sau", httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(error);
    }
}
const addProduct = async (req, res, next) => {
    let body = req.body;
    try{
        if(!body.categoryID ||! await Category.findById(body.categoryID)){
            body.categoryID = (await Category.findOne({name:"Khác"}))?._id;
        }
        let product = new Product({
            ...body,
        })
        await product.save();
        product = product.toObject();
        delete product.updatedAt;
        delete product.__v;
        delete product.isDeleted;
        let tags = await Promise.all(product.tags.map( (Id) => {
            return Tag.findById(Id,{"_id":1,"name":1});
        }))
        product.tags = tags;
        let category = await Category.findById(product.categoryID,{"_id":1,"name":1});
        product.category = category;
        delete product.categoryID;
        return res.json({
            status:'success',
            message:'Thêm sản phẩm thành công',
            data:product
        })
    }
    catch (err){
        console.log(err.message)
        const error = new APIError("Có lỗi xảy ra, vui lòng thử lại sau", httpStatus.INTERNAL_SERVER_ERROR, true);
        return next(error);
    }
}
module.exports = {
    getProduct,
    addProduct,
    deleteProduct,
    updateProduct,
    upload,
    getProducts
}