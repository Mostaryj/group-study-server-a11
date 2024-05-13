const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;



//middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://group-study-a15f6.web.app',
    'https://group-study-a15f6.firebaseapp.com'
   
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

console.log(process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kc8fcbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



const cookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const studyCollection = client.db("studyDB").collection("study");
    const submitCollection = client.db("studyDB").collection("submit")


    //auth related api
app.post('/jwt',  async(req,res) => {
  const user = req.body;
  console.log('user for token:',user, req.cookies.token);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})

  res
   .cookie('token', token, cookieOption)
   .send({success: true});
})



// //log out
// app.post('/logout', async(req, res) => {
//   const user = req.body;
//   console.log(10,'logging out',user);
//   res.clearCookie('token from logOut',{...cookieOption, maxAge: 0}).send({success: true});
// })


//server related

 //create assignment
 app.get("/study", async (req, res) => {
  const cursor = studyCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});


app.post("/study", async (req, res) => {
  const study = req.body;
  console.log(study);
  const result = await studyCollection.insertOne(study);
  res.send(result);
});

//all assignment
app.get('/study-email/:email', async (req, res) => {
   const query = { email: req.params.email }
  const cursor =studyCollection.find(query)
  const data = await cursor.toArray()
  res.send(data)
});



 // update

 app.get("/study/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Received ID:", id); 

  const query = { _id: new ObjectId(id) };
  const result = await studyCollection.findOne(query);
  res.send(result);
});


//update put
app.put("/study/:id", async (req, res) => {
const id = req.params.id;
const filter = { _id: new ObjectId(id) };
const options = { upsert: true };
const updatedAssignment = req.body;
const assignment = {
$set: {
  photo: updatedAssignment.photo,
  title: updatedAssignment.title,
  marks: updatedAssignment.marks,
  description: updatedAssignment.description,
  level: updatedAssignment.level,
  date: updatedAssignment.date,

},
};
const result = await studyCollection.updateOne(filter, assignment, options);
res.send(result);

});


 // delete
 app.delete('/study/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}; 
  const result = await studyCollection.deleteOne(query);
  res.send(result);
})



//pdf

app.get("/submit", async (req, res) => {
  const cursor = submitCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});


app.post("/submit", async (req, res) => {
  const study = req.body;
  console.log(study);
  const result = await submitCollection.insertOne(study);
  res.send(result);
});




//submit 
app.get("/submit/:id", async (req, res) => {
  const id = req.params.id;
  const query = { email: new ObjectId(id) };
  const result = await submitCollection.findOne(query);
  res.send(result);
});


app.get('/submit-email/:email', async (req, res) => {
  const query = { email: req.params.email }
  const cursor =submitCollection.find(query)
  const data = await cursor.toArray()
  res.send(data)
});








    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req,res) => {
    res.send('group-study is running')
})

app.listen(port, () => {
    console.log(`group study server is running on port ${port}`)
})

