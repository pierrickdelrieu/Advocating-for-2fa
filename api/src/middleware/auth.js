require("dotenv").config()
const jwt = require("jsonwebtoken");
const {User} = require("../models");
const crypto = require("crypto")





async function verifyTempToken(req,res,next){
    const token = req.headers["x-access-token"];
    console.log('verifyTempToken : ' + token)

    if(!token){
        return res.status(401).send({
            message: "Unauthorized"
        });
    } 

    try{
        jwt.verify(token, process.env.JWT_TEMP_SECRET_KEY, (err, decoded) => {
            if (err) {
                console.log('verifyTempToken : err jwt verify')
                return res.status(401).send({ 
                    message: 'Unauthorized'});
            }

            User.findOne({
                where: {
                    username: decoded.username
                }
            }).then((user) => {
                if (!user) {
                    console.log('verifyTempToken : user not found')
                    return res.status(401).send({ 
                        message: 'Unauthorized'});
                }
                const userJson = user.toJSON()
                console.log('verifyTempToken : userJson : ' +JSON.stringify(userJson))
                req.user = userJson
                return next();
            });
        });
    } catch(err){
        return res.status(500).send({
            message: "Internal error"
        })
    }
}

async function verifyToken(req,res,next){
    const token = req.headers["x-access-token"];

    if(!token){
        return res.status(401).send({
            message: "Unauthorized"
        });
    } 

    try{
        //We create the hash for our token
        const sha256Hasher = crypto.createHmac("sha256", process.env.SHA_TOKEN_KEY);
        //We hash our token in order to retrieve its hash in the database
        const tokenHashed = sha256Hasher.update(token).digest("hex");

        const user = await User.findOne({
            where: {
                token: tokenHashed
            }
        }).then((user) => {
            if(user){
                jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                    if (err) {
                        return res.status(401).send({ 
                            message: 'Unauthorized'});
                    }
                    
                    const userJson = user.toJSON()
                    req.user = userJson
                    return next();
                
                });
            }
            else{
                return res.status(401).send({
                    message: "Invalid token"
                })
            }
        })
    }
    catch(err){
        return res.status(500).send({
            message: "Internal error"
        })
    }
    
}

module.exports = {verifyToken, verifyTempToken};