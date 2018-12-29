/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2018-12-05
 * @description: 项目入口文件
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Redirect } from 'react-router-dom';

import Overview from './module/overview';
import Timeboard from './module/timeboard';

import 'antd-mobile/dist/antd-mobile.css';


// 引入业务模块
import Login from './components/login';
import LeftWrawer from './module/leftdrawer';
import './less/common.less';

const supportsHistory = 'pushState' in window.history;

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    }
  }

  onLogin() {
    this.forceUpdate();
  }
  /**
   * 
   * @param {*} e 
   */
  onProductChange(e) {
    this.forceUpdate();
  }
  render() {

    return (
      <HashRouter basename="/" forceRefresh={!supportsHistory} keyLength={12}>
        <div>
        {
          !globalData.loginInfo.username ? <Login onLogin={ e => this.onLogin(e) }/> : <Redirect to="overview" />
        }
        <Route
          exact
          path="/overview"
          render={ () => {
          return <Overview ref="content" />
        }}
        />
        <Route
          exact
          path="/timeboard"
          render={ () => {
          return <Timeboard ref="content" /> 
        }}
        />
        </div>
      </HashRouter>
    )
  }
}
ReactDOM.render(
  <Entry />,
  document.getElementById('root')
);