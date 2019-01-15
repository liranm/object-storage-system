const express = require('express');
const mongoose = require('mongoose');

const File = require('./models/File');

const db_url = 'mongodb://localhost/files';

mongoose.connect(db_url, { useNewUrlParser: true });

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    const filesCount = await File.countDocuments();
    
    res.send(`Total Files: ${filesCount}`);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

