const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l8f7h.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()


app.use(bodyParser.json());
app.use(cors());




var serviceAccount = require("./configs/volunteer-network-client-5547a-firebase-adminsdk-4p1dt-0165e304d0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});






const port = 5000;

app.get('/', (req, res) => {
    res.send("Thanks calling me")
})


const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => {
  const eventsCollection = client.db("volunteerNetworkClientStore").collection("products");
  const registersCollection = client.db("volunteerNetworkClientStore").collection("registers");
  
  
  
  app.post("/addEvent",(req,res) =>{
    const events = req.body; 
    eventsCollection.insertOne(events)
    .then(result =>{
        console.log(result.insertedCount);
        res.send(result.insertedCount > 0)
    })
  })
  
  app.get('/events',(req, res) =>{
    eventsCollection.find({})
    .toArray( (err,documents) =>{
        res.send(documents);
    })
})
  
  app.post("/addRegisters",(req,res) =>{
    const registers = req.body; 
    registersCollection.insertOne(registers)
    .then(result =>{
        res.send(result.insertedCount > 0)
    })
  })


  app.get('/alluser', (req, res) => {
    registersCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
})


app.delete('/delete/:id', (req, res) => {
    // console.log(req.params.id);
    registersCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then((result) => {
        console.log(result);
        res.send(result)
    })
})


  app.get('/registrations',(req, res) => {
    const bearer = req.headers.authorization;
    if( bearer && bearer.startsWith('Bearer ')){
        const idToken =bearer.split(' ')[1];
        // console.log({idToken});
        admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
            const tokenEmail = decodedToken.email;
            const queryEmail = req.query.email;
            // console.log(tokenEmail, queryEmail)
            if(tokenEmail == queryEmail){
              registersCollection.find({email: queryEmail})
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            }
            }).catch(function(error) {
            // Handle error
            });
    }

})

});


app.listen(process.env.PORT || port)