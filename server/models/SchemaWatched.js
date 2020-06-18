const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WatchedSchema = new mongoose.Schema({
    userFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    movieId : {
        type: String
    },
    movieTitle : {
        type: String
    },
    moviePost : {
        type: String
    },
    movieRunTime : {
        type: String
    }
}, { timestamps: true })


const Watched = mongoose.model('Watched', WatchedSchema);

module.exports = { Watched }
