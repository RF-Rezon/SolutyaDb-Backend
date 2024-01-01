const express = require("express");

const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.iwkuovz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const SolutyaJobs = client.db("Solutya").collection("addnewjob");
  const SolutyaRoles = client.db("Solutya").collection("roles");

    app.post("/users/reg", async (req, res) => {
      const user = req.body;

      const query = { email: user?.email };
      const existingUser = await SolutyaRoles.findOne(query);

      if (existingUser) {
        return res.status(500).send({ message: "user already exists on the database." });
      }

      const result = await SolutyaRoles.insertOne(user);
      res.send(result);
    });

    app.post("/users/log", async (req, res) => {
      const user = req.body;

      const query = { email: user?.email };
      const existingUser = await SolutyaRoles.findOne(query);
      
      if (existingUser.role !== "admin" || existingUser.role !== "hr"){
        return res.status(500).send({ message: "Only accessable for The Admin and the Hrs." });
      }

      const result = await SolutyaRoles.insertOne(user);
      res.send(result);
    });


    app.get("/users", async (req, res) => {
      const cursor = await SolutyaRoles.find().toArray();
      res.send(cursor);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await SolutyaRoles.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

   
    app.get("/users/hr/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await SolutyaRoles.findOne(query);
      const result = { hr: user?.role === "hr" };
      res.send(result);
    });

    app.post("/newAddedJob", async (req, res) => {
      const newclass = req.body;
      const cursor = await SolutyaJobs.insertOne(newclass);
      res.send(cursor);
    });

    app.get("/newAddedJob", async (req, res) => {
      const query = await SolutyaJobs.find().toArray();
      res.send(query);
    });

    app.get("/newAddedJob/:email", async (req, res) => {
      const getEmail = req.params.email;
      const queryMail = { hr_email: getEmail };
      const query = await SolutyaJobs.find(queryMail).toArray();
      res.send(query);
    });

    app.patch("/newAddedJob/approve/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateStatus = {
        $set: {
          status: "approved",
        },
      };

      const result = await SolutyaJobs.updateOne(filter, updateStatus);
      res.send(result);
    });

    app.delete("/newAddedJob/deny/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await SolutyaJobs.deleteOne(filter);
      res.send(result);
    });

    app.patch("/newAddedJob/makeHr/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const makeHr = {
        $set: {
          role: "hr",
        },
      };

      const result = await SolutyaRoles.updateOne(filter, makeHr);
      res.send(result);
    });

    app.delete("/firedHr/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await SolutyaRoles.deleteOne(query);
      
      res.send(result);
    });

    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
