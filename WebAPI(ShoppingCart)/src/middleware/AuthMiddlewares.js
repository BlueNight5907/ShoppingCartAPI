const jwtVariable = require('../config/jwt');

const User = require('../model/User');

const authMethod = require('../methods/AuthMethods');
const Role = require("../model/Role");

exports.isAuth = async (req, res, next) => {
    // Lấy access token từ header
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader) {
        return res.status(401)
            .json({
                status:'error',
                message:'Không tìm thấy access token!'
            });
    }
    const accessTokenSecret =
        process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;

    const verified = await authMethod.verifyToken(
        accessTokenFromHeader,
        accessTokenSecret,
    );

    if (!verified) {
        return res
            .status(401)
            .json({
                status:'error',
                message:'Bạn không có quyền truy cập vào tính năng này!'
            });
    }

    const user = await User.getByUsername(verified.payload.username);

    if(!user){
        return res
            .status(401)
            .json({
                status:'error',
                message:'Bạn không có quyền truy cập vào tính năng này!'
            });
    }
    req.user = user;
    return next();
};

exports.isModerator = async (req, res, next) =>{
    const modRole = await Role.findOne({name:"moderator"}).exec();
    const roles = req.user.roles;
    if(!roles.includes(modRole._id)){
        return res
            .status(401)
            .json({
                status:'error',
                message:'Bạn không có quyền truy cập vào tính năng này!'
            });
    }
    next();
}

exports.isAdmin = async (req, res, next) =>{
    const modRole = await Role.findOne({name:"admin"}).exec();
    const roles = req.user.roles;
    if(!roles.includes(modRole._id)){
        return res
            .status(401)
            .json({
                status:'error',
                message:'Bạn không có quyền truy cập vào tính năng này!'
            });
    }
    next();
}