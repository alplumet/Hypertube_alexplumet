import React, { useEffect, useState } from 'react'
import { message, Typography } from 'antd';
import { Row } from 'antd';
import useStyles from './style';
import axios from 'axios';
import Comments from './Sections/Comments'
import LikeDislikes from './Sections/LikeDislikes';
import { API_URL, API_KEY } from '../../Config'
import GridCards from '../../commons/GridCards';
import MovieInfo from './Sections/MovieInfo';
import Spinner from '../LandingPage/Sections/Spinner';
import RecommendedMovies from './Sections/Recommended';
import SimilarMovies from './Sections/Similar';
import { createFromIconfontCN, CoffeeOutlined, PlayCircleTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ReactPlayer from "react-player";
import { useSelector } from 'react-redux';
import GetMovieSources from '../../../_actions/user_actions.js'
import SimpleDialog from './Sections/SimpleDialog'
import {
    Container,
    Grid,
    Button,
} from '@material-ui/core';

const port = `5000`
const io = require('socket.io-client');
const socket = io(`http://localhost:${process.env.REACT_APP_SOCKET_PORT}`)


function MovieDetailPage(props) {
    const classes = useStyles();
    const { t } = useTranslation();
    const CurrentLanguage = localStorage.getItem('language')
    const { Title } = Typography;
    const movieId = props.match.params.movieId
    const [Movie, setMovie] = useState([])
    const [Directors, setDirectors] = useState([])
    const [Trailer, setTrailer] = useState([])
    const [Casts, setCasts] = useState([])
    const [CommentLists, setCommentLists] = useState([])
    const [LoadingForMovie, setLoadingForMovie] = useState(true)
    const [LoadingForCasts, setLoadingForCasts] = useState(true)
    const [ActorToggle, setActorToggle] = useState(false)
    const [subtitles, setSubtitles] = useState([]);

    const StreamTitleIcon = createFromIconfontCN({
        scriptUrl: '//at.alicdn.com/t/font_1804216_vq7xtyn73yj.js',
    });
    const postId = props.match.params.movieId;
    // const { movie } = props;

    let variable = {
        postId: postId
    }

    const user = useSelector(state => state.user)
    const [open, setOpen] = React.useState(false);
    // const [movieDetails] = useState(null);
    const [movieSrc, setMovieSrc] = useState(null);
    const [movieSources, setMovieSources] = useState(null);
    const [loader, setLoader] = useState(true);
    const [selectedValue, setSelectedValue] = useState(null);


    const sourceMessage = () => {
        if (movieSources) return selectedValue ? selectedValue : `${t('source.streamNow')} (${movieSources.ytsInfo.length + movieSources.leetInfo.length} ${t('source.avail')})`;
        else return t('source.noSrc')
    };

    const handleClickOpen = () => { setOpen(true) };
    const handleClose = (value, movieID) => {
        setOpen(false);
        setMovieSrc(false);

        socket.emit("stream:unmount");
        setTimeout(() => {
            setTimeout(() => {
                socket.emit("stream:play", movieID)
            }, 3000);
            setSelectedValue(value);
        }, 3000)

    };
    const constructSubtitles = (subtitles) => {
        if (subtitles) {
            let subTab = Object.entries(subtitles);
            let subObject = [];
            // let CurrentLanguage = localStorage.getItem('language')
            if (subTab && subTab.length)
                for (let i = 0; i < subTab.length; i++) {
                    let src = subTab[i][1].split('/');
                    src = src[src.length - 2].concat("/" + src[src.length - 1]);
                    subObject.push(Object.assign({
                        kind: 'subtitles',
                        src: `http://localhost:${port}/api/subtitles/${src}`,
                        srcLang: subTab[i][0],
                    }))
                }
            return subObject;
        }
    };

    useEffect(() => {
        let mounted = true;

        function streamMovie() {
            let src = null;

            let splittedValues = selectedValue.split('-');
            //
            if (splittedValues.length > 1)
                src = `http://localhost:${port}/api/movies/${splittedValues[0]}/${splittedValues[1]}/${Movie.imdb_id}`
            mounted && setMovieSrc(src);
        }
        if (selectedValue) {
            let variable1 = {
                postId: movieId,
                MovieTitle: Movie.title,
                MoviePoster_path: Movie.poster_path,
                MovieRunTime: Movie.runtime
            }
            axios.post("/api/addWatch/addWatchedMovie", variable1);
            mounted && streamMovie();
        }
        return () => {
            socket.emit("stream:unmount");
            mounted = false
        }
    }, [movieId, selectedValue, Movie]);

    useEffect(() => {
        // new endpoint not based on most popular like landing page but movie id
        let _mounted = true;
        const fetchDetailInfo = (endpoint) => {

            fetch(endpoint)
                .then(result => result.json())
                .then(result => {
                    if (result.status_code) {
                        _mounted && setLoadingForMovie(true);
                        message.error(t("landing.nomovie"));
                        props.history.push("/landing");
                    } else {
                        _mounted && setMovie(result)
                        _mounted && setLoadingForMovie(false)

                        let endpointForCasts = `${API_URL}movie/${movieId}/credits?api_key=${API_KEY}`;
                        let endpointTrailer = `${API_URL}movie/${movieId}/videos?api_key=${API_KEY}&language=${CurrentLanguage}`;
                        fetch(endpointForCasts)
                            .then(result => result.json())
                            .then(result => {
                                _mounted && setCasts(result.cast);
                                const Directors = result.crew.filter((member) => member.job === "Director");
                                _mounted && setDirectors(Directors);
                            })
                        setLoadingForCasts(false)
                        fetch(endpointTrailer)
                            .then(result => result.json())
                            .then(result => {
                                _mounted && setTrailer(result.results);
                            })
                    }
                })
                .catch(error => console.error('Error:', error)
                )
        }
        GetMovieSources(movieId).then((res) => {
            if (res.status === 200) {
                if (res.data && (res.data.inYTS || res.data.inLeet)) {
                    _mounted && setSubtitles(constructSubtitles(res.data.subtitles));
                    _mounted && setMovieSources(res.data);
                }
                else
                    _mounted && setMovieSources(null);
            }
            else
                _mounted && setMovieSources(null);
            _mounted && setLoader(false);
        })
        // console.log(movieSources)

        let endpointForMovieInfo = `${API_URL}movie/${movieId}?api_key=${API_KEY}&language=${CurrentLanguage}`;
        fetchDetailInfo(endpointForMovieInfo)

        axios.post('/api/comment/getComments', variable)
            .then(response => {
                // console.log("get comments ", response)
                if (response.data.success) {
                    // console.log('response.data.comments ', response.data.comments)
                    _mounted && setCommentLists(response.data.comments)
                } else {
                    props.history.push("/login");
                }
            })
        return () => { _mounted = false }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movieId, t, props, CurrentLanguage])

    const toggleActorView = () => {
        setActorToggle(!ActorToggle)
    }

    const updateComment = (newComment) => {
        setCommentLists(CommentLists.concat(newComment))
    }

    return (
        <div>
            {user.userData && user.userData.isAuth ?
                <>
                    {/* Movie Info */}
                    {!LoadingForMovie && Trailer ?
                        <MovieInfo movie={Movie} directors={Directors} cast={Casts} trailer={Trailer} />
                        :
                        <div><Spinner /></div>
                    }


                    {/* Body */}
                    <div style={{ width: '85%', margin: '1rem auto' }}>

                        {/* Actors Grid*/}

                        {!LoadingForMovie ?
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem' }}>
                                <Button variant="contained" className={classes.buttonActors} onClick={toggleActorView}>{ActorToggle ? t('movie.dontShowActors') : t('movie.showActors')}</Button>
                            </div>
                            :
                            null
                        }
                        {ActorToggle &&
                            <Row gutter={[16, 16]}>
                                {
                                    !LoadingForCasts ? Casts.map((cast, index) => (
                                        cast.profile_path &&
                                        <React.Fragment key={cast.id}>
                                            <GridCards actor image={cast.profile_path} actorName={cast.name} charName={cast.character} />
                                        </React.Fragment>
                                    )) :
                                        <div><Spinner /></div>
                                }
                            </Row>
                        }
                        <br />


                        {/* Stream */}

                        <Title level={3}><StreamTitleIcon type="icon-movie2" style={{ fontSize: "28px", paddingRight: "10px" }} />{t('movie.streamTitle')} {Movie.title}</Title>
                        <hr />
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem' }}>
                            {!loader ?
                                <Button
                                    variant="outlined"
                                    name="watchedMovie"
                                    className={classes.buttonChooseSource}
                                    onClick={handleClickOpen}
                                    disabled={!movieSources ? true : false}
                                >
                                    {
                                        !loader && movieSources ?
                                            <PlayCircleTwoTone twoToneColor="#1cd0a0" style={{ fontSize: "30px", padding: "10px" }} />
                                            : null
                                    }
                                    {sourceMessage()}
                                </Button>
                                :
                                null
                            }
                        </div>
                        {
                            loader ?
                                <React.Fragment>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}><h3><CoffeeOutlined style={{ fontSize: '20px' }} /> {t("source.wait")}</h3></div>
                                    <Spinner />
                                </React.Fragment>
                                : null
                        }
                        <SimpleDialog movieSources={movieSources} selectedValue={selectedValue}
                            open={open} onClose={handleClose} movieID={props.match.params.movieId} />
                        {
                            movieSrc ?
                                <Container style={{ padding: '0', marginTop: '2.5em', userSelect: 'false' }}>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <div className={classes.playerWrapper}>
                                                <ReactPlayer
                                                    width='100%'
                                                    height='100%'
                                                    url={movieSrc}
                                                    className={classes.reactPlayer}
                                                    playing
                                                    controls={true}
                                                    config={{
                                                        file: {
                                                            attributes: {
                                                                crossOrigin: 'use-credentials'
                                                            },
                                                            tracks: subtitles
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Container> : null
                        }

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <LikeDislikes video videoId={movieId} userId={localStorage.getItem('userId')} />
                        </div>

                        {/* Comments */}
                        <Comments movieTitle={Movie.title} CommentLists={CommentLists} postId={postId} refreshFunction={updateComment} />

                        <br />
                        {/* Recommended Movies */}
                        {!LoadingForMovie ?
                            <div><RecommendedMovies type="Recommended Movies" urlParams={movieId} /></div>
                            :
                            null
                        }
                        {/* <br /> */}
                        {/* Similar Movies */}
                        {!LoadingForMovie ?
                            <div><SimilarMovies type="Similar Movies" urlParams={movieId} /></div>
                            :
                            null
                        }
                    </div>
                </>
                : <Spinner />}
        </div>
    )
}

export default MovieDetailPage
