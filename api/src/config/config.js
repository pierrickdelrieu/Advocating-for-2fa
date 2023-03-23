require('dotenv').config()

module.exports = {
    company: 'Hackday',
    name: 'Web Challenge - Authentification',
    author: 'Pierrick Delrieu',
    flag: 'SEFDS0RBWXtsMHdfand0X3MxZ25fQU5EX3QwdHBfYnlwNHNzM2R9', // base 64 of HACKDAY{l0w_jwt_s1gn_AND_t0tp_byp4ss3d}

    port: process.env.PORT || 3000,
    db: {
        database: process.env.DB_NAME,
        user: process.env.DB_USER, /* You have to enter your database username*/
        password: process.env.DB_PASS, /* You have to enter your database password */
        options: {
            dialect: process.env.DB_DIALECT || 'mysql',
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialectOptions: {
                connectionLimit: 10
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
        }
    }
}