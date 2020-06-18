import React from 'react';
// import useStyles from '../style';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogTitle,
    List,
    ListItem,
    // ListItemAvatar,
    // Avatar,
    ListItemText,
} from '@material-ui/core';
import { createFromIconfontCN } from '@ant-design/icons';

function SimpleDialog(props) {
    const { t } = useTranslation();
    // const classes = useStyles();
    const SourceReadyIcon = createFromIconfontCN({
        scriptUrl: '//at.alicdn.com/t/font_1804216_xwixbmiu07.js',
      });
    const { onClose, selectedValue, open, movieSources, movieID} = props;

    const handleClose = () => {
        
        onClose(selectedValue, movieID)
    };

    const handleListItemClick = value => {
     
        onClose(value, movieID);
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle id="simple-dialog-title">{t('source.chooseSrc')}</DialogTitle>
            <List>
                {movieSources && movieSources.ytsInfo && Array.isArray(movieSources.ytsInfo) && movieSources.ytsInfo.map((obj, key) => (
                    <ListItem button onClick={() => handleListItemClick('yts-' + obj.quality.substring(0, obj.quality.length - 1))} key={key}>
                            <SourceReadyIcon type="icon-interface-copy" style={{ fontSize: "30px", padding: "10px" }} />
                        <ListItemText
                            primary={`${obj.quality} - ${obj.seeds} seeds / ${obj.size}`}
                        />
                    </ListItem>
                ))}
                {movieSources && movieSources.leetInfo && Array.isArray(movieSources.leetInfo) && movieSources.leetInfo.map((obj, key) => (
                    <ListItem button onClick={() => handleListItemClick('1377-' + obj.quality.substring(0, obj.quality.length - 1))} key={key}>
                            <SourceReadyIcon type="icon-interface-copy" style={{ fontSize: "30px", padding: "10px" }} />
                        <ListItemText
                            primary={`${obj.quality} - ${obj.seeds} seeds / ${obj.size}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
} 

export default SimpleDialog