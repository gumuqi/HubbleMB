import React from 'react';
import CSSModules from 'react-css-modules';
import { withRouter } from 'react-router-dom';

import Input from 'antd-mobile/lib/input-item';
import Button from 'antd-mobile/lib/button';
import Toast from 'antd-mobile/lib/toast';

import Util from '../util';
import fetch from '../fetch';
import styles from './index.less';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            disabled: true
        }
    }
    componentDidMount() {
        let name = localStorage.getItem('username') || '';
        let pass = localStorage.getItem('password') || '';
        this.setState({
            username: name,
            password: pass,
            disabled: !name || !pass
        })
    }
    onNameChange(e) {
        let { username, password, disabled } = this.state;
        username = e;
        if (username.trim()!='' && password.trim()!='') {
            // 用户名和密码都不为空时才可以点击登录
            disabled = false;
        } else {
            disabled = true;
        }
        this.setState({
            username: username,
            password: password,
            disabled: disabled
        })
    }
    onWordChange(e) {
        let { username, password, disabled } = this.state;
        password = e;
        if (username.trim()!='' && password.trim()!='') {
            // 用户名和密码都不为空时才可以点击登录
            disabled = false;
        } else {
            disabled = true;
        }
        this.setState({
            username: username,
            password: password,
            disabled: disabled
        })
    }
    onSubmit() {
        Toast.loading('正在登陆...', 5);
        const { username, password } = this.state;
        const fetchData = fetch.post('/hwi/login/getToken', {
            userName: username,
            passWord: password
        });

        fetchData.then((response) => {
          response = response.data;
          if (response.success) {
            Toast.hide();
            let result = response.relatedObject;
            globalData.loginInfo.accessToken = result.accessToken;
            // 登录成功
            fetch.checkUser(() => {
                this.props.onLogin();
                this.props.history.replace({
                    pathname: '/overview',
                    state: {}
                });
            });
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
          } else {
            // 登录失败
            Toast.info(response.message);
          }
        }).catch((error) => {
          // 报错
        });
    }
	render() {
        const { disabled, username, password } = this.state;
		return (
			<div styleName="login-cnt" style={{ minHeight: document.documentElement.clientHeight }}>
                <div styleName="pro-logo">
                    <img src={ require('./logo.png') } />
                </div>
                <div styleName="pro-name">
                    网易哈勃
                </div>
                <Input value={ username } onChange={ e => this.onNameChange(e) } placeholder="邮箱地址" />
                <Input value={ password } onChange={ e => this.onWordChange(e) } placeholder="密码" type="password"/>
                <Button onClick={ e => this.onSubmit(e) } styleName="submit" type="primary" disabled={ disabled }>登录</Button>
            </div>
		)
	}
}
const turnCss = CSSModules(Login, styles, { allowMultiple: true });

export default withRouter(turnCss);


