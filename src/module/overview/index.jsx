import React from 'react';
import CSSModules from 'react-css-modules';

import Icon from 'antd-mobile/lib/icon';

import Wrapper from '../leftdrawer';
import TabControl from './tabControl';
import BoardControl from './boardControl';
import Filter from './filter';

import styles from './index.less';

var webTabData      = [];  //web端tab部分数据
var webBoardData    = [];  //web端dashboard部分数据	
var mobileTabData   = [];  //mobile端tab部分数据
var mobileBoardData = [];  //mobile端dashboard部分数据	

function initData(type){
	var txt = type=='device'? '设备' : '用户';
	//web端
	webTabData = [{
		name: '日均活跃' + txt + '数',
		title: '一段时间内，平均每天访问网站的' + txt + '数（每日去重' + txt + '数加总除以天数，天之间不去重）',
		model: 'overview',
		graphId: 'activeUser',
		condition: '{"name":"activeUser","chartType":"line"}'
	},{
		name: '日均新增' + txt + '数',
		title: '一段时间内，平均每天首次访问网站的' + txt + '数（cookie新增）',
		model: 'overview',
		graphId: 'newUser',
		condition: '{"name":"newUser","chartType":"line"}'
	},{
		name: '累积' + txt + '数',
		title: '截止所选时间终止日期，产品的累计去重' + txt + '数（选择5/1至6/1时，累积' + txt + '数取6/1号的数据，注：不支持渠道和版本筛选）',
		model: 'overview',
		graphId: 'totalUser',
		condition: '{"name":"totalUser","chartType":"line"}'
	},{
		name: '日均浏览量',
		title: '一段时间内，平均每天网页访问量（pv）',
		model: 'overview',
		graphId: 'pageView',
		condition: '{"name":"pageView","chartType":"line"}'
	},{
		name: '日均访问量',
		title: '一段时间内，平均每天网站被访问的会话次数（session）',
		model: 'overview',
		graphId: 'sessionCnt',
		condition: '{"name":"sessionCnt","chartType":"line"}'
	},{
		name: '日均跳出率',
		title: '一段时间内，只浏览一个页面的访问次数占所有访问次数的百分比',
		model: 'overview',
		graphId: 'bounceRate',
		condition: '{"name":"bounceRate","chartType":"line"}'
	}]

	webBoardData = [
	{
		name: '访问时长',
		title: '一段时间内，平均每次访问网站的浏览时间（总的访问时间除以总的会话次数）',
		model: 'overview',
		graphId: 'usetime',
		condition: '{"name":"usetime","chartType":"bar"}',
		layouts: {
			w: 4,
			h: 4,
			x: 0,
			y: 0,
			static: true
		}
	},{
		name: '访问深度',
		title: '一段时间内，平均每次访问网站的页面浏览量（网站总的页面访问量除以总的会话次数）',
		model: 'overview',
		graphId: 'avgVisitLen',
		condition: '{"name":"avgVisitLen","chartType":"bar"}',
		layouts: {
			w: 4,
			h: 4,
			x: 4,
			y: 0,
			static: true
		}
	},{
		name: '新增' + txt + '次日留存率',
		title: '一段时间内，第2天仍然访问网站的' + txt + '数占首次访问网站的比例',
		model: 'overview',
		graphId: 'retained',
		condition: '{"name":"retained","chartType":"line"}',
		layouts: {
			w: 4,
			h: 4,
			x: 8,
			y: 0,
			static: true
		}
	},{
		name: '新增' + txt + '留存率趋势图',
		title: '一段时间内，新增' + txt + '数中仍然访问网站的' + txt + '占比随着时间的变化趋势',
		model: 'overview',
		graphId: 'retentionTrend',
		condition: '{"name":"retentionTrend","chartType":"line"}',
		layouts: {
			w: 12,
			h: 4,
			x: 0,
			y: 4,
			static: true
		}
	},{
		name: '入口页面Top10',
		title: '入口页面：网站每次回话中第一个页面；跳出率：该页面作为入口页面并且只有一次访问的回话次数除以该页面作为入口页面的总的访问次数',
		model: 'overview',
		graphId: 'firstPageNewUser',
		rightTab: ['firstPageNewUser','firstPageActiveUser'],
		condition: '{"name":"firstPageNewUser","chartType":"table-chart"}',
		layouts: {
			w: 6,
			h: 6,
			x: 0,
			y: 8,
			static: true
		}
	},{
		name: '页面浏览Top10',
		title: '一段时间内，浏览量最大的前10个页面，以及这些页面占总体浏览量的比例',
		model: 'overview',
		graphId: 'webPageNewUser',
		rightTab: ['webPageNewUser','webPageActiveUser'],
		condition: '{"name":"webPageNewUser","chartType":"table-chart"}',
		layouts: {
			w: 6,
			h: 6,
			x: 6,
			y: 8,
			static: true
		}
	},{
		name: '访问城市Top10',
		title: '一段时间，访问' + txt + '数最多的前10个城市',
		model: 'overview',
		graphId: 'cityNewUser',
		rightTab: ['cityNewUser','cityActiveUser'],
		condition: '{"name":"cityNewUser","chartType":"bar"}',
		layouts: {
			w: 6,
			h: 6,
			x: 0,
			y: 14,
			static: true
		}
	},{
		name: '网站来源Top10',
		title: '一段时间，来源最多的前10个网站',
		model: 'overview',
		graphId: 'referrerNewUser',
		rightTab: ['referrerNewUser','referrerActiveUser'],
		condition: '{"name":"referrerNewUser","chartType":"pie"}',
		layouts: {
			w: 6,
			h: 6,
			x: 6,
			y: 14,
			static: true
		}
	}]

	mobileTabData   = [{
		name: '日均活跃' + txt + '数',
		title: '一段时间内，平均每天使用应用的' + txt + '数（每日去重' + txt + '数加总除以天数，天之间不去重）',
		model: 'overview',
		graphId: 'activeUser-mobile',
		condition: '{"name":"activeUser","chartType":"line"}'
	},{
		name: '日均新增' + txt + '数',
		title: '一段时间内，平均每天首次使用应用的' + txt + '数（卸载之后重新安装不算新' + txt + '）',
		model: 'overview',
		graphId: 'newUser-mobile',
		condition: '{"name":"newUser","chartType":"line"}'
	},{
		name: '累积' + txt + '数',
		title: '截止所选时间终止日期，产品的累计去重' + txt + '数（选择5/1至6/1时，累积' + txt + '数取6/1号的数据，注：不支持渠道和版本筛选）',
		model: 'overview',
		graphId: 'totalUser-mobile',
		condition: '{"name":"totalUser","chartType":"line"}'
	},{
		name: '日均人均启动次数',
		title: '一段时间内，平均每个' + txt + '每日启动应用的次数（应用总启动次数除以总的' + txt + '数）',
		model: 'overview',
		graphId: 'avgTimes-mobile',
		condition: '{"name":"avgTimes","chartType":"line"}'
	}];

	mobileBoardData = [{
		name: '访问时长',
		title: '一段时间内，平均每个' + txt + '每日使用应用的时长（总的访问时长除以总的' + txt + '数）',
		model: 'overview',
		graphId: 'usetime-mobile',
		condition: '{"name":"usetime","chartType":"bar"}',
		layouts: {
			w: 6,
			h: 4,
			x: 0,
			y: 0,
			static: true
		}
	},{
		name: '新增' + txt + '次日留存率',
		title: '一段时间内，新增' + txt + '中第2日仍然使用应用的' + txt + '数占比',
		model: 'overview',
		graphId: 'retained-mobile',
		condition: '{"name":"retained","chartType":"line"}',
		layouts: {
			w: 6,
			h: 4,
			x: 6,
			y: 0,
			static: true
		}
	},{
		name: '新增' + txt + '留存率趋势图',
		title: '一段时间内，新增' + txt + '数中仍然使用应用的' + txt + '随着时间的变化趋势',
		model: 'overview',
		graphId: 'retentionTrend-mobile',
		condition: '{"name":"retentionTrend","chartType":"line"}',
		layouts: {
			w: 12,
			h: 4,
			x: 0,
			y: 4,
			static: true
		}
	},{
		name: '页面访问Top10',
		title: '一段时间内，启动最多的前10个页面以及这些页面占总体的比',
		model: 'overview',
		graphId: 'pageNewUser-mobile',
		rightTab: ['pageNewUser','pageActiveUser'],
		condition: '{"name":"pageNewUser","chartType":"table-chart"}',
		layouts: {
			w: 6,
			h: 6,
			x: 0,
			y: 8,
			static: true
		}
	},{
		name: '事件触发Top10',
		title: '一段时间内，触发最多的前10个自定义事件以及这些事件占整体的比例',
		model: 'overview',
		graphId: 'eventNewUser-mobile',
		rightTab: ['eventNewUser','eventActiveUser'],
		condition: '{"name":"eventNewUser","chartType":"table-chart"}',
		layouts: {
			w: 6,
			h: 6,
			x: 6,
			y: 8,
			static: true
		}
	},{
		name: '访问城市Top10',
		title: '一段时间内，使用应用' + txt + '最多的前10个城市',
		model: 'overview',
		graphId: 'cityNewUser-mobile',
		rightTab: ['cityNewUser','cityActiveUser'],
		condition: '{"name":"cityNewUser","chartType":"bar"}',
		layouts: {
			w: 6,
			h: 6,
			x: 0,
			y: 14,
			static: true
		}
	},{
		name: '设备型号Top10',
		title: '一段时间内，使用应用用户最多的前10个设备',
		model: 'overview',
		graphId: 'devicemodelNewUser-mobile',
		rightTab: ['devicemodelNewUser','devicemodelActiveUser'],
		condition: '{"name":"devicemodelNewUser","chartType":"bar"}',
		layouts: {
			w: 6,
			h: 6,
			x: 6,
			y: 14,
			static: true
		}
	},{
		name: 'APP版本Top10',
		title: '一段时间内，使用' + txt + '最多的前10个应用版本',
		model: 'overview',
		graphId: 'appversionNewUser-mobile',
		rightTab: ['appversionNewUser','appversionActiveUser'],
		condition: '{"name":"appversionNewUser","chartType":"pie"}',
		layouts: {
			w: 6,
			h: 6,
			x: 0,
			y: 20,
			static: true
		}
	},{
		name: '渠道来源Top10',
		title: '一段时间内，使用应用最多的前10个应用渠道',
		model: 'overview',
		graphId: 'appchannelNewUser-mobile',
		rightTab: ['appchannelNewUser','appchannelActiveUser'],
		condition: '{"name":"appchannelNewUser","chartType":"pie"}',
		layouts: {
			w: 6,
			h: 6,
			x: 6,
			y: 20,
			static: true
		}
	}]
}
initData('user');

class Manager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// 是否打开右侧筛选抽屉
			openFilter: false,
			tabData: [],
			boardData: []
		}
	}
	componentDidMount() {
		this.getData();
	}
	_renderBox(param, callback) {
		// 设置文案，用户or设备
		initData(param.type);
		// 找到所选的应用属于哪个平台
		let app = globalData.appList.find(item => {
			return item.appKey == param.appkey;
		}) || {};
		let platform = app.platform.toLowerCase();
		var tabData   = ['web', 'miniprogram'].indexOf(platform) > -1? webTabData : mobileTabData;
		var boardData = ['web', 'miniprogram'].indexOf(platform) > -1? webBoardData : mobileBoardData;
		this.setState({
			tabData: tabData,
			boardData: boardData
		}, () => {
			if (typeof callback == 'function') {
				callback();
			}
		})
	}
	onOpenWrawer(e) {
		const { openFilter } = this.state;
		this.setState({ openFilter: !openFilter });
	}
	/**
	 * 切换产品
	 */
	onProductChange() {
		// 先把右侧应用列表更新
		this.refs.filter.rebuild();
		// 然后执行查询
		this.getData();
	}
	getData() {
		let param = this.refs.filter.getParam();
		Object.assign(param, {
			channels: "all",
			versions: "all",
			productId: globalData.currProduct.id
		})
		this._renderBox(param, () => {
			this.refs.tabControl.getData(param);
			this.refs.boardControl.getData(param);
		});
	}
	render() {
		const { leftDrawerOpen } = this.props;
		const { openFilter, tabData, boardData } = this.state;
		return (
			<Wrapper content={ this }>
				<div styleName="filter" className={ leftDrawerOpen ? 'hide' : '' }onClick={ e => this.onOpenWrawer(e) }>
					筛选<Icon type="down" size="xs" style={{ marginverticalAlign: 'bottom' }}/>
				</div>
				<div className={ openFilter ? 'hide' : '' }>
					<TabControl ref="tabControl" boxData={ tabData }/>	
					<BoardControl ref="boardControl" boxData={ boardData }/>
				</div>
				<Filter
					ref="filter"
					open={ openFilter }
					onSearch={ e => this.getData(e) }
					onOpenChange={ e => this.onOpenWrawer(e) }
				>
				</Filter>
			</Wrapper>
		)
	}
}
const turnCss = CSSModules(Manager, styles, { allowMultiple: true });

export default turnCss;


