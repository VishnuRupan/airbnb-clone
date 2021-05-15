var express = require("express");
var app = express();
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;
var bodyParser = require("body-parser");
var session = require("express-session");
var expressValidator = require("express-validator");
var flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const config = require("./config/database");
const multer = require("multer");
require("dotenv/config");

// mongodb+srv://senecaweb.ddc7n.mongodb.net/?retryWrites=true&w=majority

/////////////       Bring In Model      //////////////
let Roomers = require("./models/roomListing");
let User = require("./models/user");

/////////////        Bring in Mongoose  /////////////
const mongoose = require("mongoose");

///////////         connect to DB       //////////////////////
mongoose
  .connect(config.database, {
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected...");
  });

// Deprication Warnings
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(urlencodedParser);

/////////////   PUG Template Engine       ///////////////////
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

////////////        set Public Folder for CSS   ///////////
app.use(express.static("public"));

//////////////      Express Session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

//////////////      Express Messages
//  --require part brought down here in 'connect-flash'
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }

      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

////////////////        Access  Control         //////////////
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please Login");
    res.redirect("/login");
  }
}

/////////           Passport Config
require("./config/passport")(passport);

app.use(passport.initialize());
app.use(passport.session());

// multer uses function for setting filename and destination to save
const storage = multer.diskStorage({
  destination: "./public/img/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// holds the data in buffer
const upload = multer({ storage: storage });

///////////////////////////////////

app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  //console.log(res.locals.user);
  next();
});

app.get("/", (req, res) => {
  res.render("index", {});
});

app.get("/rooms", (req, res) => {
  Roomers.find({}, (err, rooms) => {
    if (err) {
      console.log(err);
    } else {
      res.render("rooms", {
        title: "Room",
        rooms: rooms,
      });
    }
  });
});

app.get("/room/:id", (req, res) => {
  Roomers.findById(req.params.id, (err, room) => {
    res.render("roomDesc", {
      room: room,
    });
  });
});

/////////////////   update room
app.post("/rooms/edit/:id", ensureAuthenticated, (req, res) => {
  // Validation Rules
  req.checkBody("title", "Title is required").notEmpty();
  req.checkBody("price", "Price is required").notEmpty();

  let room = {};
  room.title = req.body.title;
  room.price = req.body.price;
  room.location = req.body.location;
  room.desc = req.body.desc;

  let errors = req.validationErrors();

  if (errors) {
    res.render("index", {
      errors: errors,
    });
  } else {
    // query to specifiy which one we want to update
    let query = { _id: req.params.id };

    // USE Model to upadte
    // Pass query and data
    Roomers.updateOne(query, room, (err) => {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Room Updated");
        res.redirect("/dashboard");
      }
    });
  }
});

app.post("/lookup", urlencodedParser, (req, res) => {
  let location = req.body.where;

  Roomers.find({}, (err, rooms) => {
    if (err) {
      console.log(err);
    } else {
      res.render("filterRooms", {
        locations: location,
        rooms: rooms,
      });
    }
  });
});

/////////////////       LOGIN  SIGNUP Section

app.get("/login", (req, res) => {
  res.render("login", {});
});

app.post("/login", urlencodedParser, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

/////////////////       SIGN UP

app.get("/signup", (req, res) => {
  res.render("signup", {});
});

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const password = req.body.password;
  const birthday = req.body.birthday;
  let isAdmin = false;
  if (req.body.checked) {
    isAdmin = true;
  }

  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();

  req.checkBody("firstname", "First name is required").notEmpty();
  req.checkBody("lastname", "Last name is required").notEmpty();

  req.checkBody("password", "Password is required").notEmpty();
  req.checkBody("birthday", "Birthday is required").notEmpty();
  req
    .check(
      "password",
      "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 "
    )
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/);

  let errors = req.validationErrors();

  if (errors) {
    res.render("signup", {
      errors: errors,
    });
  } else {
    let newUser = new User({
      email: email,
      firstname: firstname,
      lastname: lastname,
      password: password,
      birthday: birthday,
      isAdmin: isAdmin,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.log(err);
        }

        newUser.password = hash;

        newUser.save((err) => {
          if (err) {
            console.log(err);
            req.flash("danger", "Email Already Registered");
            res.redirect("/signup");
          } else {
            req.flash("success", "You are now registered and can log in");
            res.redirect("/login");
          }
        });
      });
    });
  }
});

///////////////////         LOGOUT

app.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged Out");
  res.redirect("/login");
});

///////////////////     DashBoard

app.get("/dashboard", ensureAuthenticated, (req, res) => {
  User.find({}, (err, user) => {
    //console.log("In dashboard: ", req.user.firstname);
    var admin = [];
    Roomers.find({}, async (err, rooms) => {
      admin = await rooms;

      if (err) {
        console.log(err);
      } else {
        //console.log(admin);
        res.render("dashboard", {
          user: req.user,
          rooms: admin,
        });
      }
    });
  });
});

app.post("/rooms/add", upload.single("photo"), (req, res) => {
  // Validation Rules
  req.checkBody("title", "Title is required").notEmpty();
  req.checkBody("price", "Price is required").notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render("dashboard", {
      errors: errors,
    });
  } else {
    let room = new Roomers();
    room.title = req.body.title;

    room.price = req.body.price;
    room.location = req.body.location;
    room.desc = req.body.desc;
    room.img = req.file.filename;
    room.adminsemail = req.body.adminsemail;

    room.save((err) => {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Room Added");
        res.redirect("/dashboard");
      }
    });
  }
});

/*/rooms/book */
app.post("/rooms/book", urlencodedParser, (req, res) => {
  const formData = req.body;

  let startdate = Date.parse(formData.startdate);
  let enddate = Date.parse(formData.enddate);

  let calculated = Math.floor((enddate - startdate) / (1000 * 60 * 60 * 24));

  const dataReceived =
    "Your submission was received:<br/><br/>" +
    `Total Price for ${calculated} days is $${
      calculated * formData.price
    } CAD <br/>` +
    "Your form data was:<br/>" +
    JSON.stringify(formData);

  res.send(dataReceived);
});

app.get("/contact", (req, res) => {
  res.render("contact", {});
});

app.use((req, res) => {
  res.status(404).render("index");
});

///////////      setup http server to listen on HTTP_PORT   ///////////

app.listen(HTTP_PORT, () => {
  console.log("Express http server listening on: " + HTTP_PORT);
});
