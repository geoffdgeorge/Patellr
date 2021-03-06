require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const exphbs = require('express-handlebars');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 4500;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// For Passport
app.use(session({ secret: 'my secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// For Handlebars
app.set('views', './views');
app.engine(
  'hbs',
  exphbs({
    extname: '.hbs',
  }),
);
app.set('view engine', '.hbs');

// Routes
require('./routes/apiRoutes')(app);
require('./routes/htmlRoutes')(app);
require('./routes/authRoutes')(app, passport);

// Passport Strategies
require('./config/passport/passport.js')(passport, db.User);

const syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === 'test') {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(() => {
  app.listen(PORT, () => {
    console.log(
      '==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.',
      PORT,
      PORT,
    );
  });
});

module.exports = app;
