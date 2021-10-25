const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middlewire
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.da9dr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('DB Connected');
        const database = client.db('onlineShop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        //get products api
        app.get('/products', async (req, res) => {
            console.log(req.query);
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = req.query.size;
            let products;
            const count = await cursor.count();
            if (page) {
                products = await cursor.skip(page * size).limit(parseInt(size)).toArray();
            }
            else {
                products = await cursor.toArray();
            }


            res.send({
                products,
                count
            });
        });
        //use post to get data by keys
        app.post('/products/byKeys', async (req, res) => {
            console.log(req.body);
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productCollection.find(query).toArray();

            res.send(products);
        });
        //add orders api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('orders: ', order);
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });
    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("ema John server is Running");
});

app.listen(port, () => {
    console.log('Server running at port: ', port);
})