import React from 'react';
import {Grow, Typography, TextField, Container, Grid, Input } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as API from "../../../_actions/user_actions";
import {store} from "react-notifications-component";
import { useTranslation } from 'react-i18next';
import {
    Button,
  } from 'antd';
// Style
const useStyles = makeStyles(theme => ({
    forgotContainer: {
        padding: '9em 0 0 0',
        margin: 'auto',
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: theme.spacing(5),
    },
    login: {
        marginTop: 'auto',
        background: 'rgba(250, 250, 250, 0.9)',
        borderRadius: '12px',
        padding: theme.spacing(3),
        
    },
    signupButton: {
        margin: theme.spacing(3, 0, 3, 0),
        borderRadius: '10px !important',
        color: 'white',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    }
}));


export default function ResetPassword(props) {
    const classes = useStyles();
    const { t } = useTranslation();

    // function validateUsername(username) {
    //     var re = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;
    //     return re.test(username);
    // }
    function validatePassword(password) {
        var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(password);
    }

    // Warnings after validation
    // const [validationErrors, setValidationErrors] = React.useState({ err_username: false, err_password: false, err_password_confirm : false });
    const [validationErrors, setValidationErrors] = React.useState({ err_password: false, err_password_confirm : false });

    // State input TextFields
    // const [fieldValue, setTextFieldsValues] = React.useState({ username: '', password: '', password_confirm: ''})
    const [fieldValue, setTextFieldsValues] = React.useState({ password: '', password_confirm: ''})

    /* Input onChange -> Update value, store it in state(setTextFieldsValues), if user has a previous warnings then dismiss it with false */
    const handleChange = (event) => {
        // const { err_username, err_password, err_password_confirm } = validationErrors;
        const { err_password, err_password_confirm } = validationErrors;
        // if (event.target.id === "username" && err_username)
        //     setValidationErrors({...validationErrors, err_username: false});
        if (event.target.id === "password" && err_password)
            setValidationErrors({...validationErrors, err_password: false});
        if (event.target.id === "password_confirm" && err_password_confirm)
            setValidationErrors({...validationErrors, err_password: false});
        setTextFieldsValues({...fieldValue, [event.target.id]: event.target.value });
    };

    const handleResetClicked = (e) => {
        e.preventDefault();
        // const errors = { username: false, password: false, password_confirm: false }
        const errors = { password: false, password_confirm: false }
        // if (!validateUsername(fieldValue.username))
        //     errors.username = t('reset.validUsername');
        if (!fieldValue.password.length)
            errors.password =  t('reset.validUsername');
        if (fieldValue.password !== fieldValue.password_confirm)
            errors.password_confirm = t('reset.passwordReq');
        else if (!validatePassword(fieldValue.password))
            errors.password = t('reset.passwordweak');
        // setValidationErrors({ err_password: errors.password, err_username: errors.username , err_password_confirm: errors.password_confirm});
        // if (!errors.username && !errors.password && !errors.password_confirm) {
            setValidationErrors({ err_password: errors.password, err_password_confirm: errors.password_confirm});
        if (!errors.password && !errors.password_confirm) {
            API.resetPassword(props.match.params.tokenConf, fieldValue.password, fieldValue.password_confirm)
            // API.resetPassword(props.match.params.tokenConf, fieldValue.password, fieldValue.password_confirm, fieldValue.username)
                .then(response => {
                    if (response.status === 200){
                        store.addNotification({
                            message: t('reset.resetSuccess'),
                            insert: "top",
                            type: 'success',
                            container: "top-right",
                            animationIn: ["animated", "fadeIn"],
                            animationOut: ["animated", "fadeOut"],
                            dismiss: {
                                duration: 5000,
                                onScreen: true
                            }
                        });
                        console.log("GOOD")
                          props.history.push('/login')
                    }
                })
                .catch(err => {
                    if (err.response && err.response.data && err.response.data.errors)
                        setValidationErrors({err_password: err.response.data.errors.password, err_password_confirm: err.response.data.errors.password_confirm,});
                    else {
                        store.addNotification({
                            message: t('reset.resetFail'),
                            insert: "top",
                            type: 'danger',
                            container: "top-right",
                            animationIn: ["animated", "fadeIn"],
                            animationOut: ["animated", "fadeOut"],
                            dismiss: {
                                duration: 5000,
                                onScreen: true
                            }
                        });console.log("NOT GOOD")
                          props.history.push('/login')
                    }
                });
        }
    };

    return (
        <div className="loginbg">
        <div className={classes.forgotContainer}>
            <Grow in={true}>
                <Container className={classes.login} component="main" maxWidth="xs">
                    {/* <CssBaseline /> */}
                    <div className={classes.paper}>
                        <Typography component="h1" variant="h5">
                            {t('reset.passwordReset')}
                        </Typography>
                        <form className={classes.form} onSubmit={handleResetClicked} noValidate>
                        <Input type="text" name="username" value="" autoComplete="username" style={{ display: 'none' }} />
                            <Grid alignContent="center" alignItems="center" container spacing={2}>
                                {/* <Grid item xs={12}>
                                    <TextField
                                        onChange={handleChange}
                                        helperText={validationErrors.err_username}
                                        error={Boolean(validationErrors.err_username)}
                                        variant="outlined"
                                        required
                                        fullWidth={true}
                                        id="username"
                                        label={t('reset.username')}
                                        name="username"
                                        autoComplete="username"
                                    />
                                </Grid> */}
                                <Grid item xs={12}>
                                    <TextField
                                        onChange={handleChange}
                                        helperText={validationErrors.err_password}
                                        // error={Boolean(validationErrors.err_password) || Boolean(validationErrors.err_username)}
                                        error={Boolean(validationErrors.err_password)}
                                        variant="outlined"
                                        required
                                        fullWidth={true}
                                        name="password"
                                        label={t('reset.password')}
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        value={fieldValue.password_confirm || ''}
                                        helperText={validationErrors.err_password_confirm}
                                        error={Boolean(validationErrors.err_password_confirm)}
                                        onChange={handleChange}
                                        variant="outlined"
                                        required
                                        fullWidth={true}
                                        name="password_confirm"
                                        label={t('reset.cpassword')}
                                        type="password"
                                        id="password_confirm"
                                        autoComplete="current-password"
                                        className={classes.textfield}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                size="large"
                                variant="contained"
                                type="primary"
                                color="primary"
                                className={classes.signupButton}
                                onClick={handleResetClicked}
                            >
                                {t('reset.resetButton')}
                            </Button>
                        </form>
                    </div>
                </Container>
            </Grow>
        </div>
        </div>
    );
}