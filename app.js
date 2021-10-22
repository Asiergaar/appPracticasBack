// Module loads
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');

// instantiate an Express server
const app = express();

// Body-parser configuration
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// HTTP headers configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); //Acceso a nuestra API para todos los dominios
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));


// GET requests to check status
app.get("/status-api", (req, res) => {
    res.json(
        "Api working!!"
    );
});

// Route load
const clientRoutes = require('./routes/client.route');
const tokenRoutes = require('./routes/token.route');
const exchangeRoutes = require('./routes/exchange.route');
const pairRoutes = require('./routes/pair.route');
const poolRoutes = require('./routes/pool.route');
const progressRoutes = require('./routes/progress.route');
const capitalRoutes = require('./routes/capital.route');

app.use('/clients', clientRoutes);
app.use('/tokens', tokenRoutes);
app.use('/exchanges', exchangeRoutes);
app.use('/pairs', pairRoutes);
app.use('/pools', poolRoutes);
app.use('/progress', progressRoutes);
app.use('/capitals', capitalRoutes);

module.exports = app;
