const mongoose = require("mongoose");
const mongo_url = process.env.MONGO_lOCAL;

class Database{
    constructor(){
        this.connect()
    }
    connect(){
        mongoose.connect(mongo_url)
            .then(()=>{
                console.log("Database connection successfull");
                require('../genInitData');
            })
            .catch(err => {
                console.log(err);
                console.error("Database connection error")
            })
    }
}

module.exports = new Database();