const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const upload = multer();

const File = require('./models/File');

const db_url = 'mongodb://localhost/files';

mongoose.connect(db_url, { useNewUrlParser: true });

const app = express();
const port = 3000;

app.post('/', upload.single('file_path') , async (req, res) => {
    console.log(req.file);
    res.json(req.file);
});

app.get('/', async (req, res) => {
    const filesCount = await File.countDocuments();
    
    res.send(`Total Files: ${filesCount}`);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

