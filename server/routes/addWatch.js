const express = require('express');
const { Watched } = require("../models/SchemaWatched");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/addWatchedMovie", auth, (req, res) => {
    Watched.find({
        $and: [{ "userFrom": req.user._id }, { "movieId": req.body.postId }]
    }, (err, result) => {
        if (err) return (res.status(400).send(err));
        else if (result.length === 0) {
            let info = {
                userFrom: req.user._id,
                movieId: req.body.postId,
                movieTitle: req.body.MovieTitle,
                moviePost: req.body.MoviePoster_path,
                movieRunTime: req.body.MovieRunTime
            };
            const watched = new Watched(info);

            watched.save((err, watched) => {
                if (err) return (res.json({ success: false, err }));
                else {
                    return (res.status(200).json({ success: true }));
                }
            });
        }
    });
});

router.post("/getWatchedMovie", auth, (req, res) => {
    Watched.find({ "userFrom": req.user._id })
        .exec((err, watched_movie) => {
            if (err) return (res.status(400).send(err));
            return (res.status(200).json({ success: true, watched_movie }));
        });
});

router.post('/watchedIcon', auth, (req, res) => {

    Watched.find({
        $and: [{ "movieId": req.body.movieId },
        { "userFrom": req.user._id }]
    })
        .exec((err, watched) => {
            if (err) return res.status(400).send(err)

            let result = false;
            if (watched.length !== 0) {
                result = true
            }

            res.status(200).json({ success: true, watched: result })
        })

});



module.exports = router;
