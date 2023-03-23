// Imports
const bcrypt = require('bcrypt');



// Functions
function hashPassword(user, options) {
    const SALT_FACTOR = 8;
    if(!user.changed('password')) {
        return;
    }
    return bcrypt.genSalt(SALT_FACTOR)
    .then(salt => bcrypt.hash(user.password, salt, null))
    .then(hash => {
        user.setDataValue('password', hash);
    });
}


// Model
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(20),
            unique: true
        },
        password: {
            type: DataTypes.STRING(250),
            unique: false
        },
        doubleFactorAuthenticator: {
            type: DataTypes.STRING(250),
            unique: false
        },
        token: {
            type: DataTypes.TEXT('long'),
            unique: false
        }
    }, {
        hooks: {
            beforeCreate: hashPassword,
            beforeUpdate: hashPassword
        },
        //don't add the attributes createdAt and updatedAt
        timestamps: false,
    })

    User.prototype.comparePassword = function(password) {
        return bcrypt.compare(password, this.password);
    }

    return User;
};