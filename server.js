var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoose = require('mongoose');
var session = require('express-session');
var moment = require('moment');
var json2csv = require('json2csv');
var mime = require('mime');

var app = express();

// use middleware
app.use(express.static(path.join(__dirname, 'partials')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'js')));
app.use(session({secret: 'ssshhhhh'}));

// very important - to access the http request body
app.use(bodyParser.json());

fs.readdirSync(__dirname + '/models').forEach(function(filename){
    if( ~filename.indexOf('.js')) require(__dirname + '/models/' + filename)
});

// database connection
mongoose.connect('mongodb://localhost/applications');
var connSales = mongoose.createConnection('mongodb://localhost/sales');

// INITALIZE VARIABLES
var sess;

var januarStartDate     = moment('01/01/2015', 'MM/DD/YYYY');
var januarEndDate       = moment('01/31/2015', 'MM/DD/YYYY');
var februarStartDate    = moment('02/01/2015', 'MM/DD/YYYY');
var februarEndDate      = moment('02/28/2015', 'MM/DD/YYYY');
var maerzStartDate      = moment('03/01/2015', 'MM/DD/YYYY');
var maerzEndDate        = moment('03/31/2015', 'MM/DD/YYYY');
var aprilStartDate      = moment('04/01/2015', 'MM/DD/YYYY');
var aprilEndDate        = moment('04/30/2015', 'MM/DD/YYYY');
var maiStartDate        = moment('05/01/2015', 'MM/DD/YYYY');
var maiEndDate          = moment('05/31/2015', 'MM/DD/YYYY');
var juniStartDate       = moment('06/01/2015', 'MM/DD/YYYY');
var juniEndDate         = moment('06/30/2015', 'MM/DD/YYYY');
var juliStartDate       = moment('07/01/2015', 'MM/DD/YYYY');
var juliEndDate         = moment('07/30/2015', 'MM/DD/YYYY');
var augustStartDate     = moment('08/01/2015', 'MM/DD/YYYY');
var augustEndDate       = moment('08/31/2015', 'MM/DD/YYYY');
var septemberStartDate  = moment('09/01/2015', 'MM/DD/YYYY');
var septemberEndDate    = moment('09/30/2015', 'MM/DD/YYYY');
var oktoberStartDate    = moment('10/01/2015', 'MM/DD/YYYY');
var oktoberEndDate      = moment('10/31/2015', 'MM/DD/YYYY');
var novemberStartDate   = moment('11/01/2015', 'MM/DD/YYYY');
var novemberEndDate     = moment('11/30/2015', 'MM/DD/YYYY');
var dezemberStartDate   = moment('12/01/2015', 'MM/DD/YYYY');
var dezemberEndDate     = moment('12/31/2015', 'MM/DD/YYYY');

/* ROUTING LOGIN START */

app.post('/login', function (request, response){

    mongoose.model('users').findOne({name : request.body['name']}, function (err, user) {

        if (user && request.body.password) {
            if (user.password == request.body.password) { // Successful login
                console.log('LOGIN ' + user.name);
                sess = request.session;
                sess.name = user.name;
                response.send('work');
            } else { // Authentication failed
                response.send('fail');
            }
        }
        else {
            response.send('fail');
        }
    });
});

/* ROUTING LOGIN END */

/* ROUTING LOGOUT START */

app.get('/logout', function (req, res){
    req.session.destroy(function(err) {
        if (err) console.log(err);
        else res.redirect('#/login');
    });
});

/* ROUTING LOGIN END */

/* ROUTING DASHBOARD START */

app.get('/dashboard', function (req, res){

    if(req.session.name) {
        mongoose.model('application').find({}, function (err, application) {
            res.send(application);
        });
    } else {
        res.send('no');
    }
});

/* ROUTING DASHBOARD END */

/* ROUTING DATA START */

    /* HTTP - GET */
    app.get('/data', function (request, response){

        if(request.session.name) {
            mongoose.model('application').find({}, function (err, application) {
                response.send(application);
            });
        } else {
            response.send('no');
        }
    });

    app.get('/data/search/:search', function (req, res){

        if(req.session.name) {
            mongoose.model('application').find({ $or: [ {name: req.params.search},
                                                        {telefonnummer: req.params.search},
                                                        {email: req.params.search},
                                                        {transport: req.params.search} ]
                }, function (err, application) {

                res.send(application);
            });
        } else {
            res.send('no');
        }
    });

    app.get('/data/from/:zeitraum', function (req, res){

        var zeitraum = req.params.zeitraum;

        var amount = 0;
        var amountOpen = 0;
        var amountFollow = 0;
        var verkaufszahlen = 0;
        var umsatz = 0;
        var conversionrate = 0;

        var dateBis = moment().format('MM/DD/YYYY');

        // Applications - today
        if(zeitraum == 'heute'){

            mongoose.model('application').find({ eingangsdatum: dateBis }, function (err, application) {

                application.forEach(function(entry) {
                    if (entry.status == "open") {
                        amountOpen++;
                    } else if (entry.status == "follow") {
                        amountFollow++;
                    }
                    amount++;
                });

                var dataBack = {
                    amount: amount,
                    amountOpen: amountOpen,
                    amountFollow: amountFollow
                };

                res.json(dataBack);
            });
        }

        // Applications - last 7 days
        if(zeitraum == '7 T'){

            var dateVon = moment().subtract(7,'days').format('MM/DD/YYYY');

            mongoose.model('application').find({ eingangsdatum: { $gte: dateVon, $lte: dateBis } }, function (err, application) {

                application.forEach(function(entry) {
                    if (entry.status == "open") {
                        amountOpen++;
                    } else if (entry.status == "follow") {
                        amountFollow++;
                    }
                    amount++;
                });

                var dataBack = {
                    amount: amount,
                    amountOpen: amountOpen,
                    amountFollow: amountFollow
                };

                res.json(dataBack);
            });
        }

        // Applications - last 30 days
        if(zeitraum == '30 T'){

            var dateVon = moment().subtract(30,'days').format('MM/DD/YYYY');

            mongoose.model('application').find( {eingangsdatum: { $gte: dateVon, $lte: dateBis } }, function (err, application) {

                application.forEach(function(entry) {
                    if (entry.status == "open") {
                        amountOpen++;
                    } else if (entry.status == "follow") {
                        amountFollow++;
                    }
                    amount++;
                });

                var dataBack = {
                    amount: amount,
                    amountOpen: amountOpen,
                    amountFollow: amountFollow
                };

                res.json(dataBack);
            });

        }
        // Applications - all
        if(zeitraum == 'alle'){

            mongoose.model('application').find({ }, function (err, application) {

                application.forEach(function(entry) {
                    if (entry.status == "open") {
                        amountOpen++;
                    }
                    else if (entry.status == "follow") {
                        amountFollow++;
                    }
                    amount++;
                });

                var dataBack = {
                    amount: amount,
                    amountOpen: amountOpen,
                    amountFollow: amountFollow
                };

                res.json(dataBack);

            });
        }
    });

    app.get('/sale/from/:zeitraum', function (req, res){

        var zeitraum = req.params.zeitraum;

        var totalReturn = 0;
        var totalProfit = 0;
        // convertionrate = (Amount sales / Amount Applications) * 100

        // today
        var dateBis = moment().format('MM/DD/YYYY');

        // Sales - today
        if(zeitraum === "heute"){

            var dateVon = moment().format('MM/DD/YYYY');

            mongoose.model('application').find({ eingangsdatum: dateVon }, function (err, application) {
                // Amount application today

                connSales.model('sales').find({ saleDate: dateVon }, function (err, sale) {

                    sale.forEach(function(entry) {
                        totalReturn = totalReturn + parseInt(entry.saleReturn);
                        totalProfit = totalProfit + parseInt(entry.saleProfitCB);
                    });

                    var dataBack = {
                        totalReturn: Math.round(totalReturn),
                        totalProfit: Math.round(totalProfit),
                        conversionrate: Math.round(((sale.length / application.length) * 100))
                    };

                    res.json(dataBack);
                });

            });

        } else if ( zeitraum === "7 T"){

            var dateVon = moment().subtract(7,'days').format('MM/DD/YYYY');

            mongoose.model('application').find( {eingangsdatum: {$gte: dateVon, $lte: dateBis}}, function (err, application) {
                // Amount application - last 7 days

                connSales.model('sales').find({saleDate: {$gte: dateVon, $lte: dateBis}}, function (err, sale) {

                    sale.forEach(function (entry) {
                        totalReturn = totalReturn + parseInt(entry.saleReturn);
                        totalProfit = totalProfit + parseInt(entry.saleProfitCB);
                    });

                    var dataBack = {
                        totalReturn: Math.round(totalReturn),
                        totalProfit: Math.round(totalProfit),
                        convertionrate: Math.round(((sale.length / application.length) * 100))
                    };

                    res.json(dataBack);
                });
            });

        } else if ( zeitraum === "30 T"){

            var dateVon = moment().subtract(30,'days').format('MM/DD/YYYY');

            mongoose.model('application').find( {eingangsdatum: {$gte: dateVon, $lte: dateBis}}, function (err, application) {
                // Amount application - last 30 days

                connSales.model('sales').find({saleDate: {$gte: dateVon, $lte: dateBis}}, function (err, sale) {

                    sale.forEach(function (entry) {
                        totalReturn = totalReturn + parseInt(entry.saleReturn);
                        totalProfit = totalProfit + parseInt(entry.saleProfitCB);
                    });

                    var dataBack = {
                        totalReturn: Math.round(totalReturn),
                        totalProfit: Math.round(totalProfit),
                        convertionrate: Math.round(((sale.length / application.length) * 100))
                    };

                    res.json(dataBack);
                });
            });
        } else if ( zeitraum === "alle"){

            mongoose.model('application').find({}, function (err, application) {
                // Amount of all applications ever

                connSales.model('sales').find({}, function (err, sale) {

                    sale.forEach(function (entry) {
                        totalReturn = totalReturn + parseInt(entry.saleReturn);
                        totalProfit = totalProfit + parseInt(entry.saleProfitCB);
                    });

                    var dataBack = {
                        totalReturn: Math.round(totalReturn),
                        totalProfit: Math.round(totalProfit),
                        convertionrate: Math.round(((sale.length / application.length) * 100))
                    };

                    res.json(dataBack);
                });
            });
        }
    });

    app.get('/data/:id', function(req, res){

        mongoose.model('application').find({_id: req.params.id}, function (err, application) {
            res.json(application[0]);
        });
    });

    app.get('/data/status/:status', function(req, res) {

        if(req.session.name) {
            mongoose.model('application').find({status: req.params.status}, function (err, application) {
                res.send(application);
            });
        } else {
            res.send('no');
        }
    });

    app.get('/sale/:id', function(req, res){

        connSales.model('sales').findOne({_id: req.params.id}, function (err, sale) {
            res.json(sale);
        });
    });

    app.get('/sales/', function(req, res) {

        if(req.session.name) {
            connSales.model('sales').find({ }, function (err, sale) {

                sale.forEach(function(entry) {

                    if(entry.applicationID) {
                        mongoose.model('application').findById( entry.applicationID, function (err, application) {
                            if(application) {
                                entry.kaeufer = application.name;
                            }
                        });
                    }
                });
                res.json(sale);
            });
        } else {
            res.send('no');
        }
    });


    /* STATISTIKEN START */

    app.get('/sales/conversionrate', function(req, res) {

        var convertionrate = {
            januar: 0,
            februar: 0,
            maerz: 0,
            april: 0,
            mai: 0,
            juni: 0,
            juli: 0,
            august: 0,
            september: 0,
            oktober: 0,
            november: 0,
            dezember: 0
        };

        if(req.session.name) {

                // Conversion Rate Januar
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '01/01/2015',
                        $lte: '01/31/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '01/01/2015',
                            $lte: '01/31/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.januar = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate Februar
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '02/01/2015',
                        $lte: '02/28/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '02/01/2015',
                            $lte: '02/28/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.februar = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate Maerz
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '03/01/2015',
                        $lte: '03/31/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '03/01/2015',
                            $lte: '03/31/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.maerz = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate April
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '04/01/2015',
                        $lte: '04/30/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '04/01/2015',
                            $lte: '04/30/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.april = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate Mai
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '05/01/2015',
                        $lte: '05/31/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '05/01/2015',
                            $lte: '05/31/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.mai = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate Juni
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '06/01/2015',
                        $lte: '06/30/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '06/01/2015',
                            $lte: '06/30/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.juni = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate Juli
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '07/01/2015',
                        $lte: '07/30/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '07/01/2015',
                            $lte: '07/30/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.juli = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate August
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '08/01/2015',
                        $lte: '08/31/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '08/01/2015',
                            $lte: '08/31/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.august = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate September
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '09/01/2015',
                        $lte: '09/30/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '09/01/2015',
                            $lte: '09/30/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.september = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate Oktober
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '10/01/2015',
                        $lte: '10/31/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '10/01/2015',
                            $lte: '10/31/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.oktober = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate November
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '11/01/2015',
                        $lte: '11/30/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '11/01/2015',
                            $lte: '11/30/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.november = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                // Conversion Rate Dezember
                mongoose.model('application').find({
                    eingangsdatum: {
                        $gte: '12/01/2015',
                        $lte: '12/31/2015'
                    }
                }, function (err, application) {
                    connSales.model('sales').find({
                        saleDate: {
                            $gte: '12/01/2015',
                            $lte: '12/31/2015'
                        }
                    }, function (err, sale) {
                        convertionrate.dezember = Math.round(((parseInt(sale.length) / parseInt(application.length)) * 100));
                    });
                });

                setTimeout(function () {
                    res.json(convertionrate); // hier aufgrund der asynchronen Abarbeitung von Node.js
                }, 3000);

        }else {
            res.send('no');
        }
    });

    app.get('/sales/umsatz', function(req, res) {

        var umsatz = {
            januar: 0,
            februar: 0,
            maerz: 0,
            april: 0,
            mai: 0,
            juni: 0,
            juli: 0,
            august: 0,
            september: 0,
            oktober: 0,
            november: 0,
            dezember: 0
        };

        if(req.session.name) {

            connSales.model('sales').find({}, function (err, sale) {
                sale.forEach(function (entry) {
                    if (moment(entry.saleDate).isBetween(januarStartDate, januarEndDate)) {
                        umsatz.januar = umsatz.januar + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(februarStartDate, februarEndDate)) {
                        umsatz.februar = umsatz.februar + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(maerzStartDate, maerzEndDate)) {
                        umsatz.maerz = umsatz.maerz + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(aprilStartDate, aprilEndDate)) {
                        umsatz.april = umsatz.april + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(maiStartDate, maiEndDate)) {
                        umsatz.mai = umsatz.mai + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(juniStartDate, juniEndDate)) {
                        umsatz.juni = umsatz.juni + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(juliStartDate, juliEndDate)) {
                        umsatz.juli = umsatz.juli + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(augustStartDate, augustEndDate)) {
                        umsatz.august = umsatz.august + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(septemberStartDate, septemberEndDate)) {
                        umsatz.september = umsatz.september + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(oktoberStartDate, oktoberEndDate)) {
                        umsatz.oktober = umsatz.oktober + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(novemberStartDate, novemberEndDate)) {
                        umsatz.november = umsatz.november + parseInt(entry.saleReturn);
                    } else if (moment(entry.saleDate).isBetween(dezemberStartDate, dezemberEndDate)) {
                        umsatz.dezember = umsatz.dezember + parseInt(entry.saleReturn);
                    }
                });
                res.json(umsatz);
            });
        } else {
            res.send('no');
        }
    });

    app.get('/sales/gewinn', function(req, res) {

        var gewinn = {
            januar: 0,
            februar: 0,
            maerz: 0,
            april: 0,
            mai: 0,
            juni: 0,
            juli: 0,
            august: 0,
            september: 0,
            oktober: 0,
            november: 0,
            dezember: 0
        };

        if(req.session.name) {

            connSales.model('sales').find({}, function (err, sale) {
                sale.forEach(function(entry) {
                    if(moment(entry.saleDate).isBetween(januarStartDate,januarEndDate)){
                        gewinn.januar = gewinn.januar + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(februarStartDate,februarEndDate)) {
                        gewinn.februar = gewinn.februar + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(maerzStartDate,maerzEndDate)) {
                        gewinn.maerz = gewinn.maerz + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(aprilStartDate,aprilEndDate)) {
                        gewinn.april = gewinn.april + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(maiStartDate,maiEndDate)) {
                        gewinn.mai = gewinn.mai + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(juniStartDate,juniEndDate)) {
                        gewinn.juni = gewinn.juni + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(juliStartDate,juliEndDate)) {
                        gewinn.juli = gewinn.juli + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(augustStartDate,augustEndDate)) {
                        gewinn.august = gewinn.august + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(septemberStartDate,septemberEndDate)) {
                        gewinn.september = gewinn.september + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(oktoberStartDate,oktoberEndDate)) {
                        gewinn.oktober = gewinn.oktober + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(novemberStartDate,novemberEndDate)) {
                        gewinn.november = gewinn.november + parseInt(entry.saleProfitCB);
                    } else if (moment(entry.saleDate).isBetween(dezemberStartDate,dezemberEndDate)) {
                        gewinn.dezember = gewinn.dezember + parseInt(entry.saleProfitCB);
                    }
                });
                res.json(gewinn);
            });
        } else {
            res.send('no');
        }
    });

    app.get('/applications', function(req, res) {

        var anfragen = {
            januar: 0,
            februar: 0,
            maerz: 0,
            april: 0,
            mai: 0,
            juni: 0,
            juli: 0,
            august: 0,
            september: 0,
            oktober: 0,
            november: 0,
            dezember: 0
        };

        if(req.session.name) {

            mongoose.model('application').find({}, function (err, application) {
                application.forEach(function(entry) {
                    if(moment(entry.eingangsdatum).isBetween(januarStartDate,januarEndDate)){
                        anfragen.januar++;
                    } else if (moment(entry.eingangsdatum).isBetween(februarStartDate,februarEndDate)) {
                        anfragen.februar++;
                    } else if (moment(entry.eingangsdatum).isBetween(maerzStartDate,maerzEndDate)) {
                        anfragen.maerz++;
                    } else if (moment(entry.eingangsdatum).isBetween(aprilStartDate,aprilEndDate)) {
                        anfragen.april++;
                    } else if (moment(entry.eingangsdatum).isBetween(maiStartDate,maiEndDate)) {
                        anfragen.mai++;
                    } else if (moment(entry.eingangsdatum).isBetween(juniStartDate,juniEndDate)) {
                        anfragen.juni++;
                    } else if (moment(entry.eingangsdatum).isBetween(juliStartDate,juliEndDate)) {
                        anfragen.juli++;
                    } else if (moment(entry.eingangsdatum).isBetween(augustStartDate,augustEndDate)) {
                        anfragen.august++;
                    } else if (moment(entry.eingangsdatum).isBetween(septemberStartDate,septemberEndDate)) {
                        anfragen.september++;
                    } else if (moment(entry.eingangsdatum).isBetween(oktoberStartDate,oktoberEndDate)) {
                        anfragen.oktober++;
                    } else if (moment(entry.eingangsdatum).isBetween(novemberStartDate,novemberEndDate)) {
                        anfragen.november++;
                    } else if (moment(entry.eingangsdatum).isBetween(dezemberStartDate,dezemberEndDate)) {
                        anfragen.dezember++;
                    }
                });
                res.json(anfragen);
            });
        } else {
            res.send('no');
        }
    });

    app.get('/data/sales/', function(req, res) {

        if(req.session.name) {
            connSales.model('sales').find({ }, function (err, sale) {
                res.send(sale);
            });
        } else {
            res.send('no');
        }
    });

    /* HTTP - POST */
    app.post('/data/', function (request, response) {

        var Application = mongoose.model('application');

        var application = new Application({
            kind : request.body.kind,
            name : request.body.name,
            telefonnummer : request.body.telefonnummer,
            email : request.body.email,
            bedarf : request.body.bedarf,
            transport : request.body.transport,
            eingangsdatum : request.body.eingangsdatum,
            bearbeiter : request.body.bearbeiter,
            situation : request.body.situation,
            status : 'open'
        });

        application.save(function (err, data) {
            if (err) console.log(err);
            response.sendStatus(200);
        });
    });

    app.post("/data/sale/:id", function(req, res) {
        console.log("ID - ",req.params.id);
        mongoose.model('application').findById(req.params.id, function (err, application) {
            if(application) {

                if( req.body.containerTyp && req.body.containerAmount && req.body.return && req.body.profitCB ){
                    console.log("DRIN");
                    var Sale = connSales.model('sales');

                    var sale = new Sale({
                        applicationID: req.params.id,
                        kaeufer: application.name,
                        containerTyp :  req.body.containerTyp,
                        containerAmount : req.body.containerAmount,
                        containerTransport : req.body.containerTransport,
                        saleReturn : req.body.return,
                        saleProfitCB : req.body.profitCB,
                        saleDate : moment().format('L')
                    });

                    sale.save(function (err, data) {
                        if (err) console.log(err);
                        res.sendStatus(200);
                    });
                } else {
                    res.sendStatus(404);
                }
            } else {
                res.sendStatus(404);
            }
        });
    });

    /* HTTP - DELETE */
    app.delete('/data/:id', function(req, res){

        mongoose.model('application').remove({ _id: req.params.id }, function(err, application) {
            if (err)  res.send(err);
            res.sendStatus(200);
        });
    });

    app.delete('/sale/:id', function(req, res){

        connSales.model('sales').remove({ _id: req.params.id }, function(err, sale) {
            if (err)  res.send(err);
            res.sendStatus(200);
        });
    });

    /* HTTP - UPDATE */
    app.put('/data/:id', function(req, res){

        mongoose.model('application').findOne({_id: req.params.id}, function (err, application) {

            application.name =  req.body['name'];
            application.telefonnummer =  req.body['telefonnummer'];
            application.email = req.body['email'];
            application.bedarf =  req.body['bedarf'];
            application.transport = req.body['transport'];
            application.eingangsdatum =  req.body['eingangsdatum'];
            application.bearbeiter = req.body['bearbeiter'];
            application.situation =  req.body['situation'];
            application.status =  req.body['status'];

            application.save(function (err, data) {
                if (err) console.log(err);
                res.sendStatus(200);
            });
        });
    });

    app.put('/sale/:id', function(req, res){

        connSales.model('sales').findOne({_id: req.params.id}, function (err, sale) {

            sale.applicationID = req.body['applicationID'];
            sale.containerTyp = req.body['containerTyp'];
            sale.containerAmount = req.body['containerAmount'];
            sale.containerTransport = req.body['containerTransport'];
            sale.saleReturn = req.body['saleReturn'];
            sale.saleProfitCB = req.body['saleProfitCB'];
            sale.saleDate = req.body['saleDate'];

            sale.save(function (err, data) {
                if (err) console.log(err);
                res.sendStatus(200);
            });
        });
    });

    app.put('/data/:id/situation/:situation', function(req, res){

        mongoose.model('application').findOne({_id: req.params.id}, function (err, application) {

            application.status = 'follow';
            application.situation = req.params.situation;
            application.bearbeitungsdatum = moment().format('L');
            application.bearbeiter = req.session.name;

            application.save(function (err, data) {
                if (err) console.log(err);
                res.sendStatus(200);
            });
        });
    });

    app.put('/data/:id/status/:status', function(req, res){

        mongoose.model('application').findOne({_id: req.params.id}, function (err, application) {

            application.status = req.params.status;
            application.situation = req.params.status;
            application.bearbeiter = req.session.name;

            application.save(function (err, data) {
                if (err) console.log(err);
                res.sendStatus(200);
            });
        });
    });

/* ROUTING CALLS START */

app.get('/calls/status/open', function(req, res){

    mongoose.model('application').find({kind: "call", status: "open"}, function (err, application) {
        res.send(application);
    });
});


app.post('/calls', function (req, res) {

    var Application = mongoose.model('application');

    var application = new Application({
        kind: req.body.kind,
        name: req.body.name,
        telefonnummer: req.body.telefonnummer,
        email: req.body.email,
        bedarf: req.body.bedarf,
        transport: req.body.transport,
        bearbeitungsdatum: req.body.bearbeitungsdatum,
        eingangsdatum: req.body.eingangsdatum,
        bearbeiter: req.body.bearbeiter,
        situation: req.body.situation,
        status: req.body.status,
        priority: req.body.priority
    });

    application.save(function (err, data) {
        if (err) console.log(err);
        res.sendStatus(200);
    });
});

/* ROUTING CALLS END */

/* USER ROUTING START*/

app.get('/user', function (req, res){

    if(req.session.name) {
        mongoose.model('users').findOne( {name : req.session.name }, function (err, user) {
            res.send(user);
        });
    } else {
        res.send('no');
    }
});

app.put('/user', function (req, res){

    if(req.session.name) {
        if(req.body.newpassword){

            mongoose.model('users').findOne( {name : req.session.name }, function (err, user) {

                user.password = req.body.newpassword;
                user.save(function (err, data) {
                    if (err) console.log(err);
                    res.sendStatus(200);
                });
            });
        } else {
            res.sendStatus(404);
        }
    } else {
        res.send('no');
    }
});

app.post('/user', function (req, res){

    mongoose.model('users').findOne( {name : req.body.name }, function (err, user) {

        if (!user) {
            var User = mongoose.model('users');

            var user = new User({
                name : req.body.name,
                password: req.body.password
            });

            user.save(function (err, data) {
                if (err) console.log(err);
                res.sendStatus(200);
            });
        } else {
            res.send('no');
        }
    });
});

/* USER ROUTING END */

/* EMAIL ROUTING START */

app.post('/api/emails', function (req, res) {
    var Application = mongoose.model('application');

    var today = moment().format('MM/DD/YYYY');

    var application = new Application({
        kind: "mail",                                   // Standard 'mail'
        name: req.body.name,
        telefonnummer: req.body.telefonnummer,
        email: req.body.email,
        bedarf: req.body.bedarf,
        transport: req.body.transport,
        bearbeitungsdatum: "",                          // Standard ''
        eingangsdatum: today,                           // Standard 'heute'
        bearbeiter: "",                                 // Standard ''
        situation: "",                                  // Standard ''
        status: "open",                                 // Standard 'open'
        priority: ""                                    // Standard ''
    });

    application.save(function (err, data) {
        if (err) res.sendStatus(400);
        res.sendStatus(200);
    });
});

/* EMAIL ROUTING END */


/* GENERATE APPLICATION CSV START */

    app.get('/csv/data/', function (req, res) {

        mongoose.model('application').find( {}, function (err, application) {
            json2csv({data: application, fields: ['kind', 'name', 'telefonnummer', 'email', 'bedarf', 'transport', 'eingangsdatum', 'bearbeiter']}, function (err, csv) {
                if (err) console.log(err);
                fs.writeFile('exports/anfragen.csv', csv, function (err) {
                    if (err) throw err;
                });

                var file = __dirname + '/exports/anfragen.csv';

                var filename = path.basename(file);
                var mimetype = mime.lookup(file);

                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-type', mimetype);

                var filestream = fs.createReadStream(file);
                filestream.pipe(res);
            });
        });
    });

/* GENERATE APPLICATION CSV END */

/* GENERATE APPLICATION CSV START */

app.get('/sales/csv/', function (req, res) {

    connSales.model('sales').find({}, function (err, sales) {
        json2csv({data: sales, fields: ['kaeufer', 'containerTyp', 'containerAmount', 'containerTransport', 'saleReturn', 'saleProfitCB', 'saleDate']}, function (err, csv) {
            if (err) console.log(err);
            fs.writeFile('exports/sales.csv', csv, function (err) {
                if (err) throw err;
            });

            var file = __dirname + '/exports/sales.csv';

            var filename = path.basename(file);
            var mimetype = mime.lookup(file);

            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);

            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        });
    });
});

/* GENERATE APPLICATION CSV END */

// start the server
app.listen(80, function() {
    console.log('ready on port 80');
});
