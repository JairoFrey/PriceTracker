const express = require('express');
const app = express();
const port = 3005;
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const request = require('request');
const cron = require('node-cron');

mongoose.connect("mongodb://localhost/pricetrackerwebapp")
// ?authSource=admin", {
// //     user: "jayro15",
// //     pass: "Sophie#12"
// // });

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(session({ secret: "turtleneck69", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static(__dirname + '/public'));

require('./conf/user');
require('./conf/routes')(app, passport);
require('./conf/passport')(passport)
const TrackItem = require('./conf/trackitem');

cron.schedule('0 0 */4 * * *', function () {

    TrackItem.find({}, function (err, trackitems) {
        if (err) {
            console.log(err)
        }
        else {
            for (let i = 0; i < trackitems.length; i++) {
                let currentprice = parseFloat(trackitems[i].price);
                let currentsku = trackitems[i].sku;

                let requr = "https://api.bestbuy.com/v1/products(sku in (";
                requr += currentsku;
                requr += "))?";
                requr += "apiKey=xPiU10xEJA2LLkNMhxQ9GeDr";
                requr += "&sort=regularPrice.asc&show=regularPrice";
                requr += "&pageSize=1&format=json";
console.log(requr);
                request(requr, function (err, response, body) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        let searchret = JSON.parse(body);
                        let newprice = parseFloat(searchret.products[0].regularPrice);

                        if (newprice < currentprice) {
                            //Email Code Goes Here
                            //Email Code Goes Here
                            //Email Code Goes Here
                            //Email Code Goes Here
                            //Email Code Goes Here
                        }
                    }
                })
            }
        }
    })

});

app.listen(port, function (err) {
    if (!err) {
        console.log("Price Tracker Web App Active On Port 3005");
    }
    else {
        console.log(err);
    }
});