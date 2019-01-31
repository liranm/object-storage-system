# Object Storage System

implementation of an object storage system like Amazon S3

## Getting Started

To run this application, you'll need [Node.js](https://nodejs.org/en/download/) and [MongoDB](https://www.mongodb.com/download-center/community) installed on your computer.


You can quickly install and run mongoDB server using [Docker](https://docs.docker.com/install/):
```
$ docker run --name some-mongo -d -p 27017:27017 mongo:4.0.5
``` 

When having running mongoDB server on default port 27017:

```
# Clone this repository
$ git clone https://github.com/liranm/object-storage-system

# Go into the server app
$ cd object-storage-system/server

# Install dependencies
$ npm install

# Run the server app
$ npm start

# Go into the client app
$ cd object-storage-system/client

# Install dependencies
$ npm install

# Run the client app
$ npm start
```

## Upload file

Open in browser http://localhost:8000.

Or

Use cURL to send POST request to http://localhost:3000. For example:

To upload ./testfile.txt from your computer,  
to the url /myfiles/testfile.txt,  
with owner id qAzef32F,  
in public mode.
```
$  curl -F 'file_path=@testfile.txt' -F 'public_url=/myfiles/testfile.txt' -F 'owner=qAzef32F' -F 'mode=public' http://localhost:3000/
```

## Download file

Open in browser uploaded file url. for example:  
http://localhost:3000/myfiles/testfile.txt

Or

use cURL to send GET request to http://localhost:3000. for example:  
```
$ curl http://localhost:3000/myfiles/testfile.txt
```

## Show metadata

Open in browser uploaded file url with ?metadata=true. for example:  
http://localhost:3000/myfiles/testfile.txt?metadata=true

Or

use cURL to send GET request to http://localhost:3000?metadata=true. for example:  
```
$ curl http://localhost:3000/myfiles/testfile.txt?metadata=true
```

## Modify file

use cURL to send PUT request to http://localhost:3000/modify. for example:   
To modify file in url /myfiles/testfile.txt,  
with owner id qAzef32F,  
to private mode.

```
$ curl -X PUT -H "X-AUTH: qAzef32F" -d "filename=/myfiles/testfile.txt&mode=private" http://localhost:3000/modify
```

## Delete file

use cURL to send DELETE request to http://localhost:3000/delete. for example:   
To delete file in url /myfiles/testfile.txt,  
with owner id qAzef32F.

```
$ curl -X DELETE -H "X-AUTH: qAzef32F" -d "filename=/myfiles/testfile.txt" http://localhost:3000/delete
```
