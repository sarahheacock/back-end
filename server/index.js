const express = require('express');
const path = require('path');

const app = express();

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");

// const testConfig = require('config'); //we load the db location from the JSON files
const testConfig = require('./configure/config');
// const options = {
//   server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
//   replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
// };


const refreshRoutes = express.Router();
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const loginRoutes = require("./routes/loginRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const fileRoutes = require("./routes/fileRoutes");


//=====CONFIGURATION=============================
mongoose.connect(testConfig.DBHost); //connect to database
// app.set('superSecret', config.secret); //set secret variable


const db = mongoose.connection;
db.on("error", function(err){
  console.error("connection error:", err);
});
db.once("open", function(){
  console.log("db connection successful");
});

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));

refreshRoutes.use(express.static(path.resolve(__dirname, '../react-ui/public')));


// Answer API requests.
//===============================================================
refreshRoutes.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/public', 'index.html'));
});

//=================ROUTES=======================================

app.use('/sayHello', messageRoutes); //sayHello
app.use('/login', loginRoutes); //login admin and user
app.use('/auth', authRoutes); //facebook login
app.use('/page', pageRoutes); //create/edit page
app.use('/user', userRoutes); //create/edit user
app.use('/res', reservationRoutes); //get/create upcoming/availability
app.use('/file', fileRoutes);//upload file
app.use(refreshRoutes);

//===========================================================
//==========================================================
//catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

//Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

//=======START SERVER========================================
const port = process.env.PORT || 5000;

app.listen(port, function(){
  console.log("Express server is listening on port ", port);
});

module.exports = app;
