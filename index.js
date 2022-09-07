const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongodb = require("mongodb");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {v4:uuidv4}=require("uuid")
const KEY = process.env.KEY;
const stripe = require('stripe')(KEY);
const mongoClient = mongodb.MongoClient;

const URL = process.env.DB;
const SECRET = process.env.SECRET;

//const URL ="mongodb+srv://PRAKASH7708:<>@cluster0.2n5s99z.mongodb.net/?retryWrites=true&w=majority";
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

let authenticate = function (req, res, next) {
  //console.log(req.headers.authorization)
  
 if(req.headers.authorization) {
   try {
    let verify = jwt.verify(req.headers.authorization, SECRET);
    if(verify) {
      req.userid = verify._id;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized1" });
    }
   } catch (error) {
    res.json({ message: "🔒Please Login to Continue" });
   }
  } else {
    res.status(401).json({ message: "Unauthorized3" });
  }
};

app.post("/Createproduct", async function (req, res) {
  //console.log(req.body)
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("E-Commerse");
    await db.collection("E-com").insertOne(req.body);
    await connection.close();
    res.json({
      message: "Product Added sucessfully",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/getallproducts", async function (req, res) {
  //console.log(req.params.id)
  try {
    const connection = await mongoClient.connect(URL);

    const db = connection.db("E-Commerse");
    let products = await db
      .collection("E-com")
      .find({ allproducts: true })
      .toArray();
    await connection.close();
    // console.log(products)
    res.json(products);
  } catch (error) {
    console.log(error);
  }
});

app.get("/products/:id", async function (req, res) {
  //console.log(req.params.id)
  try {
    const connection = await mongoClient.connect(URL);

    const db = connection.db("E-Commerse");
    let products = await db
      .collection("E-com")
      .find({ categories: `${req.params.id}`})
      .toArray();
    await connection.close();
    //console.log(products)
    res.json(products);
  } catch (error) {
    console.log(error);
  }
});

app.get("/redmi", async function (req, res) {
  //console.log(req.params.id)
  try {
    const connection = await mongoClient.connect(URL);

    const db = connection.db("E-Commerse");
    let products = await db
      .collection("E-com")
      .aggregate([{ $match: { productname: "Redmi" } }])
      .toArray();
    await connection.close();
    //console.log(products)
    res.json(products);
  } catch (error) {
    console.log(error);
  }
});

app.get("/samsung", async function (req, res) {
  //console.log(req.params.id)
  try {
    const connection = await mongoClient.connect(URL);

    const db = connection.db("E-Commerse");
    let products = await db
      .collection("E-com")
      .aggregate([{ $match: { productname: "Samsung C2" } }])
      .toArray();
    await connection.close();
    //console.log(products)
    res.json(products);
  } catch (error) {
    console.log(error);
  }
});

app.post("/register", async function (req, res) {
  try {
    const connection = await mongoClient.connect(URL);

    const db = connection.db("E-Commerse");

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    req.body.password = hash;
    await db.collection("users").insertOne(req.body);
    await connection.close();

    res.json({
      message: "Successfully Registered",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error",
    });
  }
});

app.post("/login", async function (req, res) {
  try {
    // Open the Connection
    const connection = await mongoClient.connect(URL);

    // Select the DB
    const db = connection.db("E-Commerse");

    // Select the Collection
    const user = await db
      .collection("users")
      .findOne({ username: req.body.username });

    if (user) {
      const match = await bcryptjs.compare(req.body.password, user.password);
      if (match) {
        // Token
        // const token = jwt.sign({ _id: user._id }, SECRET, { expiresIn: "1m" });
        const token = jwt.sign({ _id: user._id }, SECRET);
        res.status(200).json({
          message: "Successfully Logged In",
          token,
        });
      } else {
        res.json({
          message: "Password is incorrect",
        });
      }
    } else {
      res.json({
        message: "User not found Please sign in",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//addtocart

app.post("/createcart",authenticate,async function (req, res) {
  //console.log(req.headers.data.productname)
   //req.body.userid = mongodb.ObjectId(req.userid);
   //console.log(req.body)
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("E-Commerse");
    req.body.userid = mongodb.ObjectId(req.userid);
    delete req.body._id
    await db.collection("carts").insertOne(req.body);
    await connection.close();
    res.json({
      message: "Product added to cart",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/cartitems",authenticate,async function (req, res) {
 //console.log(req.userid)
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("E-Commerse");
   let carts= await db.collection("carts").find({userid:mongodb.ObjectId(`${req.userid}`)}).toArray();

    await connection.close();
    //console.log(carts)
    res.json(carts)
    res.json({
      message: " Your Carts itmes",
    });
    
  } catch (error) {
    console.log(error);
  }
});

//deletecart
app.post("/deletecart",authenticate,async function (req, res) {
  // console.log(req.body._id)
  // console.log(req.userid)
  
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("E-Commerse");
   let removecart= await db.collection("carts").deleteOne({_id:mongodb.ObjectId(`${req.body._id}`)});
    await connection.close();
    res.json({
      message: "Delete from cart",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/orderOneitem/:id",authenticate,async function (req, res) {
   //console.log(req.params.id)
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("E-Commerse");
   let buy= await db.collection("E-com").findOne({_id:mongodb.ObjectId(`${req.params.id}`)});
    await connection.close();
    //console.log(buy)
    res.json(buy);
  } catch (error) {
    console.log(error);
  }
});
 
app.post("/payment",authenticate,async function (req, res) {
  console.log(req.body)
  //console.log(req.body.token)
 try {
   const connection = await mongoClient.connect(URL);
   const db = connection.db("E-Commerse");

   req.body.userid = mongodb.ObjectId(req.userid);
   //delete req.body._id 
   let buy= await db.collection("orders").insertOne(req.body);
   
   await connection.close();

//    const transactionKey=uuidv4();
//  const customer= stripe.customers.create({
//     email:req.body.token.email,
//     source:req.body.token.id})

//    const result= await stripe.charges.create({
//       amount:req.body.price,
//       currency:"inr",
//       customer:customer,
//       receipt_email:req.body.token.email,
//       description:req.body.productname})
//    console.log(result)
   res.json({
    message: "Order Placed Successfully",
  });
 } catch (error) {
   console.log(error);
 }
});

//  app.post("/payment",function (req, res) {
//   const {product,token}=req.body
//     const transactionKey=uuidv4();
//    return stripe.customers.create({
//     email:token.email,
//     source:token.id
//    }).then((customer)=>{
//     stripe.charges.create({
//       amount:product.price,
//       currency:"inr",
//       customer:customer,
//       receipt_email:token.email,
//       description:req.body.productname
//     }).then((result)=>{
//       res.json(result)
//     }).catch((err)=>{
//         console.log(err)
//     })
//  })

app.post("/cartPayment",authenticate,async function (req, res) {
  
  //req.body.userid=req.userid
   console.log(req.body)
  // console.log(req.userid)
  //console.log(req.headers.total)
 try {
   const connection = await mongoClient.connect(URL);
   const db = connection.db("E-Commerse");
   req.body.userid = mongodb.ObjectId(req.userid);
   let buy= await db.collection("orders").insertOne(req.body);
   await connection.close();
   res.json({
    message: "Order Placed Successfully",
  });
 } catch (error) {
   console.log(error);
 }
});

app.get("/Orders",authenticate,async function (req,res){
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("E-Commerse");
   let orders= await db.collection("orders").find({userid:mongodb.ObjectId(`${req.userid}`)}).toArray();
    await connection.close();
    //console.log(carts)
    res.json(orders)
    res.json({
      message: "Your Orders",
    });
  } catch (error) {
    console.log(error);
  }
})

app.get("/ordersAdmin",async function (req,res){
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("E-Commerse");
   let orders= await db.collection("orders").find({}).toArray();
    await connection.close();
    //console.log(carts)
    res.json(orders)
    res.json({
      message: "Your Orders",
    });
  } catch (error) {
    console.log(error);
  }
})

app.put("/Placeorder/:id",async function (req,res){
  console.log(req.params.id)

  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("E-Commerse");
    await db.collection("orders").updateOne({_id:mongodb.ObjectId(`${req.params.id}`)},{$set:{allproducts:true}})
    await connection.close();
    //console.log(carts)
    //res.json(orders)
    res.json({
      message: "Order Placed",
    });
  } catch (error) {
    console.log(error);
  }
})
app.listen(process.env.PORT || 3001);
