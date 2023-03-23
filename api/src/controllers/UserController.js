require('dotenv').config()
const { User } = require('../models')
const jwt = require('jsonwebtoken');
const mainConfig = require('../config/config.js');



module.exports = {
    async getInfo(req, res){
        try{
            const user = await User.findOne({
                where: {
                    id_user: req.user.id_user
                }
            })

            if(user) {
                if(user.username === "admin") {
                    return res.status(200).send({
                        username: user.username,
                        flag: mainConfig.flag,
                        message: "Your credentials are correct"
                    });
                } else {
                    return res.status(200).send({
                        username: user.username,
                        message: "Your credentials are correct"
                    });
                }
            }

            res.status(400).send({
                message: "The user has not been found"
            })
            
        } catch(err){
            res.status(500).send({
                message: "Internal error"
            })
        }
    }
}