require('dotenv').config;
const auth = require("./middleware/auth.js");
const express = require('express');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const {sequelize} = require("./models")



const app = express();

const corsOptions = {
    origin: '*'
}



app.use(cors(corsOptions))
app.use(morgan("combined"))
app.use(bodyParser.json());



require('./routes/index.js')(app);

app.get('/',(req, res) => {
    res.send({
        message: "Welcome in this api challenge"
    });
})



sequelize.sync()
    .then(() => {
        app.listen(port, () => {
        console.log(`Server started on port ${port}`)
        });
    });