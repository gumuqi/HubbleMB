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
			typeList: [],
			appList: [],
			dateList: []
		}
	}
	componentDidMount(){
		this.getTypeList();
		this.getAppList();
		this.getDateList();
	}
	rebuild() {
		this.getAppList();
		this.setState({
			appList: this.state.appList
		})
	}
	/**
	 * 获取计算类型列表
	 */
	getTypeList() {
		this.state.typeList = [{
			value: 'user',
			label: '用户',
			selected: true
		},{
			value: 'device',
			label: '设备'
		}]
	}
	/**
	 * 获取应用列表
	 */
	getAppList() {

		let list = [];
		globalData.appList.map((item, i) => {
			// 默认选中第一个应用
			let p = {};
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
		list[0].selected = true;
		this.state.appList = list;
	}
	/**
	 * 获取时间列表
	 */
	getDateList() {
		let today = new Date();
		let yesterday = today - 24*3600*1000;
		let pre7day = today - 7*24*3600*1000;
		let pre30day = today - 30*24*3600*1000;
		this.state.dateList = [{
			value: new Date(yesterday).Format('yyyy-MM-dd') + '~' + new Date(yesterday).Format('yyyy-MM-dd'),
			label: '昨天'
		},{
			value: new Date(pre7day).Format('yyyy-MM-dd') + '~' + new Date(yesterday).Format('yyyy-MM-dd'),
			label: '过去7天',
			selected: true
		},{
			value: new Date(pre30day).Format('yyyy-MM-dd') + '~' + new Date(pre7day).Format('yyyy-MM-dd'),
			label: '过去30天'
		}]
	}
	/**
	 * 类型改变（单选）
	 */
	onTypeChange(e) {
		let { typeList } = this.state;
		typeList.map(item => {
			item.selected = false;
		})

		e.selected = true;
		this.setState({
			typeList: typeList
		})
	}
	/**
	 * 应用改变（多选）
	 */
	onAppChange(e) {
		let { appList } = this.state;
		appList.map(item => {
			item.selected = false;
		})

		e.selected = true;
		this.setState({
			appList: appList
		})
	}
	/**
	 * 时间改变（单选）
	 */
	onTimeChange(e) {
		let { dateList } = this.state;
		dateList.map(item => {
			item.selected = false;
		})

		e.selected = true;
		this.setState({
			dateList: dateList
		})
	}
	/**
	 * 提供对外查询参数
	 */
	getParam() {
		const { typeList, appList, dateList } = this.state;
		let type = typeList.find(item => {
			return item.selected;
		}) || {};
		let app = appList.find(item => {
			return item.selected;
		}) || {};
		let date = dateList.find(item => {
			return item.selected;
		}) || {};
		return {
			type: type.value,
			appkey: app.appKey,
			fromDate: date.value.split('~')[0],
			toDate: date.value.split('~')[1]
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
					<div styleName="box-title">类型</div>
					{
						typeList.map(item => {
							return <Tag
									styleName="item"
									key={ item.value }
									selected={ item.selected }
									onChange={ e => this.onTypeChange(item) }
								   >
								   { item.label }
								   </Tag>;
						})
					}
				</div>
				
				<div styleName="filter-box">
					<div styleName="box-title">应用</div>
					{
						appList.map(item => {
							return <Tag
									styleName="item"
									key={ item.appKey }
									selected={ item.selected }
									onChange={ e => this.onAppChange(item) }
								   >
								   { item.appName }
								   </Tag>;
						})
					}
				</div>
				
				<div styleName="filter-box">
					<div styleName="box-title">时间范围</div>
					{
						dateList.map(item => {
							return <Tag
									styleName="item"
									key={ item.value }
									selected={ item.selected }
									onChange={ e => this.onTimeChange(item) }
								   >
								   { item.label }
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