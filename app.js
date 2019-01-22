const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const uniqid = require('uniqid');
const bodyParser = require('body-parser');

const upload = multer({ dest: 'uploads/' })

const File = require('./models/File');

const db_url = 'mongodb://localhost/files';

mongoose.connect(db_url, {
    useNewUrlParser: true,
    useCreateIndex: true
});

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.put('/modify', async (req, res) => {
    if(!req.body.mode || !req.body.filename) {
        return res.status(400).send('Missing required data.');
    }

    switch(req.body.mode) {
        case 'public':
        case 'private':
            const { filename, mode } = req.body;
            const fileDoc = await File.findOne({ $or: [ { private_url: filename }, { public_url: filename } ] });

            if(!fileDoc) {
                return res.status(404).send('File not found.');
            }

            if(req.header('X-AUTH') !== fileDoc.owner) {
                return res.status(401).send('Authentication failed.');
            }

            if(mode === fileDoc.mode) {
                return res.status(200).send(`Mode is already ${mode}`);
            }

            fileDoc.set({ mode });

            await fileDoc.save();

            return res.status(200).send(`Mode updated to ${mode}`);
        default:
            return res.status(400).send('Invalid mode.');
    }
});

app.post('/', upload.single('file_path') , async (req, res) => {
    const db = await mongoose.connection.db;
    const gridFSBucket = new mongoose.mongo.GridFSBucket(db);
    const privateUrl = `/${uniqid()}`;

    fs.createReadStream(req.file.path)
        .pipe(gridFSBucket.openUploadStream(privateUrl))
        .on('finish', async () => {
            await File.create({
                owner: req.body.owner,
                mode: req.body.mode,
                private_url: privateUrl,
                public_url: req.body.public_url,
                size: req.file.size
            });
        });

    console.log(req.file);
    res.json(req.file);
});

app.get(':filename(*)', async (req, res) => {
    const { filename } = req.params;

    const fileDoc = await File.findOne({ $or: [ { private_url: filename }, { public_url: filename } ] });

    if(!fileDoc) {
        return res.status(404).send('File not found.');
    }

    if(fileDoc.mode === 'private' && req.header('X-AUTH') !== fileDoc.owner) {
        return res.status(403).send('Access denied - Private file.');
    }

    if(req.query.metadata) {
        const { public_url, size, updatedAt, removedAt } = fileDoc;

        return res.json({ public_url, size, updatedAt, removedAt });
    }

    const db = await mongoose.connection.db;
    const gridFSBucket = new mongoose.mongo.GridFSBucket(db);

    gridFSBucket.openDownloadStreamByName(fileDoc.private_url).pipe(res);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

