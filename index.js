const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.70ddixo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(uri)
async function run(){

  try{
    const collection = client.db("HomeChef").collection("Services");
 
 
 
  }
  finally{

  }
}
run()
.catch(err => console.log(err))


app.get('/', (req, res)=>{
  res.send('running')
})
app.listen(port, ()=>{
  console.log('start')
})
