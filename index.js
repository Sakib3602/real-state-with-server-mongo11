const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://cozi-1.netlify.app"],
    credentials: true,
  })
);

app.use(express.json());
require("dotenv").config();
// process.env.............
// .env
console.log(process.env.S3_BUCKET);
console.log(process.env.SECRET_KEY);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = `mongodb+srv://booking_wesite_assingment_11:yqfgXJVB04Cd0oUH@cluster0.b5jufhp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.b5jufhp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("bookingdb").collection("rooms");
    const databaseReview = client.db("bookingdb").collection("reviews");
    const databaseBookings = client.db("bookingdb").collection("bookings");

    // get data for home card
    app.get("/homeCard", async (req, res) => {
      const sort = req.query.PricePerNight;
      console.log(req.query,"scs")
      let options = {};
      if (sort)
        options = { PricePerNight:  sort === "des" ? 1 : -1  };
      // console.log(sort)
      const cursor = await database.find().sort(options).toArray();
      // console.log(cursor)
      res.send(cursor);
    });


    // update the with the p

    // try new thing
    app.patch("/update/:RoomDescription", async (req, res) => {
      const id = req.params.RoomDescription;
      const { Availability } = req.body;
      // console.log(id,Availability)
      const query = { RoomDescription: id };
      const updateDoc = {
        $set: { Availability },
      };
      const result = await database.updateOne(query, updateDoc);
      res.send(result);
    });
    // insertItemsAfterBooking
    app.post("/insertItemsAfterBooking", async (req, res) => {
      const doc = req.body;
      const result = await databaseBookings.insertOne(doc);
      res.send(result);
    });
    // find
    app.get("/insertItemsAfterBookings", async (req, res) => {
      // console.log(req.query.email)
      const query = { email: req.query?.email };
      const cursor = await databaseBookings.find(query).toArray();
      res.send(cursor);
    });

    // delete data
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await databaseBookings.deleteOne(query);
      res.send(result);
    });

    // find one data for deatils page

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const room = await database.findOne(query);
      res.send(room);
    });

    // update from bookings date
    app.put("/updateDate/:RoomDescription", async (req, res) => {
      const id = req.params.RoomDescription;
      const { From, To } = req.body;
      console.log(id, From, To);
      const query = { RoomDescription: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: { From, To },
      };

      const result = await databaseBookings.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    // review start

    app.post("/reviewAll", async (req, res) => {
      const doc = req.body;
      const result = await databaseReview.insertOne(doc);
      res.send(result);
    });

    // review specific

    app.get("/reviewSpecific", async (req, res) => {
      console.log(req.query, "oooo");
      const query = {}
      if(req.query.name){
        const query = { name: req.query?.name };
      }
     
      const cursor = await databaseReview.find(query).toArray();
      res.send(cursor);
    });

    // jwt
    // app.post('/jwt', async(req,res)=>{
    //   const user = req.body


    //   console.log(user)
    //   res.send(user)
    // })

    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
