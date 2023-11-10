const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000 ;



app.use(express.json());
app.use(cors({
  origin: [
    'https://real-project-a7958.web.app',
    'https://real-project-a7958.firebaseapp.com'
  ],
  credentials:true
}));
app.use(cookieParser());





const uri = `mongodb+srv://${process.env.Real_user}:${process.env.Real_pass}@cluster0.ubtwufv.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = (req, res, next) =>{
  console.log('log: info', req.method, req.url);
  next();
}

const verifyToken = (req, res, next) =>{
  const token = req?.cookies?.token;

  if(!token){
      return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
      if(err){
          return res.status(401).send({message: 'unauthorized access'})
      }
      req.user = decoded;
      next();
  })
}





async function run() {
    try {
      // await client.connect();
      console.log("Connected to MongoDB!");
  
      const projectCollection = client.db('projectDB').collection('realOne');
      const serviceCollection = client.db('serviceDB').collection('serviceAll');



      app.post('/jwt', logger,(req, res) => {
        const user = req.body;
        console.log(user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        console.log(token);
        res.send({ token });
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
      })
          .send({ success: true });
  })



  app.post('/logout', async (req, res) => {
    const user = req.body;
    console.log('logging out', user);
    res.clearCookie('token', { maxAge: 0 }).send({ success: true })
})



   app.get('/service', async (req,res) =>{
     try {
          const cursor = serviceCollection.find();
          const result = await cursor.toArray();
          res.json(result);
        } catch (error) {
          console.error("Error fetching data:", error);
          res.status(500).json({ error: "Error fetching data" });
        }
   })




  
      app.get('/project', async (req, res) => {
        try {
          const cursor = projectCollection.find();
          const result = await cursor.toArray();
          res.json(result);
        } catch (error) {
          console.error("Error fetching data:", error);
          res.status(500).json({ error: "Error fetching data" });
        }
      });


      app.get('/service', logger, verifyToken, async (req, res) => {
        console.log(req.query.email);
        console.log('token owner info', req.user)
        if(req.user.email !== req.query.email){
            return res.status(403).send({message: 'forbidden access'})
        }
        let query = {};
        if (req.query?.email) {
            query = { email: req.query.email }
        }
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
    })



  
      // await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    } finally {
      // Ensure that the client will close when you finish/error
    //   await client.close();
    }
  }
  
  run().catch(console.dir);
  









app.get('/', (req,res)=>{
res.send('the server is running at 5000')

})

app.listen(port, () =>{
    console.log(`the server is running ${port}`)
})