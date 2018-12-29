//总控制器
import _base 			from '../../../common/base';
import React 			from 'react';
import ReactDOM 		from 'react-dom';
import ReactGridLayout 	from '../../../../../plugins/react-grid-layout/react-grid-layout.min';
import Component 		from '../../../business/component/component';
import DashBox   		from './dashbox';
import DetailWin 		from './win';
import Loading from '../../../business/component/loading';

var Responsive = ReactGridLayout.Responsive;
var WidthProvider = ReactGridLayout.WidthProvider;
var ResponsiveReactGridLayout = WidthProvider(Responsive);
	
class Test extends React.Component {
	componentDidMount() {

	}
	render() {
		return (
			<h1>111</h1>
		)
	}
}
class Control extends React.Component{
	static defaultProps = {
		className: "layout",
		cols: {lg: 12, md: 12, sm: 12, xs: 12, xxs: 12},
		breakpoints : {lg: 1200},
		rowHeight: 84
	}
	$on(key, fn) {
		if(!this._list) {
			this._list = {};
		}
		if (!this._list[key]) {
			this._list[key] = [];
		}
		this._list[key].push(fn);
	}
	$emit() {
		var args = Array.prototype.slice.call(arguments);
		var key = args[0];
		var arrFn = this._list && this._list[key];
		if (!arrFn || arrFn.length === 0) {
			return;
		}
		for (var i = 0; i < arrFn.length; i++) {
			if( typeof arrFn[i] == 'function') {
				arrFn[i].apply(this, args);
			}
		}
	}
	constructor(props){
		super(props);
		this.state =  {
			dashboardId: '',
			boxData : [],
			editType: false,
			detailWin: null,
			param: {}
		};
	}
	componentDidMount(){
		$(window).unbind('beforeunload');
	}
	componentWillUnmount() {
		this.cancelAll();
	}
	//将改变后的位置保存到后端
	onLayoutChange(layout, layouts) {

		var changeNodes = [];
		for(var i=0; i<layout.length; i++){
			var node =layout[i];
			changeNodes.push({
				graphId: node.i.split('_')[1],
				dashboardId: this.state.dashboardId,
				w: node.w,
				h: node.h,
				x: node.x,
				y: node.y
			})
		}
		
		var param = {dashboardId: this.state.dashboardId, data: changeNodes};
		if (param.dashboardId === '') {
			return;
		}
		$.ajax({
			url: '/hwi/Dashboard/updateDGR',
			type: 'POST',
			contentType : 'application/json; charset=utf-8',
			data: JSON.stringify(param),
			beforeSend: function(xhr) {
				xhr.withCredentials = true;
			},
			xhrFields: {
				withCredentials: true
			},
			success: function(){

			},
			error: function(){

			}
		});
		
	}
	saveToLS(key, value) {
		if (localStorage) {
		localStorage.setItem('dashbord-layouts', JSON.stringify({
			[key]: value
		}));
		}
	}
	getFromLS(key) {
		let ls = {};
		if (global.localStorage) {
		try {
			ls = JSON.parse(localStorage.getItem('dashbord-layouts')) || {};
		} catch(e) {/*Ignore*/}
		}
		return ls[key];
	}
	/**
	 * 删除一个单图
	 * @param {*} graphId 
	 */
	deleteDGR(graphId){
		const { boxData } = this.state;
		let list = [];
		list = boxData.filter( item => {
			return item.graphId !== graphId;
		});
		this.setState({ boxData: list });
	}
	showDetailWin(param){
		param.dashboardId = this.state.dashboardId;
		if(this.state.detailWin){
			this.state.detailWin.destroy();
		}
		this.state.detailWin = new DetailWin({
			data: param
		}).$inject('#detailWinBox');
		this.state.detailWin.show();

		this.state.detailWin.changeEditType(this.state.editType);
		this.state.detailWin.$on('graphUpdate', function(event, graphObj){
			var boxData = this.state.boxData;
			for(var i=0; i<boxData.length; i++){
				if(boxData[i].graphId == graphObj.id){
					boxData[i].name 	 = graphObj.name;
					boxData[i].chartType = graphObj.chartType;
					boxData[i].condition = graphObj.condition;
				}
			}
			this.refs[graphObj.id].setName(graphObj.name);
			this.refs[graphObj.id].setParam(JSON.parse(graphObj.condition));
			this.refs[graphObj.id].getChartData();

		}.bind(this));
	}
	//通知每个box去服务端取数据
	getData(param){
		this.state.param = param;
		var boxData = this.state.boxData;
		var length = boxData.length;
		for(var i=0; i<boxData.length; i++){
			try {
				var box = boxData[i];
				var condition = this.formatCondition(box.condition, param);
				this.getGraphData(box.graphId, condition);
				
			} catch (error) {
				this.refs[box.graphId].ajaxError('查询有误，请检验该条件');
				this.$emit('ajax:complete', {errorCode: 10009});
			}
		}
	}
	/**
	 * 获取单个单图的数据
	 * @param {*单图id} graphId 
	 * @param {*单图查询的参数} condition 
	 */
	getGraphData(graphId, condition) {
		this.refs[graphId].setParam(condition);
		this.refs[graphId].getChartData(); //请求每个box的数据
		this.refs[graphId].$on('ajax:complete', function(eventName, data) {
			length = length -1;
			//token过期,立即触发 ajax:complete
			if(data.errorCode === 201) {
				this.$emit('ajax:complete', {errorCode: 201});
			} else {
				if(length < 1) {
					if(data.errorCode==11122) {
						_base.serverError(data.errorCode, data.message, true, 5000);
					}
				}
			}
		}.bind(this));
	}
	//通过外部传入数据
	setData(param, callback){
		var isAdmin = (_base.getRoleId()=='管理员')? true:false;
		//请求参数
		var urlMap  = {'event':'events/report', 
						'funnels':'Funnels/report' ,
						'ration':'retention/report' ,
						'addiction':'revisit/report',
						'userAttributes':'userAttribute/report',	
						'route':'behavior/report',
						'overview':'summary/get',
							'deviceRetention': 'retention/device/report',
							'path': 'behavior/pageview/report'
						};
		//每个模块对应的分析页面路径
		var linkMap = {'event':'/analytics/segmentation', 
						'funnels':'/analytics/funnels' ,
						'ration':'/analytics/retention' ,
						'userAttributes': '/analytics/user_attribute',	
						'route':'/analytics/behaviorpath',
						'addiction':'/analytics/addiction',
							'deviceRetention': '',
							'path': ''};
		var data = param.data;
		if(data.length>0){
			$('#noGraph').empty();
		}else{
			this.noGraph();
		}

		const { editType } = this.state;
		for(var i=0; i<data.length; i++){
			//宽高没设置的话默认为1
			var layouts = data[i].layouts;
			layouts.w = (isNaN(layouts.w) || layouts.w<3)? 3 : layouts.w;
			layouts.h = (isNaN(layouts.h) || layouts.h<3)? 3 : layouts.h;

			data[i].url 	 = urlMap[data[i].model];
			data[i].pageLink = linkMap[data[i].model] + '?graphId=' + data[i].graphId;
			if(isAdmin){
				//是管理员的话就当成是自己的
				data[i].isMy  = 1;
			}
		}
		
		this.setState({dashboardId: param.dashboardId, boxData: data}, () => {
			if (typeof callback === 'function') {
				callback();
			}
		});
	}
	/**
	 * 加入单图时，更新列表
	 * @param {*} graphList 
	 */
	addData(graphList) {
		let { dashboardId, boxData, param } = this.state;
		let ajaxMap = {};  // 以单图id为key，value为bool型，代表ajax请求是否完成

		// 获取新加入单图的详情信息
		let getGraph = (id) => {
			let ajaxObj = _base.ajax({
				type: 'GET',
				url: '/Dashboard/getGraph',
				data: { graphId: id },
				success: () => {},
				error: () => {}
			});
			return ajaxObj.promise;
		}

		// 将获取到详情的单图加入到列表中
		let addToList = (itemList) => {
			itemList.map( item => {
				item.graphId = item.id;
				item.layouts = {
					x: 0,
					y: 0,
					w: 6,
					h: 3
				};
			});
			
			let list = boxData.concat(itemList);
			let layoutList = [];
			list = this.adjuestLayout(list);
			list.map( item => {
				layoutList.push({
					i: this.state.dashboardId + '_' + item.graphId,
					w: item.layouts.w,
					h: item.layouts.h,
					x: item.layouts.x,
					y: item.layouts.y
				})
			})
			this.onLayoutChange(layoutList);

			this.setData({
				dashboardId: dashboardId,
				data: list
			}, () => {
				itemList.map( item => {
					let condition = this.formatCondition(item.condition, param);
					this.getGraphData(item.graphId, condition);
				});
			})
		}

		let resultList = [];
		graphList.map( id => {
			ajaxMap[id] = false;
			getGraph(id).then( (item) => {
				let complated = true;
				ajaxMap[id] = true;
				for(let key in ajaxMap) {
					complated = complated && ajaxMap[key];
				}
				// 将返回的结果保存起来
				if (item && item.data && item.data.relatedObject) {
					resultList.push(item.data.relatedObject);
				}
				// 等所有的ajax都完成了再更新视图
				if (complated) {
					addToList(resultList);
				}
			})
		});
	}
	clearData() {
		this.setState({
			dashboardId: '',
			boxData : [],
			editType: false,
			detailWin: null
		});
	}
	formatCondition(cond, param) {
		let condition = condition = JSON.parse(cond);
		condition.fromDate  = param.fromDate || condition.fromDate;
		condition.toDate    = param.toDate || condition.toDate;
		condition.deviceOs  = param.deviceOs || condition.deviceOs;
		if(condition.filter) {
			condition.filter['appid'] = param.appid || [];
		} else {
			condition['appid'] = param.appid || [];
		}
		if(typeof param.token !=='undefined') {
			condition.token  = param.token || condition.token;
		}
		condition.appid = param.appid.join(',');

		return condition;
	}
	//调整位置
	adjuestLayout(list){
		var that = this;
		var listInit   = []; //x、y都等于0的放这个数组里，按创建时间先后顺序排
		var listFormat = []; //已经排过位置的不动
		for(var i=0; i<list.length; i++){
			var box = list[i].layouts;
			if(box.x==0 && box.y==0){
				listInit.push(list[i]);
			}else{
				listFormat.push(list[i]);
			}
		}

		//将第一个x=0、y=0的当做已排好位置的
		if(listInit[0]){
			listFormat = [listInit[0]].concat(listFormat);
		}
		listFormat.sort(function(a, b){
			return a.layouts.y - b.layouts.y;
		})
		var len    = listFormat.length;
		listInit   = listInit.slice(1);
		listFormat = listFormat.concat(listInit);
		
		var xMax = that.props.cols.lg;

		for(var i=len; i<listFormat.length; i++){
			var preG = listFormat[i-1].layouts;  //前一个单图
			var curG = listFormat[i].layouts;  //当前单图
			if((preG.x+preG.w+curG.w)<=xMax){
				listFormat[i].layouts.x = preG.x+preG.w;
				listFormat[i].layouts.y = preG.y;
			}else{
				listFormat[i].layouts.x = 0;
				listFormat[i].layouts.y = preG.y+preG.h;
			}
		}
		return listFormat;
	}
	changeEditType(flag){
		const { boxData, param } = this.state;
		this.cancelAll();
		this.setState({
			editType: flag
		}, () => {
				this.getData(param);
		});
	}
	noGraph(){
		var menuList = localStorage.getItem('menuList');
			menuList = JSON.parse(menuList);
		var linkStr  = '';
		var result   = [];
		for(var i=0; i<menuList.length; i++){
			var item = menuList[i];
			item.url = item.url.replace('analytics/','');
			switch(item.name){

				case '事件分析':
					var className = 'demo-icon icon-event';
					result.push(item);
					linkStr += '<a class="graph-link" href="'+item.url+'" title="'+item.name+'"><i class="'+className+'"></i><span>事件分析</span></a>'
					break;
				case '漏斗分析':
					var className = 'demo-icon icon-funnels';
					result.push(item);
					linkStr += '<a class="graph-link" href="'+item.url+'" title="'+item.name+'"><i class="'+className+'"></i><span>漏斗分析</span></a>'
					break;
				case '路径分析':
					var className = 'demo-icon icon-route';
					result.push(item);
					linkStr += '<a class="graph-link" href="'+item.url+'" title="'+item.name+'"><i class="'+className+'"></i><span>路径分析</span></a>'
					break;
				case '留存分析':
					var className = 'demo-icon icon-retention';
					result.push(item);
					linkStr += '<a class="graph-link" href="'+item.url+'" title="'+item.name+'"><i class="'+className+'"></i><span>留存分析</span></a>'
					break;
				case '粘性分析':
					var className = 'demo-icon icon-addiction';
					result.push(item);
					linkStr += '<a class="graph-link" href="'+item.url+'" title="'+item.name+'"><i class="'+className+'"></i><span>粘性分析</span></a>'
					break;
				case '属性分析':
					var className = 'demo-icon  icon-attribute';
					result.push(item);
					linkStr += '<a class="graph-link" href="'+item.url+'" title="'+item.name+'"><i class="'+className+'"></i><span>属性分析</span></a>'
					break;

			}
		}
		
		$('#noGraph').html( '没有添加任何图表' +
							'<small>您可以通过右上角添加单图组建自己的看板，或者进入分析功能组建单图。</small>' +
							linkStr);
	}
	/**
	 * 取消所有查询
	 */
	cancelAll(){
		var boxData = this.state.boxData;
		for(var i=0; i<boxData.length; i++){
			var box = boxData[i];
			this.refs[box.graphId].cancelWhenLeave();
		}
	}
	render() {
		const { editType, boxData, dashboardId } = this.state;
		const { breakpoints, colspan, rowHeight }	= this.props;
		var items   		= [];

		for(var i=0; i<boxData.length; i++){
			var box = boxData[i];
			var layouts = box.layouts;
			items.push(
			<div
			key={ dashboardId+'_'+box.graphId }
			ref={ dashboardId+'_'+box.graphId }
			data-grid={{
				i: box.graphId.toString(),
				minW: 3,
				minH: 3,
				w: layouts.w,
				h: layouts.h, 
				x: layouts.x,
				y: layouts.y
			}}>
				<DashBox
				ref={box.graphId}
				dashboardId={dashboardId}
				url={box.url}
				pageLink={box.pageLink}
				title={box.name}
				model={box.model}
				isMy={box.isMy}
				graphId={box.graphId}
				onClickTitle={this.showDetailWin.bind(this)}
				box={box}
				editType={this.state.editType}
				onDeleteDGR={ e => this.deleteDGR(e) }></DashBox>
			</div>)
		}
		return (
			<div ref="layout">
			<ResponsiveReactGridLayout
				className="layout"
				breakpoints={breakpoints}
				cols={colspan}
				rowHeight={rowHeight}
				isDraggable={editType}
				isResizable={editType}
				onLayoutChange={this.onLayoutChange.bind(this)}>
				{items}
			</ResponsiveReactGridLayout>
			
			</div>
		);
	} 
}

export default Control;