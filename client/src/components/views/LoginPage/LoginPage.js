import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { loginUser } from "../../../_actions/user_actions";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined } from '@ant-design/icons';
import { useDispatch } from "react-redux";
import { useTranslation } from 'react-i18next';
import { createFromIconfontCN } from '@ant-design/icons';

const { Title } = Typography;

function LoginPage(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const rememberMeChecked = localStorage.getItem("rememberMe") ? true : false;

  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [rememberMe, setRememberMe] = useState(rememberMeChecked)

  const handleRememberMe = () => {
    setRememberMe(!rememberMe)
  };

  const initialUsername = localStorage.getItem("rememberMe") ? localStorage.getItem("rememberMe") : '';

  const FortyTwo = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1804216_e03m5iit5un.js',
  });

  const Discord = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1804216_0kropuakdmk.js',
  });

  return (
    <Formik
      initialValues={{
        username: initialUsername,
        password: '',
      }}
      validationSchema={Yup.object().shape({
        username: Yup.string()
          .min(2, t('login.usernameErr'))
          .required(t('login.usernameErr2')),
        password: Yup.string()
          .min(6, t('login.passwordErr'))
          .required(t('login.passwordErr2')),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            username: values.username,
            password: values.password
          };

          dispatch(loginUser(dataToSubmit))
            .then(response => {
              if (response.payload.loginSuccess) {
                window.localStorage.setItem('userId', response.payload.userId);
                if (rememberMe === true) {
                  window.localStorage.setItem('rememberMe', values.username);
                } else {
                  localStorage.removeItem('rememberMe');
                }
                props.history.push("/landing");
              } else {
                setFormErrorMessage(t('login.formErr'))
              }
            })
            .catch(err => {
              setFormErrorMessage(t('login.formErr'))
              setTimeout(() => {
                setFormErrorMessage("")
              }, 3000);
            });
          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
        } = props;
        return (
          <section className="flexbox">
          <div className="stretch">
          <div className="loginbg">
            <div className="app login">
              <Title level={3}>{t('login.login')}</Title>
              <form onSubmit={handleSubmit} style={{ width: '350px' }}>

                <Form.Item required>
                  <Input
                    id="username"
                    prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder={t('login.username')}
                    type="text"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.username && touched.username ? 'text-input error' : 'text-input'
                    }
                  />
                  {errors.username && touched.username && (
                    <div className="input-feedback">{errors.username}</div>
                  )}
                </Form.Item>

                <Form.Item required>
                  <Input
                    id="password"
                    prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder={t('login.password')}
                    type="password"
                    autoComplete="off"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.password && touched.password ? 'text-input error' : 'text-input'
                    }
                  />
                  {errors.password && touched.password && (
                    <div className="input-feedback">{errors.password}</div>
                  )}
                </Form.Item>

                {formErrorMessage && (
                  <label ><p style={{ color: '#ff0000bf', textAlign: 'center', fontSize: '0.8rem', border: '1px solid', padding: '0.5rem', borderRadius: '10px' }}>{formErrorMessage}</p></label>
                )}

                <Form.Item>
                  <Checkbox id="rememberMe" onChange={handleRememberMe} checked={rememberMe}>{t('login.remember')}</Checkbox>
                  <a className="login-form-forgot" href="/forgot" style={{ float: 'right' }}>
                    {t('login.forgot')}
                  </a>
                  <div>
                    <Button type="primary" htmlType="submit" className="login-form-button" style={{ minWidth: '100%' }} disabled={isSubmitting} onSubmit={handleSubmit}>
                      {t('login.login')}
                    </Button>
                  </div>
                Or <a href="/register">{t('login.registernow')}</a>
                </Form.Item>

                <h3>{t('login.connect')}</h3>

                <div className="container" style={{ textAlign: "center" }}>
                  <a href="https://api.intra.42.fr/oauth/authorize?client_id=3acbb925116e89ed915f500bab013925f8a18d6886c590c0110a93cc29bc9d38&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Foauth%2F42&response_type=code">
                    <FortyTwo className="oauthForty" type="icon-42_Logo" style={{ color: "#4f5152" }} />
                  </a>
                  <a href="https://discord.com/api/oauth2/authorize?client_id=712235304152727663&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Foauth%2Fdiscord&response_type=code&scope=identify%20email">
                    <Discord className="oauth" type="icon-discord-fill" style={{ color: "#4f5152" }} />
                  </a>
                  <a href="https://github.com/login/oauth/authorize?client_id=ce56b74597442ae00277&scope=user">
                    <GithubOutlined className="oauth" style={{ color: "#4f5152" }} />
                  </a>
                </div>
              </form>
            </div>
          </div>
          </div>
          </section>
        );
      }}
    </Formik>
  );
};

export default withRouter(LoginPage);