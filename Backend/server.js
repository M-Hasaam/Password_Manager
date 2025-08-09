const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require('cors');

dotenv.config();

const app = express()
const port = process.env.PORT || 3000

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGO_URL)

client.connect().then(() => {

    console.log(`\n Connected to Mongo ${process.env.MONGO_URL}\n`)

    const db = client.db(process.env.DATABASE)
    const collection = db.collection(process.env.COLLECTION)

    // getting data
    app.get('/passwords', async (req, res) => {

        const allPasswords = await collection.find({}).toArray();
        res.json(allPasswords)

    })

    // collection.insertMany([
    //     { username: "Hasaam", site: "hasaam@example.com", password: 111111122, id: "some-unique-id-1" },
    //     { username: "Ali", site: "ali@example.com", password: 1111125, id: "some-unique-id-2" },
    //     { username: "Sara", site: "sara@example.com", password: 1111128, id: "some-unique-id-3" }
    // ])

    // inserting data
    app.post('/passwords', async (req, res) => {

        const newPassword = req.body
        const result = await collection.insertOne(newPassword);
        res.json({ success: true, insertedId: result.insertedId })

    })

    // deleting data
    app.delete('/passwords', async (req, res) => {
        const filter = req.body;

        // If _id is provided as string, convert it to ObjectId
        if (filter._id) {
            filter._id = new ObjectId(filter._id);
        }

        const result = await collection.deleteOne(filter);

        res.json({ success: result.deletedCount > 0 });
    });


    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.listen(port, () => {
        console.log(`\n Example app listening on  http://localhost:${port}`)
    })

})

