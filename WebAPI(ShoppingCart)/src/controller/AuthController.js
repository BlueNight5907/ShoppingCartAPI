const {generateToken,existUser,verifyToken,decodeToken} = require("../methods/AuthMethods")
const bcrypt = require("bcrypt")
const randToken = require('rand-token');
const jwtVariable = require('../config/jwt');
const User = require("../model/User")
const Role = require("../model/Role");


const register = async (req,res)=>{
    //check vaildate error
    let {username, password, email, firstName, lastName, telephone, address} = req.body;
    //check user
    if(await existUser({username})){
        return res.status(409).json({
            status:'error',
            message:'Người dùng đã tồn tại'
        });
    }
    //Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //Tạo người dùng mới
    try{
        const role = await Role.findOne({name:"user"})
        const newUser = new User({
            username,
            password:hashedPassword,
            email,
            firstName,
            lastName,
            telephone,
            address,
            roles:[role?._id]
        });
        const {password,roles,_id,__v,createdAt,updatedAt,...others} = (await newUser.save()).toObject();
        return res.json({
            status:"success",
            message:"Đăng ký thành công",
            data:others
        });
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            status:'error',
            message:'Có lỗi xảy ra'
        })
    }
}

const login = async (req, res) =>{
    const {username, password} = req.body;
    let user = (await User.getByUsername(username)).toObject();
    if(!user){
        return res.status(401).json({
            status:"error",
            message:"Tài khoản không tồn tại, vui lòng tạo tài khoản mới!!!"
        })
    }
    //Check password valid
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({
            status:"error",
            message:"Mật khẩu không hợp lệ"
        })
    }
    //Tạo accessToken
    const accessTokenLife =
        process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;
    const accessTokenSecret =
        process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;

    const dataForAccessToken = {
        username: user.username,
    };
    const accessToken = await generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife,
    );
    let refreshToken;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || jwtVariable.refreshTokenSecret;
    //-----------------------------------
    //Tạo refreshToken nếu chưa có hoặc đã hết hạn
    if(!user.refreshToken || !await verifyToken(user.refreshToken,refreshTokenSecret)){
        const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || jwtVariable.refreshTokenLife;
        const dataForRefreshToken = {
            data:randToken.generate(jwtVariable.refreshTokenSize)
        };
        refreshToken = await generateToken(
            dataForRefreshToken,
            refreshTokenSecret,
            refreshTokenLife,
        );
        User.updateRefreshToken(user.username,refreshToken)
    }
    else {
        refreshToken = user.refreshToken;
    }

    delete user.password;
    delete user.__v;
    delete user.refreshToken;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.roles;

    return res.json({
        status:"success",
        message:"Đăng nhập thành công",
        data:{
            accessToken,
            refreshToken,
            user
        }
    })
}

const logout = async (req, res) => {
    return res.json({
        status:"success",
        message:"Đăng xuất thành công"
    })
}

const refresh = async (req, res) => {
    // Lấy access token từ header
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader) {
        return res.status(401)
            .json({
                status:'error',
                message:'Không tìm thấy access token!'
            });
    }
    // Lấy refresh token từ body
    const refreshTokenFromBody = req.body.refreshToken;

    //Lấy ra khóa bí mật và expireTime
    const accessTokenSecret =
        process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;
    const accessTokenLife =
        process.env.ACCESS_TOKEN_LIFE || jwtVariable.accessTokenLife;

    //Giải mã accessToken
    const decoded = await decodeToken(
        accessTokenFromHeader,
        accessTokenSecret,
    );

    if(!decoded){
        return res.status(401)
            .json({
                status:'error',
                message:'Access token không hợp lệ!'
            });
    }
    //Lấy ra user
    const user = await User.getByUsername(decoded.payload.username);
    if (!user) {
        return res.status(401)
            .json({
                status:'error',
                message:'User không tồn tại!'
            });
    }

    //Check rf token
    if (refreshTokenFromBody !== user.refreshToken) {
        return res.status(400).json({
            status:'error',
            message:'Refresh token không hợp lệ!'
        });
    }

    //Kiểm tra xem rf token hết hạn chưa
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || jwtVariable.refreshTokenSecret;
    if(! await verifyToken(user.refreshToken,refreshTokenSecret)){
        return res.status(400).json({
            status:'error',
            message:'Refresh token hết hạn!'
        });
    }


    // Tạo access token mới
    const dataForAccessToken = {
        username:decoded.payload.username,
    };

    const accessToken = await generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife,
    );
    if (!accessToken) {
        return res
            .status(400)
            .json({
                status:'error',
                message:'Tạo access token không thành công, vui lòng thử lại!'
            });
    }
    return res.json({
        status:'success',
        accessToken,
    });

}

module.exports = {
    register,
    login,
    logout,
    refresh
}