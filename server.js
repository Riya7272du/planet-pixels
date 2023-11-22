const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const axios = require("axios");
const path = require("path");
const bcrypt = require('bcrypt');
const { Schema } = mongoose;
const port=3000;
const apiKey = '6fca8b1dbfd32ae4eb4f41a1610981d2f2f4977a950ce0de551d763c3f03';
const API_KEY = '67DiXUuYN7cFgGKToh5e4Z4ljslckmLQEmFMZXqU';

const app = express();
const saltRounds = 10; // This defines the number of salt rounds for bcrypt
const Admins = new Set(["sonu.2022ca104@mnnit.ac.in","riya.2022ca083@mnnit.ac.in","yashashwi.2022ca113@mnnit.ac.in"]);
var id;
var call=0;
var quizScore=0;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/user")

const userSchema = new Schema({
    FirstName : String,
    LastName: String,
    age: Number,
    email:String,
    password:String,
    score:[]
});


const User = mongoose.model('User', userSchema);

//Google Authentication
app.use(
    session({
      secret: "pixles-2023",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GoogleStrategy(
      {
        clientID:'312196478227-segok9fv6b9r117g18nd41jhlrpivhk7.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          id=profile.emails[0].value;

          //Checking for Admin
          if(Admins.has(profile.emails[0].value))
          {
              res.redirect("dashboard");
          }


          if (!user) {
            
            const firstName = profile.name.givenName;
            const lastName = profile.name.familyName;
    
            // Create a new user in the database
            const newUser = new User({
              FirstName: firstName,
              LastName: lastName,
              email: profile.emails[0].value
            });
            //id= profile.emails[0].value;
    
            // Save the new user to the database
            user = await newUser.save();
            //console.log(id);
          }
          // Return the user object
          return cb(null, user);
        } catch (error) {
          return cb(error, null);
        }
      }
    )
  );

  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });
  
  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });
  
  
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      res.redirect("/start");
    }
  );

  app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/signin");
      }
    });
  });
  
  

//Login Manually

app.get("/signin",(req,res)=>
{
  res.render("signin");
})


app.post("/signin", async (req, res) => {
  try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
          const match = await bcrypt.compare(req.body.password, user.password);
          if (match) {
              // Passwords match, proceed with login
              id = req.body.email;
              if(Admins.has(req.body.email))
                {
                    res.redirect("dashboard");
                }
                else
                {
                  res.redirect("start");
                  console.log(user);
                }
          } else {
              // Passwords don't match
              res.redirect("/signin");
          }
      } else {
          // User not found
          res.redirect("/signup");
      }
  } catch (error) {
      console.error(error);
      res.redirect("/signin");
  }
});

app.get("/signup",(req,res)=>
{
    //console.log("request recieved")
    res.render("signup");
});


app.post("/signup", async (req, res) => {
    try {
        const emailToVerify = req.body.email;

        // Send a GET request to the QuickEmailVerification API
        const response = await axios.get(`https://api.quickemailverification.com/v1/verify?email=${emailToVerify}&apikey=${apiKey}`);

        // Check the response from the API
        if (response.data && response.data.result === 'valid') {
            // If the email is valid, proceed with signup
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                console.log("User already exists");
                return res.redirect("/signin");
            }

            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
            const newUser = new User({
                FirstName: req.body.FirstName,
                LastName: req.body.LastName,
                age: req.body.age,
                email: req.body.email,
                password: hashedPassword,
                score: [0]
            });

            await newUser.save();
            return res.redirect("/signin");
        } else {
            // If the email is invalid or other status, handle accordingly
            console.log('Invalid email');
            return res.redirect("/signup");
        }
    } catch (error) {
        console.error(error);
        return res.redirect("/signup");
    }
});
 
app.get("/",(req,res)=>
{
  res.render("home", {
    user: req.user
  });
});

app.get("/destination",(req,res)=>
{
  res.render("destination");
});


app.get("/start",(req,res)=>
{
    // TODO: normal authentication function needs to be implemented correctly. google auth works correctly
    //if(req.isAuthenticated()) res.render("start");
    //else res.redirect("/signin");
    call=0;
    quizScore=0;
    res.render("start");
})

app.get("/quiz", async (req, res) => {
    axios
      .get("https://the-trivia-api.com/v2/questions?tags=space&limit=1", {
        responseType: "json",
      })
      .then(function (response) {
        //console.log(response.data);
        const arr = response.data;
          //console.log(arr);
          question = arr[0].question.text;
          let options = arr[0].incorrectAnswers;
          options.push(arr[0].correctAnswer);
          options.sort();
          if(call===4)
          {
            res.render("finish",{Question: question,
              option1: options[0],
              option2: options[1],
              option3: options[2],
              option4: options[3],
              correct_option: arr[0].correctAnswer})
          }
          else
          {
            res.render("quiz", {
              Question: question,
              option1: options[0],
              option2: options[1],
              option3: options[2],
              option4: options[3],
              correct_option: arr[0].correctAnswer
            });
          }
          call++;
      });
  });
  
  app.post('/sendData', (req, res) => {
    const dataFromFrontend = req.body;
    console.log(dataFromFrontend.result);
    quizScore+=dataFromFrontend.result;
    console.log('Data received from frontend:', dataFromFrontend);
    res.send('Data received successfully!');
  });

  app.get('/score', async (req, res) => {
    console.log("Score"+" "+id)
    
    try {
        let scores = [];
        const user = await User.findOne({ email: id });
        if (user) {
            console.log(user);
            scores = user.score;
            scores.push(quizScore);
            scores.sort();
            await User.updateOne({ _id: user._id }, { $set: { score : scores } });
            res.render("score", { current_score: quizScore, highest: scores[scores.length - 1] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/dashboard",async(req,res)=>
{
  const users = await User.find({});
  console.log(users.length);
  res.render("dashboard",({users:users,users:users,users:users,users:users,high_score:100}));
})

app.use('/path/to/your/js/files', express.static('directory_containing_js_files', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript');
        }
    },
}));

//Realtime updates


app.get("/launches/upcoming", async (req, res) => {
  axios
    .get("https://lldev.thespacedevs.com/2.2.0/launch/upcoming/"
    , {
      responseType: "json",
    })
    .then(function (response) {  
      const arr = response.data.results;
      console.log(arr[0].mission.agencies[0].name);
      res.render("upcoming",({array:arr}));
    });
});


app.get("/launches/previous", async (req, res) => {
  axios
    .get("https://lldev.thespacedevs.com/2.2.0/launch/previous/"
    , {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;
      res.render("launched",({arr:arr}));
    });
});

app.get("/astronauts/space", async (req, res) => {
  axios
    .get("https://ll.thespacedevs.com/2.2.0/astronaut/?date_of_death__gte=2023-01-01"
    , {
      responseType: "json",
    })
    .then(function (response) {

      const arr = response.data.results;
      res.render("active_a",({arr:arr}));
    });
});

app.get("/astronauts/previous",(req,res)=>{
  axios
    .get("https://ll.thespacedevs.com/2.2.0/astronaut/?date_of_death__lt=2023-11-01"
    , {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data.results;
      res.render("d_astronauts",({arr:arr}));
    });
  });

  app.get("/astronauts/earth",(req,res)=>{
    axios
      .get("https://ll.thespacedevs.com/2.2.0/astronaut/?in_space=false"
      , {
        responseType: "json",
      })
      .then(function (response) {
  
        const arr = response.data.results;
        
        res.render("not_a",({array:arr}));
      });
  }
  )

  app.get("/events/upcoming",(req,res)=>{
    axios
      .get("https://lldev.thespacedevs.com/2.2.0/event/upcoming/"
      , {
        responseType: "json",
      })
      .then(function (response) {
  
        const arr = response.data.results;
        res.render("e_u",({array:arr}));
      });
  }
  )

  app.get("/events/previous",(req,res)=>{
    axios
      .get("https://lldev.thespacedevs.com/2.2.0/event/previous/"
      , {
        responseType: "json",
      })
      .then(function (response) {
  
        const arr = response.data.results;
        res.render("e_p",({array:arr}));
      });
  }
  )
  
  app.get("/news",(req,res)=>{
    axios
      .get("https://api.spaceflightnewsapi.net/v4/articles/"
      , {
        responseType: "json",
      })
      .then(function (response) {
  
        const arr = response.data.results;
        res.render("news",({array:arr}));
      });
  }
  )

    app.get("/search",(req,res)=>
    {
      res.render("search");
    })
    let query;
    app.post("/search",async(req,res)=>
    {
        query=req.body.searchQuery;
        console.log(req.body);
        res.redirect("/gallery");
    })

    app.get('/gallery', async (req, res) => {
      try {
        const apiUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
    
        const response = await axios.get(apiUrl);
    
        const imageData = response.data.collection.items;
        res.render('images', { imageData }); 
      } catch (error) {
        console.error('Error fetching ISS images:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    

app.listen(port, function() {
    console.log("Server started on port 3000");
});


app.get("/chandrayan",(req,res)=>{
  res.render("chandrayan");
}
)

app.get("/iss",(req,res)=>
{
  res.render("iss");
})

app.get("/marsrover",(req,res)=>
{
  res.render("marsrover")
})

app.get("/iss/gallery",async(req,res)=>
{
  try {
    const apiUrl = `https://images-api.nasa.gov/search?q=iss&media_type=image`;

    const response = await axios.get(apiUrl);
    const imageData = response.data.collection.items;
    res.render('issgallery', { imageData }); // Send the image data as a JSON response
  } catch (error) {
    console.error('Error fetching ISS images:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


app.get("/marsrover/gallery", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=DEMO_KEY`,
      {
        headers: {
          "x-rapidapi-host": "famous-quotes4.p.rapidapi.com",
          "x-rapidapi-key": API_KEY,
        },
        // params: {category: 'all'}
      }
    );

    console.log(response.data.photos[0]);
    res.render("marsrovergallery",({arr:response.data.photos}));
  } catch (err) {
    console.log(err);
  }
  //res.render("index",);
});
