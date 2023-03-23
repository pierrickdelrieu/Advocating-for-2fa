require('dotenv').config()
const { User } = require('../models')
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require("crypto");
const md5 = require('md5');
const base32 = require('hi-base32');
const mainConfig = require('../config/config.js');






// jwt token with weak secret
function jwtCreateTempToken(user) {    
    return  jwt.sign({
        username: user.username.toLowerCase()
    },
    process.env.JWT_TEMP_SECRET_KEY,{
        expiresIn: "180s" // 3 min
    })
}


// jwt token with strong secret
function jwtCreateToken(user) {   
    console.log('jwtCreateToken : user : ' + JSON.stringify(user)) 
    const token = jwt.sign({
        username: user.username.toLowerCase()
    },
    process.env.JWT_SECRET_KEY,{
        expiresIn: "24h"
    })
    console.log('jwtCreateToken : token1 : ' + token)
    if(token){
        // We create the hash sha256 using the TOKEN_KEY
        console.log('jwtCreateToken : process.env.SHA_TOKEN_KEY : ' + process.env.SHA_TOKEN_KEY)
        const sha256Hasher = crypto.createHmac("sha256",process.env.SHA_TOKEN_KEY);
        console.log('jwtCreateToken : sha256Hasher : ' + process.env.SHA_TOKEN_KEY)
        if(sha256Hasher){
            // We hash our token
            const tokenHashed = sha256Hasher.update(token).digest("hex");
            console.log('jwtCreateToken : tokenHashed : ' + tokenHashed)
            user = User.update({
                token: tokenHashed
            }, {
                where: {
                    id_user: user.id_user,
                }
            })
            console.log('jwtCreateToken : token2 : ' + token)
            if(user){
                return token
            } else {
                return null
            }
        }
    } else {
        return null
    }
}



function get2faAuthCode(username) {
    secret = base32.encode(md5(md5(username.toLowerCase()))).replace(/=/g, '')
    
    return{
        otpauth_url: "otpauth://totp/" + mainConfig.name.replace(/ /g, '%20') + "%20%28" + username.toLowerCase() + "%29?secret=" + secret + "&issuer=" + mainConfig.company,
        secret: secret
    }
}


// verify2faAuthCode
function verify2faAuthCode(twoFACode, user) {
    console.log('verify2faAuthCode : twoFACode : ' + twoFACode)
    console.log('verify2faAuthCode : user : ' + JSON.stringify(user))
    return speakeasy.totp.verify({
        secret: user.doubleFactorAuthenticator,
        encoding: 'base32',
        token: twoFACode
    });
}


module.exports = {

    // Register User (POST)
    async register (req, res) {
        try{
            const {username, password} = req.body;
            if(!username || !password || username.length > 20 || password.length > 50){
                return res.status(400).json({
                    message: "Invalid information"
                })
            }

            // Check if user already exist
            const fetchUser = await User.findOne({
                where: {
                    username: username.toLowerCase(),
                }
            })
            
            if(fetchUser != null){
                return res.status(401).json({
                    message: "Username already exist"
                })
            }

            const newUser = await User.create({
                username: username.toLowerCase(),
                password: password
            })



            const token = jwtCreateTempToken(newUser.toJSON());


            return res.status(200).send({
                username: username.toLowerCase(),
                token: token,
                message: "Register successful"
            });
        
        } catch(err) {
            res.status(500).send({
                message: 'Internal Error'
            });
        }        
    }, 


    // Init 2FA (POST)
    async init2FA (req, res) {
        try{
            console.log('init2FA : user : ', req.user)
            // Get user from the request
            const user = req.user


            if (!user) {
                return res.status(401).send({
                    message: 'Token error'
                });
            }

    
            // Generate 2FA
            if(user.doubleFactorAuthenticator) {
                return res.status(401).send({
                    message: 'Your are already using 2FA'
                });
            }


            const { otpauth_url, secret } = get2faAuthCode(user.username.toLowerCase());
            console.log('init2FA : otpauth_url : ', otpauth_url)
            console.log('init2FA : secret : ', secret)
            const UrlQRCode = await QRCode.toDataURL(otpauth_url);
            console.log('init2FA : UrlQRCode : ', UrlQRCode)

            await User.update({doubleFactorAuthenticator: secret},
                {where: {id_user: user.id_user}}).then(
                    () => {
                        return res.status(200).send({
                            username: user.username.toLowerCase(),
                            UrlQRCode: UrlQRCode,
                            message: "Code generated"
                        });
                    }
                )
            
        } catch(err) {
            res.status(500).send({
                message: 'Internal Error'
            });
        }        
    }, 


    // Login User (POST)
    async login (req, res) {
       try{
            const { username, password } = req.body;

            if(!username || !password || username.length > 20 || password.length > 50){
                return res.status(400).json({
                    message: "Invalid information"
                })
            }


            const user = await User.findOne({
                where: {
                    username: username,
                }
            })


            if (!user) {
                return res.status(401).send({
                    message: 'Invalid information'
                });
            }
            
            // Else
            await user.comparePassword(password).then(isMatch => {
                if (!isMatch) {
                    return res.status(401).send({
                        message: 'Invalid information'
                    });
                }else {
                    const userJson = user.toJSON();
                    const token = jwtCreateTempToken(userJson);
                    global.token = token;

                    return res.status(200).send({
                        username: user.username.toLowerCase(),
                        token: token,
                        message: "Your credentials are correct"
                    });
                }
            })
            
            
        } catch(err){
            res.status(500).send({
                message: 'Internal error'
            });
        };
    },




    

    // Authenticate 2FA Code
    async loginWith2FA (req, res) {
        try{

            const user = req.user
            console.log('loginWith2FA : user : ', user)


            const { usertwoFACode } = req.body;


            if (!user) {
                return res.status(401).send({
                    message: 'Token error',
                    twofaIsActive: user.doubleFactorAuthenticator ? true : false
                });
            }
            else if(!usertwoFACode) {
                console.log('loginWith2FA : usertwoFACode : ', usertwoFACode)
                return res.status(200).send({
                    username: user.username.toLowerCase(),
                    message: 'You can try to login with 2FA',
                    twofaIsActive: user.doubleFactorAuthenticator ? true : false
                });
            } else {
                const userCodeValid = verify2faAuthCode(usertwoFACode, user);
                console.log('loginWith2FA : userCodeValid : ', userCodeValid)
                if (!userCodeValid) {
                    return res.status(401).send({
                        username: user.username.toLowerCase(),
                        message: 'Invalid code',
                        twofaIsActive: user.doubleFactorAuthenticator ? true : false
                    });
                }
                else{
                    return res.status(200).send({
                        username: user.username.toLowerCase(),
                        token: jwtCreateToken(user),
                        message: 'Authentication successful'
                    });
                }
            }
        }
        catch(err){
            res.status(500).send({
                message: 'Internal error'
            });
        }
    },


    // Logout
    async logout (req, res) {
        try{

            const user = req.user

            if (!user) {
                res.status(401).send({
                    message: 'Token error'
                });
            }
            else {  
                User.update({token: null}, 
                    {where : {id_user: user.id_user}})

                return res.status(200).send({
                    message: 'Logout successful'
                })
                   
            }
        }
        catch(err){
            res.status(500).send({
                message: 'Internal error'
            });
        }
    }
}