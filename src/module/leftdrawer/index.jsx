import React from 'react';
import CSSModules from 'react-css-modules';
import { Route, Redirect, withRouter } from 'react-router-dom';

import NavBar from 'antd-mobile/lib/nav-bar';

import WingBlank from 'antd-mobile/lib/wing-blank';
import Drawer from 'antd-mobile/lib/drawer';
import Menu from 'antd-mobile/lib/menu';
import List from 'antd-mobile/lib/list';
import Picker from 'antd-mobile/lib/picker';
import Toast from 'antd-mobile/lib/toast';
import Icon from 'antd-mobile/lib/icon';

import fetch from '../../components/fetch';

import styles from './index.less';

class LeftDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      userName: '',
      productList: [],
      menuList: [],
      curProductId: '1000',
      curPath: ['overview']
    }
  }
  componentDidMount() {
    this.getUserInfo();
    this.getProductList();
    this.getMenuList();
  }
  /**
   * 获取登录用户信息
   */
  getUserInfo() {
    let info = globalData.loginInfo;
    this.setState({
      userName: info.nickname || info.username
    })
  }
  /**
   * 获取产品列表
   */
  getProductList() {
    let { productList } = this.state;

    globalData.productList.map(item => {
      productList.push({
        value: item.id,
        label: item.name
      })
    })
   
    this.setState({
      productList: productList,
      curProductId: productList[0].value
    });
  }
  getMenuList() {
    this.setState({
      menuList: [{
          value: 'overview',
          label: '概览',
        }, {
          value: 'timeboard',
          label: '实时看板',
        }]
    })
  }
  /**
   * 点开产品列表时，将左侧抽屉收起来
   * @param {*} e 
   */
  beforeProChange(e) {
    if (e) {
      this.onOpenChange(e)
    }
  }
  /**
   * 切换产品
   * @param {*} e 
   */
  onProductChange(e) {
    Toast.loading('正在切换...', 5);
    this.setState({
      curProductId: e[0]
    });
    const fetchData = fetch.get('/hwi/security/switchProduct?productId=' + e[0]);

    fetchData.then((response) => {
      response = response.data;
      if (response.success) {
        // 切换成功
        Toast.hide();
        let result = response.relatedObject;
        Object.assign(globalData.loginInfo, {
          admin: result.admin,
          superAdmin: result.superAdmin,
          username: result.username,
          nickname: result.nickname,
          roles: result.roles
        })
        
        // 应用列表
        globalData.appList = result.attrApp;
        // 当前产品信息
        globalData.currProduct = result.currProduct;
        // 产品列表
        globalData.productList = result.productList;

        this.props.content.onProductChange();
      } else {
        Toast.fail(response.message);
      }
    }).catch((error) => {
      // 报错
    });
    
  }
  onMenuChange(e) {
    this.setState({
      curPath: e
    })
    this.onOpenChange(e)
    this.props.history.replace({
      pathname: '/' + e,
      state: {}
  });
  }
  /**
   * 获取左侧抽屉内容
   */
  getSidebar() {
    const { userName, productList, menuList, curProductId, curPath } = this.state; 

    return (
      <div>
        <div styleName="user-info">
          <img src={ require("./white-circle.png") } />
          <label>{ userName }</label>
        </div>
        <Picker 
          data={ productList }
          cols={ 1 }
          value={ [curProductId] }
          onVisibleChange={ e => this.beforeProChange(e) }
          onChange={ e => this.onProductChange(e) }
          
        >
          <List.Item arrow="horizontal" style={{ padding: '18px 0 18px 15px' }}>当前产品</List.Item>
        </Picker>
        <Menu
          level={ 1 }
          data={ menuList }
          value={ curPath }
          onChange={ e => this.onMenuChange(e) }
        />
      </div>
    )
  }
  onOpenChange(e) {
    const { open } = this.state;
    this.setState({ open: !open });
  }
  render() {
    const { module, children } = this.props;
    const { open } = this.state;
    // fix in codepen
    const sidebar = this.getSidebar();
    return (
      <div>
        <NavBar leftContent={<Icon onClick={ e => this.onOpenChange(e) } type="ellipsis" />} >概览</NavBar>
        <Drawer
          className="my-drawer"
          style={{ minHeight: document.documentElement.clientHeight }}
          sidebar={ sidebar }
          open={ open }
          onOpenChange={ e => this.onOpenChange(e) }
        >
          <WingBlank>
          {
            children
          }
          </WingBlank>
        </Drawer>
      </div>
    );
  }
}

const turnCss = CSSModules(LeftDrawer, styles, { allowMultiple: true });

export default withRouter(turnCss);