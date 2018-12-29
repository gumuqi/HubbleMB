//单个dashbox控制器
import React from 'react';
import CSSModules from 'react-css-modules';

import Icon from 'antd-mobile/lib/icon';

import _echart from '../../../../lib/chartjs/echarts.common.min'
import fetch from '../../../../components/fetch';
import Util from '../../../../components/util';

import styles from './index.less';

let pageActive = true;
function listenPageActive() {
	var hiddenProperty = 'hidden' in document ? 'hidden' :    
	'webkitHidden' in document ? 'webkitHidden' :    
	'mozHidden' in document ? 'mozHidden' :    
	null;
	var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
	var onVisibilityChange = function(){
			if (document[hiddenProperty]) {
				pageActive = false;
			} else {
				pageActive = true;
			}
	}
	document.addEventListener(visibilityChangeEvent, onVisibilityChange);
}
listenPageActive();

/**
 * 数字类型的单图
 */
class Number_Chart extends React.Component {
	static defaultProps = {
		result: { 
			"-": "-",
			"-": "-"
		}
	}
	constructor(props){
		super(props);
		this.state = {
			chartObj: {},
			todayNum: 0 // 今天的值
		}
	}
	componentDidMount() {
		this.state.chartObj = _echart.init(this.refs.chart);
		this.initChart();
		this.refreshChart();
	}
	/**
	 * 组件更新完成后，渲染图表
	 */
	componentDidUpdate() {
		this.refreshChart();
	}
	formatResult(result){
		let num = [];
		for(var date in result){
			num.push({
				date: date,
				value: result[date]
			});
		}
		num.sort((a, b) => {
			return a.date - b.date;
		})
		return num;
	}
	initChart() {
		let option = {
			xAxis:  {
				type: 'value',
				axisLabel: {
					textStyle: {
						color: '#333',
						fontFamily: 'MicrosoftYaHeiLight'
					},
				},
				axisLine: {
					lineStyle: {
						color: '#ccc'
					}
				},
				splitLine: {
					lineStyle: {
						color: '#e6e6e6'
					}
				}
			},
			yAxis: {
				type: 'category',
				axisLabel: {
					textStyle: {
						color: '#333',
						fontFamily: 'MicrosoftYaHeiLight'
					}
				},
				axisLine: {
					lineStyle: {
						color: '#ccc'
					}
				},
				splitLine: {
					lineStyle: {
						color: '#e6e6e6'
					}
				}
			},
			series: [
				{	
					name: '昨日总量',
					type: 'bar',
					data: [],
					itemStyle: {
						normal: {
							color: '#f1bf51',
						}
					}
				},{	
					name: '今日累计',
					type: 'bar',
					data: [],
					itemStyle: {
						normal: {
							color: '#4876d4'
						}
					}
				}
			]
		};

		//this.state.chartObj.setOption(option);
	}
	refreshChart(){
		let result = this.props.result;
		result = this.formatResult(result);
		if(!result || result.length!==2){
			return;
		}
		
		let yesdayValue = result[0].value;
		let todayValue = result[1].value;
		let maxValue = Math.max(yesdayValue, todayValue)*1.2.toFixed(2);
		let option = {
			grid: {
				left: '10%',
				right: '10%',
				bottom: '10%',
				top: '4%',
				containLabel: true
			},
			xAxis:  {
				type: 'value',
				splitNumber: 3,
				max: maxValue,
				axisLabel: {
					color: '#fff'
				},
				axisPointer: {
					show: true,
					value: yesdayValue,
					snap: true,
					lineStyle: {
							color: '#979797',
							type: 'dashed',
							width: 1
					},
					label: {
							show: true,
							margin: 10,
							formatter: Util.formatNum(yesdayValue) + '(昨日总量)',
							backgroundColor: 'transparent',
							color: '#9b9b9b'
					},
					handle: {
						show: true,
						icon: 'none',
						color: '#004E52'
					}
				},
				splitLine: {
					show: false
				}
			},
			yAxis: {
				type: 'category',
				data: ['']
			},
			series: [
				{	
					type: 'bar',
					data: [todayValue],
					barWidth: 20,
					itemStyle: {
						normal: {
							color: '#4876D3',
						}
					}
				}
			]
		};
	
		this.state.chartObj.setOption(option);
	}
	/**
	 * 计算参考线的值
	 */
	getCanValue(result) {
		let yesdayValue = result[0].value;
		let todayValue = result[1].value;
		let maxValue = Math.max(yesdayValue, todayValue)*1.2.toFixed(2);

		let can = 0;
		let max = parseInt(maxValue);
		let str = max.toString();
		let len = str.length;
		let pow = Math.pow(10, len - 1);
		if (maxValue%pow == 0) {
			// 如果最大刻度是一个整值，那么参考线的值为
			can = maxValue / 3;
		} else {
			let vv = Math.floor(maxValue / pow) * pow;
			can = vv / 2;
		}
		return can;
	}
	render(){
		let result = this.props.result;
		result = this.formatResult(result);
		let num = Util.formatNum(result[1].value);
		//let can = this.getCanValue(result);
		return(
			<div style={{ position: "absolute", top: "14px", bottom: "0px", width: "100%" }}>
				<div style={{ position: "absolute", top: "40px", right: "0", bottom: "0", left: "0", zIndex: "1" }}></div>
				<div style={{ fontSize: "38px", color: "#333", textAlign: "center" }}>{ num }</div>
				
				<div styleName="lineChart" ref="chart" style={{ width: "90%", height: "120px" }}></div>
			</div>
		)
	}
}
/**
 * 折线图类型的单图
 */
class Line_Chart extends React.Component {
	static defaultProps = {
		result: { 
			"20171213": {},
			"20171214": {}
		}
	}
	constructor(props) {
		super(props);
		this.state = {
			chartObj: {}
		}
	}
	componentDidMount() {
		this.state.chartObj = echarts.init(this.refs.chart);
		this.initChart();
		this.refreshChart();
	}
	/**
	 * 组件更新完成后，渲染图表
	 */
	componentDidUpdate() {
		this.refreshChart();
	}
	formatResult(result) {
		let total = [];
		for(let date in result){
			let list = []
			let map  = JSON.parse(result[date]);
			for(let subdate in map){
				let time  = subdate.split('-')[0];
				let value = map[subdate];
				list.push({date: parseInt(time+''), value: parseInt(value+'')});
			}
			list.sort((a, b) => (a.date - b.date)); //按时间升序排列
			total.push({
				date: parseInt(date+''),
				list: list
			});
		}
		//对数据进行按日期字符串排序
		total.sort((a, b) => (a.date - b.date));

		if(total.length==0){
			return false;
		}

		let dataCur = [];	//今日数据
		let dataPre = [];	//昨日数据
		let xAxis 	= [];

		//total[0]是昨天的数据
		let listPre = total[0].list;
		for(let i=0; i<listPre.length; i++){
			var str   = listPre[i].date.toString();
			let minit = str.substr(8,2)+':'+str.substr(10,2); //时:分
			xAxis.push(minit);			  //x轴只要昨天的时间数据
			dataPre.push(listPre[i].value);  //插入昨天的数据
		}
		//total[1]是今天的数据
		let listCur = total[1].list;
		for(let i=0; i<listCur.length; i++){
			var str   = listCur[i].date.toString();
			let minit = str.substr(8,2)+':'+str.substr(10,2); //时:分
			dataCur.push(listCur[i].value);  //插入今天的数据
		}

		for(let i=dataCur.length-1; i>=0; i--){
			if(dataCur[i]!==0){
				let index = i==(dataCur.length-1) ? i:i+1;
				dataCur = dataCur.slice(0, index);
				break;
			}
		}

		// 今日数据最后一个点要画成虚线
		let dataXu = [];
		dataXu.length = dataCur.length;
		for(let i=0; i<dataCur.length; i++) {
			if(i < dataCur.length-2) {
				//
			}else{
				//拿最后两个点的数据
				dataXu[i] = dataCur[i];
			}
		}
		if(dataCur.length>0) {
			//去掉今天最后一个点的数据
			dataCur = dataCur.slice(0, dataCur.length-1);
		}
		return {
			xAxis: xAxis,
			dataCur: dataCur,
			dataXu: dataXu,
			dataPre: dataPre
		}
	}
	initChart() {
		let option = {
			tooltip: {
				trigger: 'axis',
				backgroundColor: 'rgba(50,50,50,1)',
				formatter: function(data){
					
					var str = '<div class="tooltip-wrapper">';
					if(data.length==0){
						return;
					}else{
						str += (data[0].name || data[1].name) + '<br>';
					}
					for(var i=0; i<data.length; i++) {
						if(data[i].value==undefined) {
							continue;
						}
						if(data[i-1]) {
							if((data[i].seriesName == data[i-1].seriesName) && (data[i].value == data[i-1].value)) {
								// 今日数据的结合点
								continue;
							}
						}
						let msg = '';
						if(data.length>1 && (i==data.length-1)) {
							// 今日数据虚线
							msg = '（存在延迟）';
						}
						str += '<span class="chart-tooltip-color" style="background:'+data[i].color+'"></span>' +data[i].seriesName+'：'+data[i].value+msg+ '<br>' ;
					}
					str += '</div>';
					return str;
				}.bind(this)
			},
			legend: {
				orient: 'horizontal',
				itemWidth: 9,
				itemHeight: 9,
				data: ['昨日实时', '今日实时']
			},
			dataZoom : [{
				type: 'slider',
				show: true,
				xAxisIndex: [0],
				start: 0,
				end: 100,
				bottom: "10%"
			}],
			grid: {
				left: '4%',
				right: '4%',
				bottom: '22%',
				top: '10%',
				containLabel: true
			},
			xAxis:  {
				data: [],
				axisLabel: {
					textStyle: {
						color: '#333',
						fontFamily: 'MicrosoftYaHeiLight'
					},
				},
				axisLine: {
					lineStyle: {
						color: '#ccc'
					}
				},
				splitLine: {
					lineStyle: {
						color: '#e6e6e6'
					}
				}
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					textStyle: {
						color: '#333',
						fontFamily: 'MicrosoftYaHeiLight'
					}
				},
				axisLine: {
					lineStyle: {
						color: '#ccc'
					}
				},
				splitLine: {
					lineStyle: {
						color: '#e6e6e6'
					}
				},
				splitNumber: 3
			},
			series: [
				{	
					name: '昨日实时',
					type: 'line',
					symbol: 'circle',
					symbolSize: 9,
					data: [],
					itemStyle: {
						normal: {
							color: '#f1bf51',
						}
					}
				},{	
					name: '今日实时',
					type: 'line',
					symbol: 'circle',
					symbolSize: 9,
					data: [],
					itemStyle: {
						normal: {
							color: '#4876d4'
						}
					}
				},{	
					name: '今日实时',
					type: 'line',
					symbol: 'circle',
					symbolSize: 9,
					data: [],
					lineStyle: {
						normal: {
								type: 'dotted'
						}
					},
					itemStyle: {
						normal: {
							color: '#4876d4'
						}
					}
				}
			]
		};
		this.state.chartObj.setOption(option);
	}
	refreshChart(){
		let result = this.props.result;
		result = this.formatResult(result);
		if(!result || result.length==0){
			return;
		}

		let curLen = result.dataCur.length;  //今天的数据的长度
		    curLen = curLen>5? curLen:0;

		let option = {
			// dataZoom: [
			// 	{
			// 		type: 'slider',
			// 		height: 8,//组件高度
            //         xAxisIndex: [0],
            //         startValue: 0,
            //         endValue: 100
			// 	}
			// ],
			xAxis:  {
				data: result.xAxis
			},
			series: [
				{	
					data: result.dataPre
				},{	
					data: result.dataCur
				},{	
					data: result.dataXu
				}
			]
		};
		this.state.chartObj.setOption(option);
	}
	onError(msg){
		let message = msg? msg:'查询有误，请稍后重试';
		if(this.refs.chart){
			this.refs.chart.innerHTML = '<h3>'+message+'</h3>';
		}
	}
	render(){
		return(
			<div ref="chart" styleName="line-container" style={{height:"100%"}}>
			
			</div>
		)
	}
}
/**
 * top类型的单图
 */
class Top_Chart extends React.Component {
	static defaultProps = {
		result: {
			"-": {}
		}
	}
	constructor(props){
		super(props);
		this.state = {
			maxvalue: 1
		}
	}
	formatResult(result){

		let map  = {};
		let list = [];
		for(var date in result){
			map = JSON.parse(result[date]);
		}
		for(var name in map){
			list.push({name: name, value: parseInt(map[name])})
		}
		list.sort((a, b) => (b.value-a.value));
		
		return list;
	}
	onError(msg){
		let message = msg? msg:'查询有误，请稍后重试';
		if(this.refs.chart){
			this.refs.chart.innerHTML = '<h3>'+message+'</h3>';
		}
	}
	getItems(list) {
		let maxvalue = list[0];
		let items    = [];
		let nameCnt;
		for(let i=0; i<list.length; i++){
			let item     = list[i];
			let percent  = item.value*100/maxvalue.value;
			if (item.name && (item.name.indexOf('http://')==0 || item.name.indexOf('https://')==0)) {
				// 是超链接
				nameCnt = <a styleName='autocut' title={ item.name } href={ item.name } target='_blank'>{ item.name }</a>;
			} else {
				// 其他
				nameCnt = <span styleName="autocut" title={item.name}>{ item.name }</span>;
			}
			items.push(
				<li key={i}>
					<div styleName="table_num">
						<span style={{width:"60%"}}>{ nameCnt }</span>
						<span style={{width:"40%"}}>{Util.formatNum(item.value)}</span>
					</div>
					<div styleName="table_per">
						<span style={{"width": percent+"%", "background":"#4876D4", "transition":"width 0.3s linear"}}></span>
					</div>
				</li>
			)
		}
		return items;
	}
	render(){
		let result = this.props.result;
		var list   = this.formatResult(result);
		var items  = this.getItems(list);
		return (
			<div styleName="tab_chart">
				{
					items.length==0?
					<NoResult /> : 
					<ul ref="chart" styleName="table_chart">
						{items}
					</ul>
				}
			</div>
		)
	}
}

class DashBox extends React.Component {
	static defaultProps = {
		detail: {}
	}
	constructor(props){
		super(props);
		this.state = {
			loading: true,
			sessionId: 0,
			success: true,
			xhr: null,
			timeLink: null,
			chartObj: {},
			appid: []
		}
	}
	componentDidMount(){

	}
	componentWillUnmount() {
		const { timeLink, xhr } = this.state;
		
		if (xhr && xhr.abort) {
			xhr.abort();
		}
		if(timeLink) {
			clearTimeout(timeLink);
		}
	}
	//获取服务器数据
	getChartData(){
		const { detail } = this.props;
		const { appid } = this.state;

		var ssId = Util.randomString();

		this.setState({sessionId: ssId}); 

        var condition = detail.condition;
            condition = JSON.parse(condition);
			delete condition.chartType;

		if(condition.type == "TopN"){
			//TopN，都取今天
			condition.fromDate = new Date().Format('yyyy-MM-dd');
			condition.toDate   = new Date().Format('yyyy-MM-dd');
		}else{
			//其他，取最近两天
			var yesday = new Date() - 24*3600*1000;
			condition.fromDate = new Date(yesday).Format('yyyy-MM-dd');
			condition.toDate   = new Date().Format('yyyy-MM-dd');
		}

		condition.name = detail.graphId;
		condition.productId = globalData.currProduct.id;
		condition.sessionId = ssId;
		condition.headers = { appid : appid };
		if (condition.windowLength == 0) {
			console.log('错误日志：' + JSON.stringify(condition));
		}
		if (!pageActive) {
			// 如果切到其他页面去了，不执行ajax查询，但是为了页面切回来之后还能继续轮询，所以这里保持了一个空的轮询
			setTimeout(() => {
				console.log('如果切到其他页面去了，不执行ajax查询');
				this.startLoop();
			}, 1000);
		} else {
			this.setState({
				loading: true
			})
			const fetchData = fetch.post('/realtime/get', condition);
	
			fetchData.then((response) => {
			  
			  response = response.data;
			  if (response.success) {
				this.setState({
					loading: false,
					errorMsg: ''
				})
				this.formatResult(response.relatedObject)
			  } else {
				this.setState({
					loading: false,
					errorMsg: response.message
				})
			  }
			  this.startLoop();
			}).catch((error) => {
				this.setState({
					errorMsg: '系统繁忙，请稍后再试'
				})
			});
		}
	}
	/**
	 * 开始循环
	 */
	startLoop() {
		const { detail } = this.props;
		if(this.state.timeLink) {
			clearTimeout(this.state.timeLink);
		}
		var condition = detail.condition;
				condition = JSON.parse(condition);
		var range = 5000;
		if (condition.chartType == 'number') {
			range = 2000;
		}
		this.state.timeLink = setTimeout(() => {
			this.getChartData();
		}, range);
	}

	//设置查询参数
	setParam(param){
		if(param && param.appid) {
			this.state.appid = param.appid;
		}
	}
	//根据模块处理查询结果
	formatResult(data,param){
		this.state.sessionId = 0;
		if(!data || !data.results){
			this.ajaxError();
			return;
		}else{
			this.setState({success: true, resultObj: data, loading: false});
		}
	}
	
	//查询报错
	ajaxError(msg){
		var msg = msg? msg : '查询出错，请稍后再试';
		this.setState({success: false, errorMsg: msg, loading: false});
	}
  	getTemplete() {
	  	const { detail } = this.props;

		let condition = JSON.parse(detail.condition);
		let result    = this.state.resultObj;
		if(!this.state.success || !result){
			return  <div>{this.state.errorMsg}</div>;
		}
		if(condition.chartType=="number"){
			return <Number_Chart result={result.results}></Number_Chart>
		}else if(condition.chartType=="line"){
			return <Line_Chart result={result.results}></Line_Chart>
		}else if(condition.chartType=="top-chart"){
			return <Top_Chart result={result.results}></Top_Chart>
		}
    }
	render() {
		var tplCnt    = this.getTemplete();
		const { loading } = this.state;
		const { detail }   = this.props;
		return 	(<div styleName="bord" ref="bord">
					<div styleName ="head">
						<div styleName ="title">
							<span styleName ="maintitle">{ detail.name }</span>
							<span styleName ="subtitle"> ({ detail.subname }) </span>
						</div>
					</div>
					<div styleName ="body" >
						{
							tplCnt
						}
						{
							loading ? <Icon type="loading"></Icon> : null
						}
					</div>
				</div>);
	}
}
const turnCss = CSSModules(DashBox, styles, { allowMultiple: true });

export default turnCss;