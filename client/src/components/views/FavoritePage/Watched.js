import React, { useEffect, useState } from 'react'
import { Typography, Popover } from 'antd';
import './favorite.css';
import { useTranslation } from 'react-i18next';
import { ClockCircleOutlined } from '@ant-design/icons';
import { createFromIconfontCN } from '@ant-design/icons';
import { IMAGE_BASE_URL, POSTER_SIZE } from '../../Config';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
const { Title } = Typography;

const MovieInfoIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1804216_3easwvxbvnh.js',
});

const ShadesIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1804216_7gmzapzrlg9.js',
});

function Watched() {
    const [Favorites, setFavorites] = useState([])
    const [Loading, setLoading] = useState(true)
    const { t } = useTranslation();
    const history = useHistory();

    const calcTime = (time) => {
        const hours = Math.floor(time / 60);
        let mins = time % 60;;
        if (mins < 10) { mins = "0" + mins; }
        return `${hours}h ${mins}min`;
    }

    useEffect(() => {
        axios.post("/api/addWatch/getWatchedMovie")
            .then(response => {
                // console.log("get comments ", response)
                if (response.data.success) {
                    setFavorites(response.data.watched_movie);
                    setLoading(false);
                } else {
                    history.push("/login");
                }
            })
    }, [history]);

    const renderCards = Favorites.map((favorite, index) => {

        const content = (
            <div>
                {favorite.moviePost ?
                    <img src={`${IMAGE_BASE_URL}${POSTER_SIZE}${favorite.moviePost}`} alt="" />
                    : "no image"}
            </div>
        );

        return <tr key={favorite._id}>

            <Popover content={content} title={`${favorite.movieTitle}`}>
                <td><MovieInfoIcon type="icon-movie1" style={{ fontSize: "20px", paddingRight: "10px" }} /><strong><a style={{ color: "black" }} href={`/movie/${favorite.movieId}`}>{favorite.movieTitle}</a></strong></td>
            </Popover>

            <td><center><ClockCircleOutlined style={{ paddingRight: "10px" }} />{calcTime(favorite.movieRunTime)}</center></td>

        </tr>
    })

    return (
        <div>
            <Title level={2}><ShadesIcon type="icon-sunglasses" style={{ paddingRight: "10px" }} />{t('favorites.watched')}</Title>
            <hr />
            <br />
            {!Loading &&
                <table>
                    <thead>
                        <tr>
                            <th><MovieInfoIcon type="icon-movie1" style={{ fontSize: "20px", paddingRight: "10px" }} />{t('favorites.movieTitle')}</th>
                            <th><center><ClockCircleOutlined style={{ paddingRight: "10px" }} />{t('favorites.movieRuntime')}</center></th>

                        </tr>
                    </thead>
                    <tbody>
                        {renderCards}
                    </tbody>
                </table>
            }
        </div>
    )
}

export default Watched
