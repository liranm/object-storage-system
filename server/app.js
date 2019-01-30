const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const uniqid = require('uniqid');
const bodyParser = require('body-parser');
const cors = require('cors');

const upload = multer({ dest: 'uploads/' })

const File = require('./models/File');

const db_url = 'mongodb://localhost/files';

mongoose.connect(db_url, {
    useNewUrlParser: true,
    useCreateIndex: true
});

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.delete('/delete', async (req, res) => {
    if(!req.body.filename) {
        return res.status(400).send('Missing required data.');
    }

    const { filename } = req.body;
    const fileDoc = await File.findOne({ $or: [ { private_url: filename }, { public_url: filename } ] });

    if(!fileDoc) {
        return res.status(404).send('File not found.');
    }

    if(req.header('X-AUTH') !== fileDoc.owner) {
        return res.status(401).send('Authentication failed.');
    }

    if(fileDoc.removedAt) {
        return res.status(200).send(`File has already been deleted.`);
    }

    fileDoc.set({ removedAt: new Date() });

    await fileDoc.save();

    return res.status(200).send(`File deleted successfully.`);
});

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

            if(fileDoc.removedAt) {
                return res.status(404).send('File not found.');
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
    const { owner, mode, public_url } = req.body;
    if(!owner || !mode || !public_url) {
        return res.status(400).send('Missing required data.');
    }

    const fileDoc = await File.findOne({ public_url });
    
    if(!fileDoc) {
        const db = await mongoose.connection.db;
        const gridFSBucket = new mongoose.mongo.GridFSBucket(db);
        const private_url = `/${uniqid()}`;

        return fs.createReadStream(req.file.path)
            .pipe(gridFSBucket.openUploadStream(private_url))
            .on('finish', async () => {
                await File.create({
                    owner,
                    mode,
                    public_url,
                    private_url,
                    size: req.file.size
                });

                res.status(200).send('Upload complete.');
            });
    }
    
    if(owner !== fileDoc.owner) {
        return res.status(403).send('File path already exists. Please choose another.');
    }

    const db = await mongoose.connection.db;
    const gridFSBucket = new mongoose.mongo.GridFSBucket(db);
    const oldFile = await gridFSBucket.find({ filename: fileDoc.private_url }).next();
    await gridFSBucket.delete(oldFile._id);

    return fs.createReadStream(req.file.path)
    .   pipe(gridFSBucket.openUploadStream(fileDoc.private_url))
        .on('finish', async () => {
            fileDoc.set({ size: req.file.size });
            await fileDoc.save();    
            res.status(200).send('Overwrite complete.');
        }); 
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

    if(fileDoc.removedAt) {
        return res.status(404).send('File not found.');
    }

    const db = await mongoose.connection.db;
    const gridFSBucket = new mongoose.mongo.GridFSBucket(db);

    gridFSBucket.openDownloadStreamByName(fileDoc.private_url).pipe(res);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

