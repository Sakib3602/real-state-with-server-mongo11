
const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 4000

app.use(cors(
    ['http://localhost:5173','http://localhost:5174']
))
app.use(express.json())
require('dotenv').config()
// process.env.............
// .env


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://booking_wesite_assingment_11:yqfgXJVB04Cd0oUH@cluster0.b5jufhp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("bookingdb").collection("rooms");

    // get data for home card
    app.get('/homeCard', async (req, res) => {
      const sort = req.query.sort;
      let options = {}
      if(sort) options = {sort : { PricePerNight : sort === 'des' ?  1 : -1}}
      // console.log(sort)
        const cursor = await database.find(options).toArray();
        // console.log(cursor)
        res.send(cursor);
    });
    // update the with the patch 
    app.patch('/update/:id' , async(req,res)=>{
      const id = req.params.id;
      const {Availability} = req.body;
      console.log(id,Availability)
      const query = { _id : new ObjectId(id)}
      const updateDoc = {
            $set : {Availability},
      }
      const result = await database.updateOne(query,updateDoc)
      res.send(result)

    })

    // find one data for deatils page


    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const room = await database.findOne(query);
      res.send(room);
  });









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})