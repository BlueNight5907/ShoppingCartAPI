const Role = require("./model/Role");
const Category = require("./model/Category");
const Tag = require("./model/Tag");
const Product = require("./model/Product");
const faker = require("faker/locale/vi");
const User = require("./model/User");
const bcrypt = require("bcrypt");
const GenInitData = async () =>{
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'user' to roles collection");
            });
            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'moderator' to roles collection");
            });
            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'admin' to roles collection");
            });
        }
    });

    Category.estimatedDocumentCount(async (err, count) => {
        if (err || count > 0) {
            return;
        }
        await new Category({
            name: "Khác"
        }).save(err => {
            if (err) {
                console.log("error", err);
            }
            console.log("added 'Khác' to category collection");
        });
        await new Category({
            name: "Áo thun"
        }).save(err => {
            if (err) {
                console.log("error", err);
            }
            console.log("added 'Áo thun' to category collection");
        });
        await new Category({
            name: "Áo khoác"
        }).save(err => {
            if (err) {
                console.log("error", err);
            }
            console.log("added 'Áo khoác' to category collection");
        });
        await new Category({
            name: "Quần jean"
        }).save(err => {
            if (err) {
                console.log("error", err);
            }
            console.log("added 'Quần jean' to category collection");
        });
    });

    Tag.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Tag({
                name: "Trang phục mùa đông"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'Trang phục mùa đông' to tags collection");
            });
            new Tag({
                name: "Áo"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'Áo' to tags collection");
            });
            new Tag({
                name: "Xu hướng"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'Xu hướng' to tags collection");
            });

            new Tag({
                name: "Phong cách"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'Phong cách' to tags collection");
            });
        }
    });

    setTimeout(()=>{
        Product.estimatedDocumentCount(async (err, count) =>{
            if(err || count > 0){
                return
            }
            const categories = await Category.find({}).exec()
            for(let i=0;i<100;i++){
                const product = new Product();
                product.name = faker.commerce.productName();
                product.desc = faker.commerce.productDescription();
                product.price = faker.commerce.price();
                product.productPicture = "/public/images/products/product.png"
                product.categoryID = categories[i%4]._id
                product.save();
            }
        })
    },4000);

    setTimeout(async ()=>{
            const count = await User.estimatedDocumentCount();
            if(count > 0){
                return;
            }
            const adrole = await Role.findOne({name:"admin"}).exec();
            console.log(adrole);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("123456", salt);
            const admin = new User({
                username:"admin123",
                email:"admin@ad.com",
                password:hashedPassword,
                firstName:"Huy",
                lastName:"Nguyễn Văn",
                telephone:"0376466945",
                roles:[adrole._id]
            })
            admin.save();
            const urole = await Role.findOne({name:"user"}).exec();
            console.log(urole);
            const user = new User({
                username:"user123",
                email:"admin@ad.com",
                password:hashedPassword,
                firstName:"Huy",
                lastName:"Nguyễn Văn",
                telephone:"0376466945",
                roles:[urole._id]
            })
            user.save();
        }, 4000)
}
exports = GenInitData();