/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2018-12-05
 * @description: 概览上半部分-每个小模块
 */
import React from 'react';
import CSSModules from 'react-css-modules';

import Icon from 'antd-mobile/lib/icon';

import fetch from '../../../../components/fetch';

import styles from './index.less';

class Item extends React.Component {
	constructor(props){
		super(props);
		this.state = {
            loading: true,
            // 查询条件
            condition: {},
            // 均值
            avg: '--',
            // 环比
			ratio: '--',
			// 错误提示信息
			errorMsg: ''
		}
    }
    componentDidMount() {
		const { detail } = this.props;
		const cond = JSON.parse(detail.condition);
		this.state.condition.name = cond.name;
    }
	/**
	 * 查询数据
	 * @param {*} param 
	 */
	getData(param) {

		Object.assign(this.state.condition, param);

		this.setState({
			loading: true
		})
		const fetchData = fetch.post('/hwi/summary/get', this.state.condition);

        fetchData.then((response) => {
          response = response.data;
          if (response.success) {
			let result = response.relatedObject;
			this.setState({
				loading: false,
				avg: result.avg,
				ratio: result.ratio,
				errorMsg: ''
			})
          } else {
            this.setState({
				loading: false,
				errorMsg: response.message
			})
          }
        }).catch((error) => {
			this.setState({
				errorMsg: '系统繁忙，请稍后再试'
			})
        });
	}
	
	render(){
        const { detail } = this.props;
        const { loading, avg, ratio } = this.state;
		return (
			<div styleName='tab-item'>
				<div styleName='name'>{ detail.name }</div>
				<div styleName='avg'>
				{ 
					loading ? <Icon type='loading' /> : avg
				}
				</div>
				<div styleName='ratio'>环比 : { ratio }</div>
			</div>
		)
	}
}


const turnCss = CSSModules(Item, styles, { allowMultiple: true });

export default turnCss;