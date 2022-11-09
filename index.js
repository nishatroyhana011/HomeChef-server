const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.70ddixo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {
    const serviceCollection = client.db("HomeChef").collection("Services");

    //token send to server
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
      res.send({ token })
    });

    //post req for service
    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    //get all service
    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const Services = await cursor.toArray();
      res.send(Services)
    });

    //get 3 service in home
    //const selectedService = await cursor.skip(page*size).limit(size).toArray();
    app.get('/topservice', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const Services = await cursor.toArray();
      res.send(Services)
    });

    //get a service by id
    app.get('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const singleService = await serviceCollection.findOne(query);
      res.send(singleService)
  });

  }
  finally {

  }
}
run()
  .catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('running')
})
app.listen(port, () => {
  console.log('start')
})
