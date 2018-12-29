//单个dashbox控制器
import _base 				from '../../../common/base';
import React 				from 'react';
import ReactDOM 			from 'react-dom';
import echarts    			from '../../../../../plugins/chartjs/echarts.common.min';
import BaseInfo 			from '../../../common/baseInfo';
import Loading      from '../../../business/component/loading';
import NoResult     from '../../../business/component/noResult';

let roleId = _base.getRoleId(); //当前用户的角色

class DashBox extends React.Component{
	static defaultProps = {
		url: '',
		title: '',
		pageLink: '',
		box: {},
		graphId: '',
		model: '',
		editType: false,
		onClickTitle: function(){},
		onDeleteDGR: function(){}
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
			loading: false,
			sessionId: 0,
			title: '',
			errorMsg: '',
			condition: {},
			dataSource: {},
			xhr: null,
			chartObj: {},
			tableObj: {}
		};
	}
	componentDidMount(){
		var bordCnt = $(this.refs.bord);
		bordCnt.sizeChanged(function(){
			if(this.state.chartObj && this.state.chartObj.resize){
				if(this.state.condition.chartType=='pie'){
					//事件分析的饼图
					var cntHeight  = bordCnt.find('div.chartCnt')[0].clientHeight;
					var rows       = bordCnt.find('div.row');
					var itemHeight = cntHeight/rows.length;
					
					if(itemHeight < 226){
						for(var i=0; i<rows.length; i++){
							rows.eq(i).css({height: '226px'});
						}
					}else{
						for(var i=0; i<rows.length; i++){
							rows.eq(i).css({height: itemHeight + 'px'});
						}
					}
					this.state.chartObj.resize();	
				}else{
					this.state.chartObj.resize();		
				}
			
			}
		}.bind(this));
		this.setState({title: this.props.title})
		bordCnt.resize();
	}
	componentWillUpdate(){

	}
	setName(name){
		this.setState({title: name});
	}
	//获取服务器数据
	//chartBack为true时查询合计数据
	getChartData(){
		var ssId = this.randomString();
		this.cancelOnce();
		this.setState({loading: true, sessionId: ssId, dataSource: {}}); 
		
		var URL       = this.props.url;
		var param 	  = $.extend(true,{},this.state.condition);
		var appid     = param.appid;
		var formatedP = this.formatParam(param) || {};
		formatedP.sessionId = ssId;

		if(this.props.model === 'event'){
			if(param.rollUpType === 'rollup') {
				URL = 'events/rollup';
			}
			//使用排序后的指标顺序
			formatedP.measures = param.originParam.measures.measures;
		}
		if(BaseInfo.getBaseInfo(URL)){
			formatedP.baseInfo = {};
			formatedP.baseInfo.userid = BaseInfo.getUserName();
			formatedP.baseInfo.entrance = BaseInfo.getEntrance();
			formatedP.baseInfo.caller = BaseInfo.getCaller();
		}
		var paramaa = {
			queryParam: formatedP,
			uri: URL,
			dashboardId: this.props.dashboardId
		}
		this.state.xhr = $.ajax({
			url  : '/hwi/Dashboard/query?productId='+(_base.getNowProductId() || localStorage.getItem('productId')),
			type : 'POST',
			headers: {appid: appid},
			contentType : 'application/json; charset=utf-8',
			data : JSON.stringify(paramaa),
			success : function(data){
				_base.delSessionID(ssId);
				if(data.success){
					this.setState({ errorMsg: '' });
					this.formatResult(data.relatedObject, param);
				}else{
					this.ajaxError();
				}
				this.setState({loading: false});
				this.$emit('ajax:complete', data);
			}.bind(this),
			error : function(e){
				if(e.statusText != "abort"){
					var msg = this.getErrorMsg(e.status);
					this.ajaxError(msg);
					this.setState({loading: false});
					_base.delSessionID(ssId);
					this.cancelOnce();
				}
				
				this.$emit('ajax:complete', e);
			}.bind(this)
		});
		_base.addSessionID(ssId, this.state.xhr);
	}
	//根据chartType等参数，筛选结果数据
	setChartData(){
		var data  = this.state.dataSource;
		var param = this.state.condition;
		this.formatResult(data, param, true);
	}
	setDataSource(dataSource){
		this.state.dataSource = dataSource;
		this.setState({dataSource: dataSource})
	}
	//设置查询参数
	setParam(param){
		for(var i in param){
			this.state.condition[i] = param[i];
		}
		this.setState({'condition': this.state.condition});
	}
	//根据模块筛选查询参数
	formatParam(param){
		var eventParam = paramMap[this.props.model];
		var appid = param['filter'] && param['filter'].appid || param.appid || [];
		for(var i in eventParam){
			eventParam[i] = param[i]? param[i]:eventParam[i];
		}
		if(eventParam.productKey != undefined){
			eventParam.productKey = _base.getNowProductId() || localStorage.getItem('productId');
		}
		if(this.props.model=='event'){
			
		}else if(this.props.model=='funnels'){
			try{
				var eventName = param.other.table.eventName;
				param.other.table.event = eventName;
				if(param.chartType === 'bar') {
					eventParam = paramMap[this.props.model];
					for(var i in eventParam){
						eventParam[i] = param.other[i] ? param.other[i] : eventParam[i];
					}
					for(var i in eventParam){
						eventParam[i] = param[i] ? param[i] : eventParam[i];
					}
				}
				eventParam.fromDate = param.fromDate;
				eventParam.toDate = param.toDate;
			}catch(e){
				eventParam = paramMap[this.props.model];
				for(var i in eventParam){
					eventParam[i] = param[i] ? param[i] : eventParam[i];
				}
				eventParam.fromDate = param.fromDate;
				eventParam.toDate = param.toDate;
			}
		}else if(this.props.model=='ration'){
			try{
				eventParam.firstEvent  = param.first_event;
				eventParam.secondEvent = param.second_event;
				eventParam.filter      = param.user_filter;
				eventParam.filter['appid'] = appid;
				delete eventParam.firstEvent.eventCname;
				delete eventParam.secondEvent.eventCname;
			}catch(e){}
		}else if(this.props.model=='addiction'){
			try{
				eventParam.event       = param.event_filter;
				eventParam.filter      = param.user_filter;
				eventParam.filter['appid'] = appid;
				eventParam.groupType = Number(eventParam.groupType);
				delete eventParam.event.eventCname;
			}catch(e){}
		}	
		
		return eventParam;
	}
	deleteComom(str) {
		try {
			if (str.indexOf('*~*') > -1) {
				str = str.split('*~*')[0];
			}
		} catch (error) {
			console.log(error)
		}
		return str;
	}
	/**
	 * 按model加载所需模块
	 * @param {*} data 
	 * @param {*} param 
	 * @param {*} isCache 是否是缓存的数据，如果是缓存的数据，显示设置是不需要重新渲染的
	 */
	formatResult(data,param,isCache){
		var model = this.props.model;	
		this.state.dataSource = data;
		if(!this.refs.table) {
			return;
		}
		this.refs.table.style.overflow = 'auto';
		if(model=='event'){
		Promise.all([
			import(
				/* webpackChunkName: "eventChartChunk" */
				'../../event/module/chart'
			),
			import(
				/* webpackChunkName: "eventTableChunk" */
				'../../event/module/table'
			),
			import(
				/* webpackChunkName: "eventDataFormatterChunk" */
				'../../event/module/dataFormatter'
			)
		]).then(([BehaviorChart, BehaviorTable, BehaviorFormatter]) => {
			this.refs.table.innerHTML = '';
			this.refs.chart.innerHTML = '';
			var condition   = this.state.condition; 

			if(condition.chartType=='pie'){
				//兼容老数据，如果是饼图，一定是汇总数据
				condition.rollUpType = 'rollup';
			}
			var dataFormatter 	 = new BehaviorFormatter.default();
			condition.chartType  = condition.chartType? condition.chartType:'';
			condition.rollUpType = condition.rollUpType? condition.rollUpType:'detail';
			condition.compare    = false;  //看板不展示对比数据
			try {
				if (condition.measuresConf) {
					for (var i = 0; i < condition.measuresConf.length; i += 1) {
						condition.measuresConf[i] = this.deleteComom(condition.measuresConf[i]);
					}
				}
				for (var j = 0; j < condition.originParam.measures.beforeSort.length; j += 1) {
					if (condition.originParam.measures.beforeSort[j]['aggregator']) {
						condition.originParam.measures.beforeSort[j]['aggregator'] = this.deleteComom(condition.originParam.measures.beforeSort[j]['aggregator']);
					}
				}
			} catch (error) {
				console.log(error);
			}
			//设置指标逻辑
			dataFormatter.setMeasure(condition.originParam.measures);
			dataFormatter.setByvalueName(condition.originParam.by_fields.byName);
			if(condition.rollUpType == 'detail'){
				//明细数据
				dataFormatter.setData(data);
			}else{
				//汇总数据
				dataFormatter.setDataTotal(data);
			}
			if(condition.chartType =='table'){
				var tableObj 	= new BehaviorTable.default({}).$inject(this.refs.table);
				if (data.rows.length == 0) {
					tableObj.showMessage('查询无数据');
				} else {
					tableObj.showMessage('');
					tableObj.renderTable(condition, dataFormatter);
					this.state.tableObj = tableObj;
				}
				
			}else{
				var chartObj 	= new BehaviorChart.default({}).$inject(this.refs.chart);
				if (data.rows.length == 0) {
					chartObj.showMessage('查询无数据');
				} else {
					chartObj.showMessage('');
					chartObj.renderChart(condition, dataFormatter);
					this.state.chartObj = chartObj;
				}
				
			}

			this.$emit('dataLoaded',dataFormatter,isCache);
		})
		}else if(model=='funnels'){
		Promise.all([
			import(
				/* webpackChunkName: "funnelChartChunk" */
				'../../../business/analyzeChart/funnel'
			),
			import(
				/* webpackChunkName: "funnelTableChunk" */
				'../../../business/analyzeTable/funnel'
			),
			import(
				/* webpackChunkName: "chartFunnelChunk" */
				'../../funnel/module/chartFunnel'
			)
		]).then(([FunnelChart, FunnelTable, ChartFunnel]) => {	
			var rowsObj = this.getFunnelDataChange(data, param);
			var rows = rowsObj.rows;
			var oldRows = rowsObj.oldRows;
			//将rows按照属性totalPeople降序排列
			//维度不是“全部”的话才排序
			if(param.other && param.other.table) {
				try {
					if(param.other.table.byField['field'] != ''){
						rows.sort(function(a, b){
							return b.totalPeople - a.totalPeople;
						});
					}
				} catch (error) {
				}
			} else {
				param.other = {
					table: {}
				};
			}
			if(this.state.condition.chartType =='table'){
				var noResult = false;
				this.refs.table.innerHTML = '';
				var container   = this.refs.table;
				if(rows.length) {
					noResult = false;
				} else {
					noResult = true;
				}
				var event_table = new FunnelTable.default({
					data: {
						loadingState: 'hide',
						noResult: noResult,
						error: '',
						_data: rows,
						_oldData: oldRows,
						class: 'auto',
						_param: {
							fromDate: param.other.fromDate,
							toDate: param.other.toDate,
							byField: param.other.table.byField,
							headData: param.other.table.headData,
							viewConfigCheckedData : param.other.table.viewConfigCheckedData
						}
					}
				}).$inject(container);
				param.other.table.eventMark = true;
				event_table.setParam(param.other.table);
				event_table.$on('detail', function(data) {
					if(!data) return;
					if(data.type === 'close') {
						data.data.item.detail = '';
					}
					if(data.type === 'open') {
						data.data.item.detail = {
							rows: data.data.item.rowDetails,
							error: ''
						};
					}
					event_table.$update();
				});
				this.state.tableObj = event_table;
			}else if(this.state.condition.chartType == 'line'){
				this.refs.chart.innerHTML = '';
				var container   = this.refs.chart;
				var event_chart = new FunnelChart.default({
					data: {
						loadingState: 'hide',
						_data: rows,
						_oldData: oldRows,
						_param: {
							fromDate: param.other.fromDate,
							toDate: param.other.toDate,
							byField: param.other.table.byField,
							viewConfigCheckedData : param.other.table.viewConfigCheckedData
						},
						//style: 'height:225px'
					}
				}).$inject(container);
				this.state.chartObj = event_chart;
			} else {
				this.refs.chart.innerHTML = '';
				var $container   = $(this.refs.chart);
				var index = -1;
				if(typeof param.other.table.index !== 'undefined') {
					index = param.other.table.index;
				}
				$container.addClass('dashboardFunnel');
				let funnelObj = $.extend(true,{},ChartFunnel.default);
				funnelObj.init({$container: $container, MaxHeight: 150});
				funnelObj.setData({steps: data.steps, 
						cnameMap: data.cnameMap, propertyMap: data.propertyMap, 
						percent: data.totalStep.percent, totalStep: data.totalStep,
						index: index,
						alias: param.alias || []
				});
				funnelObj.off('change');	
				funnelObj.on('change', function(triggerName, data) {
					this.$emit('ChartFunnelChange', data);
					setTimeout(function() {
						ChartFunnel.resize();
					}, 0);
				}.bind(this));	
				this.state.chartObj = funnelObj;
			}
			this.$emit('dataLoaded', data);
		})
		}else if(model=='ration'){
		Promise.all([
			import(
				/* webpackChunkName: "retentionChartChunk" */
				'../../../business/analyzeChart/retention'
			),
			import(
				/* webpackChunkName: "retentionTableChunk" */
				'../../../business/analyzeTable/retention'
			)
		]).then(([RationChart, RationTable]) => {
			var rows = [];
			if(data.byField != ''){    //选的是全部就不用构建了
				for(var i=0; i<data.rows.length; i++){   
					if(param.viewConfigCheckedData.indexOf(data.rows[i].byValue) > -1) {
						rows.push(data.rows[i]);
					}
				}
			} else {
				rows = data.rows;
			}
			if(this.state.condition.chartType =='table'){
				var noResult = false;
				if(rows.length) {
					noResult = false;
				} else {
					noResult = true;
				}
				this.refs.table.innerHTML = '';
				var container   = this.refs.table;
				var event_table = new RationTable.default({
					data: {
						loadingState: 'hide',
						_showFlag: param._showFlag || 'showPeople',
						noResult: noResult,
						error: '',
						_data: rows,
						_oldData: data.rows,
						_param: {
							firstEvent: param.firstEvent,
							secondEvent: param.secondEvent,
							filter: param.filter,
							fromDate: param.fromDate,
							toDate: param.toDate,
							duration: param.duration,
							unit: param.unit,
							byField: param.byField,
							viewConfigCheckedData: param.viewConfigCheckedData
						}
					}
				}).$inject(container);
				param.eventMark = true;
				param.first_event = param.firstEvent;
				param.second_event = param.secondEvent;
				param.user_filter = param.filter;
				event_table.setParam(param);
				this.state.tableObj = event_table;
				setTimeout(function() {
					event_table.setStatic(); 
				}.bind(this), 0);
				//详情
				event_table.$on('detail', function(data) {
					if(!data) return;
					if(data.type === 'close') {
						data.data.item.detail = '';
					}
					if(data.type === 'open') {
						data.data.item.detail = {
							rows: [],
							error: ''
						};
						data.data.item.detail.loading = true;
						this.detailRetention(event_table, param, data.data.item);
					}
					event_table.$update();
				}.bind(this));
			}else{
				this.refs.chart.innerHTML = '';
				var container   = this.refs.chart;
				var event_chart = new RationChart.default({
					data: {
						loadingState: 'hide',
						_data: rows,
						_oldData: data.rows,
						_showFlag: param._showFlag || 'showPeople',
						_param: {
							firstEvent: param.firstEvent,
							secondEvent: param.secondEvent,
							filter: param.filter,
							fromDate: param.fromDate,
							toDate: param.toDate,
							duration: param.duration,
							unit: param.unit,
							byField: param.byField,
							viewConfigCheckedData: param.viewConfigCheckedData
						},
						//style: 'height:225px'
					}
				}).$inject(container);
				this.state.chartObj = event_chart;
			}
			this.$emit('dataLoaded', data);
		})
		}else if(model=='addiction'){
		Promise.all([
			import(
				/* webpackChunkName: "addictionTableChunk" */
				'../../../business/analyzeTable/addiction'
			)
		]).then(([AddictTable]) => {
			var rows = [];
			data.rows.sort(function(a, b){
				return b.totalPeople - a.totalPeople;
			});
			if(data.byField != ''){    //选的是全部就不用构建了
				for(var i=0; i<data.rows.length; i++){   
					if(param.viewConfigCheckedData.indexOf(data.rows[i].byValue) > -1) {
						rows.push(data.rows[i]);
					}
				}
			} else {
				rows = data.rows;
			}
			//if(this.state.condition.chartType =='table'){
			var noResult = false;
			if(rows.length) {
				noResult = false;
			} else {
				noResult = true;
			}
			this.refs.table.innerHTML = '';
			var container   = this.refs.table;
			param.headData = param.headData || [];
			var event_table = new AddictTable.default({
				data: {
					loadingState: 'hide',
					_showFlag: param._showFlag || 'showPeople',
					noResult: noResult,
					error: '',
					_data: rows,
					_oldData: data.rows,
					_param: param
				}
			}).$inject(container);
			param.eventMark = true;
			param.event_filter = param.event;
			param.user_filter = param.filter;
			param.user_filter = param.filter;
			event_table.setParam(param);
			this.state.tableObj = event_table;
			setTimeout(function() {
				event_table.setStatic(); 
			}.bind(this), 0);
			//详情
			event_table.$on('detail', function(data) {
				if(!data) return;
				if(data.type === 'close') {
					data.data.item.detail = '';
				}
				if(data.type === 'open') {
					data.data.item.detail = {
						rows: [],
						error: ''
					};
					data.data.item.detail.loading = true;
					this.detailAddiction(event_table, param, data.data.item);
				}
				event_table.$update();
			}.bind(this));
			//}
			this.$emit('dataLoaded', data);
		})
		}else if(model=='userAttributes') {
		Promise.all([
			import(
				/* webpackChunkName: "userAttributesChartToolsChunk" */
				'../../userAttributes/module/chartTools'
			),
			import(
				/* webpackChunkName: "userAttributesChartViewChunk" */
				'../../userAttributes/module/chartView'
			),
			import(
				/* webpackChunkName: "userAttributesTableChunk" */
				'../../userAttributes/module/table'
			)
		]).then(([UserAttributesTools, UserAttributesChartView, UserAttributesTable]) => {

			if(this.state.condition.chartType =='table'){
				this.refs.table.innerHTML = '';
				var container   = this.refs.table;
				var userAttributes_table = new UserAttributesTable.default().$inject(container);
				for(var i in param.originParam){
					param[i] = param.originParam[i];
				}
				userAttributes_table.setHeadTitle(param.choiceUserAttrCname);
				userAttributes_table.setSource({data: data.rows});
				this.state.tableObj   = userAttributes_table;
			} else {
				this.refs.chart.innerHTML = '';
				var container   = this.refs.chart;
				var userAttributes_chart = new UserAttributesChartView.default().$inject(container);
				var toolObj  = new UserAttributesTools.default().$inject(container);
				this.state.chartObj = userAttributes_chart;
				toolObj.$on('configChange',function(data){
					userAttributes_chart.setSource({data: data});
					toolObj.destroy();
				});
				toolObj.setSource({dataRow: data.rows, choiceData: param.choiceData || { pie: [], bar: [] }, chartType: param.chartType || 'bar', choiceUserAttrCname: param.choiceUserAttrCname});
				this.$emit('dataLoaded', {dataRow: data.rows, choiceData: param.choiceData || { pie: [], bar: [] }, chartType: param.chartType || 'bar', choiceUserAttrCname: param.choiceUserAttrCname});
			}
		})
		}else if(model=='route' || model=='path'){
		Promise.all([
			import(
				/* webpackChunkName: "userRouteChartViewChunk" */
				'../../userRoute/module/chartView'
			)
		]).then(([ChartRoute]) => {

			this.refs.table.innerHTML = '';
			this.refs.chart.innerHTML = '';
			var condition   = this.state.condition; 
			var chartObj 	= new ChartRoute.default({
				data: {
					isDashboard: true
				}
			}).$inject(this.refs.chart);
			chartObj.setParam(param);
			chartObj.refresh(data);
			chartObj.showPathByStall(5);
			this.state.chartObj = chartObj;
			this.$emit('dataLoaded');
		})
		}else if(model=='deviceRetention'){
			Promise.all([
				import(
					/* webpackChunkName: "deviceRetentionChartChunk" */
					'../../deviceRetention/module/chart'
				),
				import(
					/* webpackChunkName: "deviceRetentionTableChunk" */
					'../../deviceRetention/module/table'
				)
			]).then(([Chart, Table]) => {
				var noResult = false;
				if(data.rows.length) {
					noResult = false;
				} else {
					noResult = true;
				}
				if(this.state.condition.chartType =='table'){
					this.refs.table.innerHTML = '';
					
					var container   = this.refs.table;
					container.style.overflow = 'initial';
					var event_table = new Table.default({
						data: {
							loadingState: 'hide',
							_showFlag: param._showFlag || 'showPercent',
							noResult: noResult,
							error: '',
							_data: data.rows,
							byField: data.byField,
							bordType: this.props.bordType,
							boxHeight: container.offsetHeight,
							editType: this.props.editType,
							_param: {
								firstEvent: param.firstEvent,
								secondEvent: param.secondEvent,
								filter: param.filter,
								fromDate: param.fromDate,
								toDate: param.toDate,
								duration: param.duration,
								unit: param.unit,
								byField: param.byField,
								viewConfigCheckedData: param.viewConfigCheckedData
							}
						}
					}).$inject(container);
					param.eventMark = true;
					param.first_event = param.firstEvent;
					param.second_event = param.secondEvent;
					param.user_filter = param.filter;
					event_table.renderTable({byField: data.byField, _data: data.rows, _showFlag: param._showFlag});
					this.state.tableObj = event_table;
				}else{
					var rowsObj = this.getDeviceRetention(data, param);
					var rows = rowsObj.rows;
					var viewConfigCheckedData = rowsObj.viewConfigCheckedData;
					this.refs.chart.innerHTML = '';
					var container   = this.refs.chart;
					var event_chart = new Chart.default({
						data: {
							loadingState: 'hide',
							_data: rows,
							noResult: noResult,
							_showFlag: param._showFlag || 'showPercent',
							_param: {
								fromDate: param.fromDate,
								toDate: param.toDate,
								duration: param.duration,
								unit: param.unit,
								viewConfigCheckedData: viewConfigCheckedData
							}
						}
					}).$inject(container);
					event_chart.renderChart({noResult: noResult, _data: rows, _showFlag: param._showFlag});
					this.state.chartObj = event_chart;
				}
				this.$emit('dataLoaded', data);
			})
	    }
   }
	//查询报错
	ajaxError(msg){
		const { model } = this.props;
		var modelName = nameMap[model];
		var msg = msg?  msg : '查询有误,请前往【'+modelName+'】页检验该条件';
		if(model == 'deviceRetention' || model == 'path') {
			msg = '查询失败，请重新提交请求';
		}
		this.setState({ errorMsg: msg });
	}
	//跳转到分析页
	linkToAnal(e){
		e.stopPropagation();
		location.href = this.props.pageLink+'#nowProductId='+_base.getNowProductId()+'=';
	}
	//删除单图
	onDeleteGraph(e){
		e.stopPropagation();
		const { graphId, dashboardId } = this.props;
		var that    = this;
		var param   = {graphId: this.props.graphId, dashboardId: this.props.dashboardId}
		var delBook = function(){
			$.ajax({
				url : '/hwi/Dashboard/deleteDGR',
				type : 'POST',
				contentType : 'application/json; charset=utf-8',
				data: JSON.stringify(param),
				success : function(data){
					if(data.success){
						//location.reload();
						that.props.onDeleteDGR(graphId);
					}else{
						alert('删除失败');
						//this.$emit('bookDeleteFailed');
					}
				}.bind(this),
				error : function(){
					alert('删除失败');
					//this.$emit('bookDeleteFailed');
				}.bind(this)
			})
		}

		$('#confirmModal').find('.modal-body >p').text('确定要删除吗？');
		$('#confirmModal').modal({
			backdrop: false,
			show: true
		});
		$('#confirmModal').off('click');
		$('#confirmModal').on('click', '.ok' ,function() {
			delBook();
			$('#confirmModal').modal('hide');
		}.bind(this));
		$('#confirmModal').on('click', '.cancel' ,function() {
			$('#confirmModal').modal('hide');
		});
	}
	//点击title事件
	showDetail(e){
		e.stopPropagation();
		var param = {
			dashboardId: this.props.dashboardId,
			url   		: this.props.url,
			title 		: this.state.title,
			isMy        : this.props.isMy,
			model 		: this.props.model,
			pageLink    : this.props.pageLink,
			graphId  	: this.props.graphId,
			condition	: this.state.condition
		}
		var num = 0;
		for( var item in this.state.dataSource){
			num++;
		}
		if(num>0){
			param.dataSource = $.extend(true,{},this.state.dataSource);
		}
		param = $.extend(true, {}, param);
		this.props.onClickTitle(param);

	}
	//ajax: 留存获取详情数据
	detailRetention(table, param ,item) {
		var appid = param.appid;
		param = this.formatParam(param);
		param = $.extend(true,{'byFieldFilter':[item.byValue]}, param || {});
		delete param.firstEvent.eventCname;
		delete param.secondEvent.eventCname;
		
		$.ajax({
			url     : '/hwi/Dashboard/query?productId='+_base.getNowProductId(),
			type: 'POST',
			headers: {appid: appid},
			contentType : 'application/json; charset=utf-8',
			data    : JSON.stringify({
				queryParam: param,
				uri: 'retention/detail',
				dashboardId: this.props.dashboardId
			}),
			success : function(data){
				item.detail.loading = false;
				if(data.success) {
					item.detail.error = '';
					item.detail.rows = data.relatedObject.rows;
				} else {
					item.detail.error = this.getErrorMsg(data.errorCode);
				}
				table.$update(); 
				setTimeout(function() {
					table.setStatic(); 
				}.bind(this), 0);
			}.bind(this),
			error   : function(e){
				item.detail.loading = false;
				item.detail.error = this.getErrorMsg(e.status);
				table.$update();
			}.bind(this)
		});
	}
	//ajax: 粘性获取详情数据
	detailAddiction(table, param ,item) {
		var appid = param.appid;
		param = this.formatParam(param);
		param = $.extend(true,{'byFieldFilter':[item.byValue]}, param || {});
		delete param.headData;
		delete param.event.eventCname;
		$.ajax({
			url     : '/hwi/Dashboard/query?productId='+_base.getNowProductId(),
			type: 'POST',
			headers: {appid: appid},
			contentType : 'application/json; charset=utf-8',
			data    : JSON.stringify({
				queryParam: param,
				uri: 'revisit/detail',
				dashboardId: this.props.dashboardId
			}),
			success : function(data){
				item.detail.loading = false;
				if(data.success) {
					item.detail.error = '';
					item.detail.rows = data.relatedObject.rows;
				} else {
					item.detail.error = this.getErrorMsg(data.errorCode);
				}
				table.$update(); 
				setTimeout(function() {
					table.setStatic(); 
				}.bind(this), 0);
			}.bind(this),
			error   : function(e){
				item.detail.loading = false;
				item.detail.error = this.getErrorMsg(e.status);
				table.$update();
			}.bind(this)
		});
	}
	randomString(len) {
	　　len = len || 32;
	　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
	　　var maxPos = $chars.length;
	　　var pwd = '';
	　　for (var i=0; i < len; i++) {
	　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	　　}
	　　return pwd;
	}
	onPanelClick(e){
		e.stopPropagation();
	}
	getErrorMsg(code){
		return _base.getErrorMsg(code);
	}
	/**
	 * 页面刷新、跳转、关闭时执行
	 */
	cancelWhenLeave(){
		if(this.state.sessionId==0){
			return;
		}

		//前端js取消xhr请求
		var xhr = this.state.xhr;
		if(xhr && xhr.abort){
			xhr.abort();
		}
		(new Image).src = '/hwi/events/cancel?' +
		'sessionId='+this.state.sessionId +
		'&baseInfo.userid='+BaseInfo.getUserName()+
		'&baseInfo.entrance='+BaseInfo.getEntrance()+
		'&baseInfo.caller='+BaseInfo.getCaller();
	}
	/**
	 * cancel一个查询
	 */
	cancelOnce(){
		if(this.state.sessionId==0){
			return;
		}
		$.ajax({
			type	: 'GET',
			url		: '/hwi/events/cancel',
			data	: {
				'sessionId': this.state.sessionId,
				'baseInfo.userid': BaseInfo.getUserName(),
				'baseInfo.entrance': BaseInfo.getEntrance(),
				'baseInfo.caller': BaseInfo.getCaller()
			},
			success	: function(ff){
				console.log('取消上次查询：'+ff);
			}
		});
		//前端js取消xhr请求
		var xhr = this.state.xhr;
		if(xhr && xhr.abort){
			xhr.abort();
		}
	}
	render() {
		const { box } = this.props;
		const { loading, errorMsg } = this.state;
		var chartType = this.state.condition.chartType;
		var refresh = <i className ="demo-icon icon-23" ></i>;
		var istable = (chartType=='table');
		var model = this.props.model;
		if(model == 'addiction') {
			istable = true;
		}
		var chartShow = istable? 'hide':'show';
		var tableShow = istable? 'show':'hide';
		if (errorMsg!=='') {
			chartShow = 'hide';
			tableShow = 'hide';
		}
		var editType  = this.props.editType;
		var pageLinkIsShow = true;
		var deleBtnIsShow  = false;
		var zoom = true;
		if(box.isMy || roleId == '管理员'){
			// 只有管理员，或者单图的创建者才能跳转到分析页
			pageLinkIsShow = true;
		}else{
			pageLinkIsShow = false;
		}
		if(editType){
			deleBtnIsShow = true;
			zoom = false;
		}
        //内置单图，次日设备留存，跳转
		if(model == 'deviceRetention' || model == 'path') {
			pageLinkIsShow = false;
		}
		var rightTool = (<div className="btn-group">
							<i onClick={ e => this.linkToAnal(e) } className={"demo-icon icon-mail-reply-all "+( pageLinkIsShow ? "":"hide")} style={{"color":"#666"}} title="进入分析页面"></i>
							<i onClick={ e => this.onDeleteGraph(e) } className={"demo-icon icon-dustbin "+(deleBtnIsShow? "":"hide")} title="删除"></i>
							<i onClick={ e => this.showDetail(e) } className={"demo-icon icon-enlarge topRightEdit "+(zoom? "":"hide")} title="放大"></i>
							<i onClick={ e => this.showDetail(e) } className={"demo-icon icon-15 topRightEdit "+(editType? "":"hide")} title="编辑"></i>
						</div>);

		return 	(<div className="bord" ref="bord">
					<div className ="head clearfix">
						<div>
							<h3>
								<span className ="title" title={ this.state.title }><span className="autocut">{this.state.title}</span></span>
								<small className ="subtitle"></small>
							</h3>
						</div>
						<div className ={"pull-right "}>
							{rightTool}
						</div>
					</div>
					<div className ="body" >
						<div onClick={this.onPanelClick.bind(this)} className={chartShow+" chartBox dashboardCnt"} ref="chart">
						
						</div>
						<div onClick={this.onPanelClick.bind(this)} className={tableShow+" tableBox dashboardCnt"} ref="table">
						
						</div>
						{
							errorMsg!=='' ? <NoResult message={ errorMsg } /> : null
						}
						{
							loading ? <Loading></Loading> : null
						}
					</div>
				</div>);
	}
	//漏斗数据处理
	getFunnelDataChange(data, param) {
		var rows = [];
		var tapRows = [];
		if(param.chartType !== 'bar') {
			tapRows = data.rows;
		} else {
			tapRows = data.totalStep.rows;
		}
		if(param.chartType !== 'bar') {
			if(param.other && param.other.table && param.other.table.byField) {
				if(param.other.table.byField.field != ''){    //选的是全部就不用构建了
					for(var i=0; i<tapRows.length; i++){   
						if(param.other.table.viewConfigCheckedData.indexOf(tapRows[i].byValue) > -1) {
							rows.push(tapRows[i]);
						}
					}
				} else {
					rows = tapRows;
				}
			}
		} else {
			rows = tapRows;
		}
		return {
			rows: rows,
			oldRows: tapRows
		};
	}
	//内置单图，设备留存数据处理
	getDeviceRetention(data, param) {
		var viewConfigCheckedData = [];
		var rows = [];
		if(param.viewConfigCheckedData) {
			viewConfigCheckedData = param.viewConfigCheckedData;
			for (var i = 0; i < data.rows.length; i++) {
				if (param.viewConfigCheckedData.indexOf(data.rows[i].byValue) > -1) {
					rows.push(data.rows[i]);
				}
			}
		} else {
			for (var i = 0; i < 5; i++) {
				if(data.rows[i]) {
					rows.push(data.rows[i]);
					viewConfigCheckedData.push(data.rows[i].byValue);
				}
			}
		}

		return {
			rows: rows,
			viewConfigCheckedData: viewConfigCheckedData
		};
	}
}

//根据模块获取参数,传给后端的必须参数，不能多也不能少
var paramMap = {
	event : {
		measures: [],
		byFields: [],
		filter: {},
		fromDate: '',
		toDate:'',
		unit: 'day',
		useCache: true,
		dashboard: true
	},
	funnels : {
		useCache : true,
		dashboard: true,
		fromDate: '',
		toDate:'',
		duration: '',
		unit: '',
		steps: [],
		filter: {
			conditions: []
		}
	},
	ration : {
		firstEvent : {},
		secondEvent : {},
		filter : {},
		byField : {},
		unit : "day",
		duration : "7",
		fromDate: '',
		toDate:'',
		useCache : true,
		dashboard: true
	},
	addiction : {
		unit : "day",
		event : {},
		byField : {},
		filter : {},
		groupType : 0,
		customGroups : [],
		fromDate: '',
		toDate:'',
		useCache : true,
		dashboard: true
	},
	userAttributes : {
		byFields : {},
		filter: {},
		dashboard: true,
		useCache : true,
		productKey: _base.getNowProductId()
	},
	route: {
		duration: "30",
		eventFilters: [],
		eventNames: [],
		fromDate: '',
		toDate: '',
		sourceEvent: {},
		sourceType: "0",
		unit: "min",
		userFilter: {},
		useCache : true,
		dashboard: true
	},
	//设备留存
	deviceRetention: {
		firstEvent : {},
		secondEvent : {},
		filter : {},
		byField : {},
		unit : "day",
		duration : "1",
		fromDate: '',
		toDate:'',
		useCache : true,
		dashboard: true
	},
	path: {
		model: 'path',
		sourceType: 'INITIAL_EVENT',
		deviceType: 'APP',
		fromDate: '',
		toDate:'',
		useCache : true,
		dashboard: true
	}
}

//模块对应的名称
var nameMap = {
	event : '事件分析',
	funnels : '漏斗分析',
	ration : '留存分析',
	addiction : '粘性分析',
	userAttributes : '属性分析'
}

export default DashBox;