
import axios from 'axios';
import Toast from 'antd-mobile/lib/toast';

var CancelToken = axios.CancelToken;
var baseHost = 'https://hubble.netease.com';
//var baseHost = 'http://dev.hubble.netease.com';
const fetch = {
  history: null,
  get(url, options, notNeedAbi, notProduct) {

    const currProduct = globalData.currProduct || '';
    let urlStr = baseHost + url;
    if (notNeedAbi) {
      urlStr = url;
    }
    if (!notProduct) {
      if (currProduct.id && url.indexOf('productId') < 0) {
        urlStr += `?productId=${currProduct.id}`;
      }
    }
    
    var source = CancelToken.source();
    var headers = {};
    if (globalData.loginInfo.accessToken) {
      headers.token = globalData.loginInfo.accessToken;
    }
    var promise = new Promise( (resolve, reject) => {
      axios({
        url: urlStr,
        params: options,
        headers: headers,
        cancelToken: source.token
      }).then( response => {
        const errorCode = response.data.errorCode || '';
        this.clearSystem(errorCode, this.history); 
        resolve(response);
      }).catch( err => {
        reject(err);
      });
    });
    promise._cancelSource = source;
    return promise;
  },
  post(url, options, history) {
    const currProduct = globalData.currProduct || '';
   
    let urlStr = baseHost + url;

    var source  = CancelToken.source();
    var headers = {};
    if (globalData.loginInfo.accessToken) {
      headers.token = globalData.loginInfo.accessToken;
    }
    if (options.headers) {
      Object.assign(headers, options.headers);
      delete options.headers;
    }
    var promise = new Promise( (resolve, reject) => {
      axios({
        url: urlStr,
        method: 'POST',
        headers: headers,
        data: options,
        cancelToken: source.token
      }).then( response => {
        const errorCode = response.data.errorCode || '';
        this.clearSystem(errorCode, this.history); 
        resolve(response);
      }).catch( err => {
        reject(err);
      });
    });
    promise._cancelSource = source;
    return promise;
  },
  /**
   * 获取用户信息
   * @param {*回调函数} callback 
   */
  checkUser(callback) {
    const fetchData = this.get('/hwi/login/api/checkUser');

    fetchData.then((response) => {
        response = response.data;

        if (response.success) {
            let result = response.relatedObject;
            // 用户相关信息
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
            if (typeof callback == 'function') {
                callback();
            }
        } else {
            // 登录失败
            Toast.info(response.message);
        }
    }).catch((error) => {
        // 报错
    });
  },
  setHistory(history) {
    this.history = history;
  },
  // 清除本地登录信息
  clearSystem(errorCode, history) {
    if ([20102, 20202].indexOf(errorCode) > -1) {
        document.cookie = '';
        localStorage.removeItem('nowLoginInfo');
        if (location.href.indexOf('/login') < 0) {
        location.href = '/login';
        }
    }
  }
};

export default fetch;