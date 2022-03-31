const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://moonseokho:fkrm5623@cluster0.l8v2x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected...")
}).catch( err => {
    console.log(err);
})




app.get('/', (req, res) => res.send("Hello World!!"));

app.listen(port, () => console.log (`Example app listening on port ${port}!`));