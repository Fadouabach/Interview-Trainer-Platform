import mongoose from 'mongoose';

const localUri = 'mongodb://127.0.0.1:27017/fadouadb';

mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log("SUCCESS: Connected to Local MongoDB");
        process.exit(0);
    })
    .catch(err => {
        console.log("FAIL: Could not connect to Local MongoDB");
        process.exit(1);
    });
