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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'No token found' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: 'Wrong token' })
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {

  try {
    const serviceCollection = client.db("HomeChef").collection("Services");
    const reviewCollection = client.db("HomeChef").collection("Reviews");

    //token send to server
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
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
    app.get('/topservice', async (req, res) => {
      const query = {};
      const options = { sort: { _id: -1 } };
      const cursor = serviceCollection.find(query, options).limit(3);
      const Services = await cursor.toArray();
      res.send(Services)
    });

    //get a service by id
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const singleService = await serviceCollection.findOne(query);
      res.send(singleService)
    });

    //add a review
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });


    // display review by email  
    app.get('/myreviews', verifyJWT, async (req, res) => {

      const decoded = req.decoded;

      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: 'wrong user' })
      }
      let query = {}
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews)
    });

    //service id
    app.get('/reviews', async (req, res) => {
      let query = {}
      if (req.query.serviceId) {
        query = {
          serviceId: req.query.serviceId
        }
      }
      const options = { sort: { _id: -1 } };
      const cursor = reviewCollection.find(query, options);
      const reviews = await cursor.toArray();
      res.send(reviews)
    });

    //delete review
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(filter);
      res.send(result);
    });

    //get review by id
    app.get('/update/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    //update a review
    app.put('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = req.body;
      const option = { upsert: true };
      const updatedReview = {
        $set: {
          serviceName: review.name,
          msg: review.msg
        }
      }
      const result = await reviewCollection.updateOne(query, updatedReview, option);
      res.send(result);
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
