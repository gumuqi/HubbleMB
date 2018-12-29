//二维码控制器
import React 				from 'react';
import CSSModules from 'react-css-modules';

import Tag 	from 'antd-mobile/lib/tag';
import Drawer from 'antd-mobile/lib/drawer';
import Button from 'antd-mobile/lib/button';

import styles from './index.less';

class Filter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			appList: []
		}
	}
	componentDidMount(){
		this.getAppList();
	}
	rebuild() {
		this.getAppList();
		this.setState({
			appList: this.state.appList
		})
	}
	/**
	 * 获取应用列表
	 */
	getAppList() {

		let list = [];
		globalData.appList.map((item, i) => {
			// 默认全选
			let p = { selected: true };
			let plat = item.platform.toLowerCase();
			if (plat == 'web') {
				p.sort = 1;
			} else if (plat == 'ios') {
				p.sort = 2;
			} else if (plat == 'android') {
				p.sort = 3;
			} else if (plat == 'miniprogram') {
				p.sort = 4;
			} else {
				p.sort = 5;
			}
			Object.assign(p, item);
			list.push(p);
		})
		list.sort((a, b) => {
			return a.sort - b.sort;
		})
		
		this.state.appList = list;
	}
	
	/**
	 * 应用改变（多选）
	 */
	onAppChange(item, e) {
		let { appList } = this.state;

		item.selected = e;
		this.setState({
			appList: appList
		})
	}
	
	/**
	 * 提供对外查询参数
	 */
	getParam() {
		const { appList } = this.state;

		let list = [];
		appList.map(item => {
			if (item.selected) {
				list.push(item.appKey);
			}
		});
		if (list.length == appList.length) {
			// 如果全选的话，传空字符串
			list = [];
		}
		return {
			appid: list.join(',')
		}
	}
	/**
	 * 获取右侧抽屉筛选内容结构
	 */
	getSidebar() {
		const { typeList, appList, dateList } = this.state;
		return (
			<div styleName="filter-cnt">
				
				<div styleName="filter-box">
					<div styleName="box-title">应用</div>
					{
						appList.map(item => {
							return <Tag
									styleName="item"
									key={ item.appKey }
									selected={ item.selected }
									onChange={ e => this.onAppChange(item, e) }
								   >
								   { item.appName }
								   </Tag>;
						})
					}
				</div>
				
				<div styleName="filter-footer">
					<Button type="primary" onClick={ e => this.onSubmit(e) }>确定</Button>
				</div>
			</div>
		)
	}
	/**
	 * 提交查询
	 * @param {*} e 
	 */
	onSubmit(e) {
		this.props.onSearch();
		this.props.onOpenChange(e);
	}
	render() {
		const { open } = this.props;
		const sidebar = this.getSidebar();
		return 	(
			<Drawer
				className="my-filter"
				position="right"
				style={{ minHeight: document.documentElement.clientHeight }}
				sidebar={ sidebar }
				open={ open }
				onOpenChange={ e => this.props.onOpenChange(e) }
			>
		
			</Drawer>
		);
	}
}
	 
const turnCss = CSSModules(Filter, styles, { allowMultiple: true });

export default turnCss;