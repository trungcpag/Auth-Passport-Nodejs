var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

var passport = require("passport");
var FacebookStrategy = require("passport-facebook");
// khoi tao mid
app.use(passport.initialize());

// passport cấu hình thêm để sử dụng session
// bản thân dòng 37 chỉ là mid
app.use(passport.session());

// data sẽ được mã hóa và đẩy vào trong session
// user = profile
passport.serializeUser(function (user, done) {
  done(null, user);
});

// tự động giải mã sessionID
passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: "251032236903240",
      clientSecret: "fda2f12980e76fdf193722676949c867",
      callbackURL:
        "https://9b65-2402-800-6343-9418-6de0-7a42-70d1-5656.ngrok.io/auth/facebook/callback",
    },
    //2. khi kích hoạt thành công thì thực hiện và trả về call back
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      return cb(null, profile);
    }
  )
);
//1. người dùng truy xuất vào đường dẫn /auth/facebook sẽ hiển thị trang đăng nhập
// do nó được kích hoạt
app.get("/auth/facebook", passport.authenticate("facebook"));
// 3. nhận trả về
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.get("/home", (req, res, next) => {
  res.json(req.user);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
