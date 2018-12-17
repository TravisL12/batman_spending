const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes");
const app = express(); // Please do not remove this line, since CLI uses this line as guidance to import new controllers
const passport = require("passport");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

//Passport
app.use(passport.initialize());

app.use("/api", apiRoutes);

app.use("/", function(req, res) {
  res.statusCode = 200; //send the appropriate status code
  res.json({ status: "success", message: "Parcel Pending API", data: {} });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
