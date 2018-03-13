const request = require('request');

module.exports = function (app, passport) {
    app.get('/', isLoggedIn, function (req, res) {
        res.render('home', {
            user: req.user,
            path: req.route.path
        });
    });

    app.get('/login', function (req, res) {
        res.render('login', {
            user: null,
            path: req.route.path
        });
    });

    app.get('/signup', function (req, res) {
        res.render('signup', {
            user: null,
            path: req.route.path
        });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });

    app.get("/search/:searchrequest", isLoggedIn, function (req, res) {
        let tosearch = req.params.searchrequest;

        let searchreturn;

        let requesturl = "https://api.bestbuy.com/v1/products((search=";
        requesturl += tosearch;
        requesturl += "))?apiKey=";
        requesturl += "xPiU10xEJA2LLkNMhxQ9GeDr";
        requesturl += "&sort=image.asc&show=image,regularPrice,";
        requesturl += "shortDescription,name,sku&pageSize=9&format=json";

        request(requesturl, function (err, response, body) {
            if (err) {
                console.log(err);
                res.redirect("/");
            }
            else {
                searchreturn = JSON.parse(body);
                res.render("search", {
                    user: req.user,
                    path: req.route.path,
                    search: searchreturn
                });
            }
        });

    });

    app.get('/tracking', isLoggedIn, function (req, res) {

        TrackItem.find({
            email: req.user.email,
        }, function (err, trackitem) {
            if (err) {
                console.log(err);
                res.redirect("/");
            }
            else {
                res.render('tracking', {
                    user: req.user,
                    path: req.route.path,
                    items: trackitem
                });
            }

        })

    });

    app.get('/tracking/:item/delete', isLoggedIn, function (req, res) {

        let itemdelete = req.params.item;

        res.render('deleteitem', {
            user: req.user,
            path: req.route.path,
            deleter: itemdelete
        });
    });

    app.get('/tracking/:item/check', isLoggedIn, function (req, res) {

        let itemcheck = req.params.item;

        TrackItem.findOne({ sku: itemcheck }, function (err, item) {
            if (err) {
                console.log(err);
                res.redirect("/");
            } else {

                let currentitemstats = parseFloat(item.price);

                let requr = "https://api.bestbuy.com/v1/products(sku in (";
                requr += itemcheck;
                requr += "))?";
                requr += "apiKey=xPiU10xEJA2LLkNMhxQ9GeDr";
                requr += "&sort=regularPrice.asc&show=regularPrice";
                requr += "&pageSize=1&format=json";

                request(requr, function (err, response, body) {
                    if (err) {
                        console.log(err);
                        res.redirect("/");
                    }
                    else {
                        let searchret = JSON.parse(body)
                    
                        newprice = parseFloat(searchret.products[0].regularPrice)

                        res.render('checkitem', {
                            user: req.user,
                            path: req.route.path,
                            checker: itemcheck,
                            currentdbprice :currentitemstats,
                            newprice: newprice
                        });
                    }
                });
            }
        })
    });

    app.post('/tracking/delete', isLoggedIn, function (req, res) {

        let itemdelete = req.body.itemdel;

        TrackItem.remove({ sku: itemdelete, email: req.user.email }, function (err) {
            if (err) {
                res.redirect('/');
            }
            else {
                res.redirect('/tracking');
            }
        });


    });

    app.post('/tracking', isLoggedIn, function (req, res) {
        let additem = req.body.addtotrack.split(",")
        let additemsku = additem[0];
        let additemname = additem[1];
        let additemprice = additem[2];

        TrackItem.count({ "sku": additemsku }, function (err, count) {
            console.log(count);
            if (count) {
                console.log("same sku not adding duplicate")
                res.redirect("/");
            }
            else {
                let newTrackItem = new TrackItem();
                newTrackItem.email = req.user.email;
                newTrackItem.sku = additemsku;
                newTrackItem.name = additemname;
                newTrackItem.price = additemprice;

                newTrackItem.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    else {
                        res.redirect("/tracking")
                    }
                })
            }
        })

    });

    app.post('/search', isLoggedIn, function (req, res) {
        let searchreq = req.body.search;
        res.redirect("/search/" + searchreq);
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup'
    }));

    app.use(function (req, res) {
        res.status(404);
        res.render('404', {
            user: null,
            path: undefined
        });
    });


    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            res.redirect('/login');
        }
    }
}