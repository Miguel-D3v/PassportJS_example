 import express from "express";
 import bcrypt from "bcryptjs";
 import initializePassport from "./passport.config.js";
 import passport from "passport";
 import flash from "express-flash";
 import session from "express-session";
 import dotenv from "dotenv/config.js";
 import methodOverride from "method-override";
 const app = express();

 initializePassport(
  passport ,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
  )

  const users = [] // fake database

  app.set('view-engine','ejs');
  app.use(express.urlencoded({extended : false }));
  app.use(flash())
  app.use(session({
     secret : process.env.SECRET,
     resave : false,
     saveUninitialized : false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))


  app.get("/",checkAuthenticated,(req,res)=>{
    res.render("index.ejs",{name : req.user.name});
  })
  app.get("/login",checkNotAuthenticated,(req,res)=>{
    res.render("login.ejs");
  })
  app.get("/register",checkNotAuthenticated,(req,res)=>{
    res.render("register.ejs");
  })


  app.post("/login",checkNotAuthenticated,passport.authenticate('local',{
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
  }))

  app.post("/register",checkNotAuthenticated,async(req,res)=>{
    try{
       const hashedPassword = await bcrypt.hash(req.body.password , 10);
       users.push({
         id:Date.now().toString(),
         name: req.body.name,
         email: req.body.email,
         password: hashedPassword
        })
      res.redirect("/login")
    }catch{
      res.redirect("/register")
     }
    console.log(users)
  });

   app.delete('/logout',(req,res,next) =>{
    req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
  })

 // Middleware
  function  checkAuthenticated(req,res,next){
    if (req.isAuthenticated()){
    return   next()
   }
    res.redirect('/login')
  }


  function checkNotAuthenticated(req,res,next){
    if (req.isAuthenticated()){
    return  res.redirect('/')
    }
      next()
  }


 app.listen(3000)
