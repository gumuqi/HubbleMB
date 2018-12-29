//单个dashbox控制器
import React from 'react';
import CSSModules from 'react-css-modules';

import Icon from 'antd-mobile/lib/icon';
import Button from 'antd-mobile/lib/button';

import _echart from '../../../../lib/chartjs/echarts.common.min'
import fetch from '../../../../components/fetch';
import Util from '../../../../components/util';

import styles from './index.less';


class Table_Chart extends React.Component {
	static defaultProps = {
		dataSource: []
	}
	constructor(props){
		super(props);
		this.state = {
			maxvalue: 1
		}
	}
	renderChild(item, index) {
		let maxvalue = this.state.maxvalue*1.1;
		let percent  = item.value*100/maxvalue;
		let nameCnt;
		try {
			item.percent = parseFloat(item.percent).toFixed(2);
		} catch (error) {
			
		}

		let txt = item.name.replace('http://','').replace('https://','');
		let ind = txt.indexOf('/');
		txt = txt.substr(ind);
		nameCnt = <span styleName="autocut" className='autocut' title={item.name}>{ txt }</span>;
		
		return (
			<li key={index}>
			<div styleName="table_num">
				<span>{ nameCnt }</span>
				<span>{ Util.formatNum(item.value) }</span>
				<span>{item.text} : {item.percent}%</span>
			</div>
			<div styleName="table_per">
				<span style={{"width": percent+"%", "background": this.props.lineColor}}></span>
			</div>
			</li>
		)
	}
	render(){
		if(this.props.dataSource.length>0){
			this.state.maxvalue = this.props.dataSource[0].value;
		}
		return (
			<ul styleName="table_chart">
				{ this.props.dataSource.map(this.renderChild.bind(this)) }
			</ul>
		)
	}
}

Table_Chart = CSSModules(Table_Chart, styles, { allowMultiple: true });

class DashBox extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			sessionId: 0,
			condition: {},
			dataMap: [],
			overviewTab: 0,
			xhr: null,
			chartObj: {},
			errorMsg: ''
		}
	}
	componentDidMount(){
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
			this.setState({
				loading: false,
				errorMsg: ''
			})
			let result = response.relatedObject;
			this.formatResult(result, this.state.condition)
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
	//设置查询参数
	setParam(param){
		var name = this.state.condition.name;
		for(var i in param){
			this.state.condition[i] = param[i];
		}
		if(!!name){
			//如果已经有name字段了，就不要改了
			//（例如从新增用户切换成活跃用户，这个时候选时间，name就会被新增用户覆盖，查的结果时新增，但是tab显示的却还是活跃）
			this.state.condition.name = name;
		}
		this.setState({'condition': this.state.condition});
	}

	//根据模块处理查询结果
	formatResult(data,param){
		const { detail } = this.props;
		const cond = JSON.parse(detail.condition);

		if(!data || !data.values){
			this.ajaxError();
			return;
		}else{
			this.setState({avg: data.avg, ratio: data.ratio});
		}
		var dataMap   = [];
		var option    = {};
		var chartType = cond.chartType;
		
		var xAxis     = [];
		var dataCur   = []; //当前数据
		var dataPre   = [];	//环比数据

		var graphId   = detail.graphId;
		var list      = data.values;

		for(var i=0; i<list.length; i++){
			var lineObj = JSON.parse(list[i]);
			for(var date in lineObj){
				xAxis.push(date);
				var valueObj = lineObj[date];
				if(typeof valueObj.value == 'string'){
					valueObj.value = valueObj.value.replace('%','');
				}
				if(typeof valueObj.pre == 'string'){
					valueObj.pre = valueObj.pre.replace('%','');
				}
				if(typeof valueObj.ratio == 'string'){
					valueObj.ratio = valueObj.ratio.replace('%','');
				}
				dataCur.push(valueObj.value);
				dataPre.push(valueObj.pre);
				dataMap.push({name: date, value: valueObj.value, percent: valueObj.ratio});
			}
		} 

		if(chartType=='line' || chartType=='bar'){
			if(!this.refs.chart){
				return;
			}
			this.refs.chart.innerHTML = '';
			option = {
				tooltip: {
					trigger: 'axis',
					backgroundColor: 'rgba(50,50,50,1)',
					formatter: this.getTooltip()
				},
				grid: {
					left: '4%',
					right: '4%',
					bottom: '8%',
					top: '10%',
					containLabel: true
				},
				xAxis:  {
					data: xAxis,
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
						name: detail.name,
						type: chartType,
						barMaxWidth: 20,
						data: dataCur,
							itemStyle: {
							normal: {
								color: '#5182E4'
							}
						}
					}
				]
			};

			
			
			var unit    = '';
			if(['usetime','usetime-mobile'].indexOf(graphId) > -1){
				//平均访问时长
				var dataAxis = xAxis;
				var yMax = this.getMax(dataCur) * 1.2;
				var dataShadow = [];

				for (var i = 0; i < dataCur.length; i++) {
					dataShadow.push(yMax);
				}
				option.tooltip = Object.assign( option.tooltip,{
					formatter: this.getTooltip('秒')
				});
				option.xAxis = Object.assign( option.xAxis,{
					data: dataAxis,
					axisLine: {
						show: false
					},
					axisTick: {
						show: false
					}
				});
				option.yAxis = Object.assign( option.yAxis,{
					//min: 'dataMin',
					max: yMax.toFixed(2),
					axisLine: {
						show: false
					},
					axisLabel: {
						formatter: '{value} 秒',
						textStyle: {
							color: '#333',
							fontFamily: 'MicrosoftYaHeiLight'
						}
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: false
					}
				});
				option.series = [
						{
							type: 'bar',
							name: detail.name,
							data: dataCur,
							barMaxWidth: 20,
							itemStyle: {
								normal: {color: '#f1bf51'}
							}
						},
						{ // For shadow
							type: 'bar',
							
							barGap:'-100%',
							barCategoryGap:'40%',
							data: dataShadow,
							barMaxWidth: 20,
							itemStyle: {
								normal: {color: 'rgba(0,0,0,0.03)'}
							},
						}
				];
			}else if(graphId=='avgVisitLen'){
				//平均访问深度
				var dataAxis = xAxis;
				var yMax = this.getMax(dataCur) * 1.2;
				var dataShadow = [];

				for (var i = 0; i < dataCur.length; i++) {
					dataShadow.push(yMax);
				}
				option.xAxis = Object.assign( option.xAxis,{
					data: dataAxis,
					axisLine: {
						show: false
					},
					axisTick: {
						show: false
					}
				});
				option.yAxis = Object.assign( option.yAxis,{
					//min: 'dataMin',
					max: yMax.toFixed(2),
					axisLine: {
						show: false
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: false
					}
				});
				option.series = [
						{
							type: 'bar',
							name: detail.name,
							data: dataCur,
							barMaxWidth: 20,
							itemStyle: {
								normal: {color: '#4876D4'}
							}
						},
						{ // For shadow
							type: 'bar',
							
							barGap:'-100%',
							barCategoryGap:'40%',
							data: dataShadow,
							barMaxWidth: 20,
							itemStyle: {
								normal: {color: 'rgba(0,0,0,0.03)'}
							},
						}
				];
			}else if(['retained','retained-mobile'].indexOf(graphId) > -1){
				//平均用户次日留存率
				var dataAxis = xAxis;
				var yMax = this.getMax(dataCur) * 1.2;
				var dataShadow = [];

				for (var i = 0; i < dataCur.length; i++) {
					dataShadow.push(yMax.toFixed(2));
				}

				option.tooltip = Object.assign( option.tooltip,{
					formatter: this.getTooltip('%')
				});
				option.xAxis = Object.assign( option.xAxis,{
					data: dataAxis,
					axisLine: {
						show: false
					},
					axisTick: {
						show: false
					}
				});
				option.yAxis = Object.assign( option.yAxis,{
					//min: 'dataMin',
					max: yMax.toFixed(2),
					axisLine: {
						show: false
					},
					axisLabel: {
						formatter: '{value} %',
						textStyle: {
							color: '#333',
							fontFamily: 'MicrosoftYaHeiLight'
						}
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: false
					}
				});
				option.series = [
						{
							type: 'bar',
							name: detail.name,
							data: dataCur,
							barMaxWidth: 20,
							itemStyle: {
								normal: {color: '#9E85CC'}
							}
						},
						{ // For shadow
							type: 'bar',
							
							barGap:'-100%',
							barCategoryGap:'40%',
							data: dataShadow,
							barMaxWidth: 20,
							itemStyle: {
								normal: {color: 'rgba(0,0,0,0.03)'}
							}
						}
				];
			}else if(['retentionTrend','retentionTrend-mobile'].indexOf(graphId) > -1){
				//新增用户留存率趋势图
				option.tooltip = Object.assign( option.tooltip,{
					formatter: this.getTooltip('%')
				});
				option.yAxis = Object.assign( option.yAxis,{
					axisLabel: {
						formatter: '{value} %',
						textStyle: {
							color: '#333',
							fontFamily: 'MicrosoftYaHeiLight'
						}
					}
				})
				option.series = [{	
						name: detail.name,
						type: chartType,
						barMaxWidth: 20,
						symbol: 'circle',
						symbolSize: 9,
						data: dataCur,
						itemStyle: {
							normal: {
								color: '#4876D4'
							}
						}
					}]
			}else if(['pageNewUser','pageNewUser-mobile'].indexOf(graphId) > -1){
				//页面访问top10
				option.series = [{	
						name: detail.name,
						type: chartType,
						barMaxWidth: 8,
						data: dataCur,
							itemStyle: {
							normal: {
								color: '#3DCCCC'
							}
						}
					}]
				
			}else if(['eventNewUser','eventNewUser-mobile'].indexOf(graphId) > -1){
				//事件触发top10
				option.series = [{	
						name: detail.name,
						type: chartType,
						barMaxWidth: 8,
						data: dataCur,
							itemStyle: {
							normal: {
								color: '#3DCCCC'
							}
						}
					}]
				
			}else if(['cityNewUser','cityNewUser-mobile'].indexOf(graphId) > -1){
				//城市访问top10
				var xAxis = option.xAxis;
				var yAxis = option.yAxis;
				option.xAxis = yAxis;
				option.yAxis = xAxis;
				option.yAxis.axisLabel.interval = 0;
				var dataTopList = [];
				for(var i=0; i<dataCur.length; i++){
					dataTopList.push({
						value: dataCur[i]
					})
				}
				option.yAxis = Object.assign( option.yAxis,{
					axisTick: {
						show: false
					},
					axisLabel: {
						formatter: function(value, index){
							if(value!==undefined){
								var value = value.toString();
								if(value.length>10){
									value = value.substr(0, 10) + '...';
								}
								return value;
							}
						},
						textStyle: {
							color: '#333',
							fontFamily: 'MicrosoftYaHeiLight'
						}
					}
				});
				option.series = {
					name: detail.name,
					type: chartType,
					barMaxWidth: 8,
					data: dataTopList,
					itemStyle: {
						normal: {
							color: '#B5D483'
						}
					}
				}
				option.grid.top = '0%';
			}else if(['referrerNewUser','referrerNewUser-mobile'].indexOf(graphId) > -1){
				//网站来源top10
				var xAxis = option.xAxis;
				var yAxis = option.yAxis;
				option.xAxis = yAxis;
				option.yAxis = xAxis;
				option.yAxis.axisLabel.interval = 0;
				var dataTopList = [];
				for(var i=0; i<dataCur.length; i++){
					dataTopList.push({
						value: dataCur[i]
					})
				}
				option.yAxis = Object.assign( option.yAxis,{
					axisTick: {
						show: false
					}
				});
				option.series = {
					name: detail.name,
					type: chartType,
					barMaxWidth: 8,
					data: dataTopList,
					itemStyle: {
						normal: {
							color: '#82CCE7'
						}
					}
				}
				option.grid.top = '0%';
			}else if(['devicemodelNewUser','devicemodelNewUser-mobile'].indexOf(graphId) > -1){
				//设备型号top10
				var xAxis = option.xAxis;
				var yAxis = option.yAxis;
				option.xAxis = yAxis;
				option.yAxis = xAxis;
				option.yAxis.axisLabel.interval = 0;
				var dataTopList = [];
				for(var i=0; i<dataCur.length; i++){
					dataTopList.push({
						value: dataCur[i]
					})
				}
				option.yAxis = Object.assign( option.yAxis,{
					axisTick: {
						show: false
					},
					axisLabel: {
						formatter: function(value, index){
							if(value!==undefined){
								var value = value.toString();
								if(value.length>15){
									value = value.substr(0, 15) + '...';
								}
								return value;
							}
						},
						textStyle: {
							color: '#333',
							fontFamily: 'MicrosoftYaHeiLight'
						}
					}
				});
				option.series = {
					name: detail.name,
					type: chartType,
					barMaxWidth: 8,
					data: dataTopList,
					itemStyle: {
						normal: {
							color: '#82CCE7'
						}
					}
				}
				option.grid.top = '0%';
			}else if(['appversionNewUser','appversionNewUser-mobile'].indexOf(graphId) > -1){
				//新增用户留存率趋势图
				option.series = [{	
						name: detail.name,
						type: chartType,
						barMaxWidth: 8,
						data: dataCur,
							itemStyle: {
							normal: {
								color: '#3DCCCC'
							}
						}
					}]
			}else if(['appchannelNewUser','appchannelNewUser-mobile'].indexOf(graphId) > -1){
				//新增用户留存率趋势图
				option.series = [{	
						name: detail.name,
						type: chartType,
						barMaxWidth: 8,
						data: dataCur,
							itemStyle: {
							normal: {
								color: '#3DCCCC'
							}
						}
					}]
			}

			var container = this.refs.chart;
			this.state.chartObj = _echart.init(container);
			this.state.chartObj.setOption(option);
		}else if(chartType=='pie'){
			if(!this.refs.chart){
				return;
			}
			this.refs.chart.innerHTML = '';
			var colorList = ['#4876D4','#22AED9','#3DBFBF','#B5D483','#FECF66','#FEAB66','#CB99DA','#9E85CC','#D95D97','#EA7372'];

			dataMap.sort(function(a, b){
				return b.value - a.value;
			});
			var xAxis = [];
			for(var i=0; i<dataMap.length; i++){
				xAxis.push(dataMap[i].name);
				dataMap[i].itemStyle = {
					normal : {
						color : colorList[i]
					}
				}
			}

			option = {
				title : {
					text: '',
					x:'center'
				},
				tooltip : {
					trigger: 'item',
					backgroundColor: 'rgba(50,50,50,1)',
					formatter: function(data){
						if(data.value == undefined){
							return;
						}else{
							return '<div class="tooltip-wrapper">'+
									data.seriesName  + '<br>' +
									'<span class="chart-tooltip-color" style="background:'+data.color+'"></span>' + data.name + ' : '  + Util.formatNum(data.value) + ' ('+data.percent+'%)'
									'</div>';
						}
					}.bind(this)
				},	
				legend: {
					type: 'scroll',
					orient: 'vertical',
					right: 20,
					itemWidth: 10,
					itemHeight: 10,
					data: xAxis,
				},
				series : [
					{
						name: detail.name,
						type: 'pie',
						radius: ['25%', '60%'],
						center: ['50%', '45%'],
						data: dataMap,
						label:{
							normal:{
								show: false
							}  
						},
						labelLine:{
							normal:{
								show: false
							}  
						},
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}
				]
			};
			var container = this.refs.chart;
			this.state.chartObj = _echart.init(container);
			this.state.chartObj.setOption(option);
		}else if(chartType=='table-chart'){
			var text = '';
			switch(graphId){
				case 'firstPageNewUser':
						text = '跳出率';
						break;
				default:
						text = '占比';
			}
			dataMap.reverse();
			for(var i=0; i<dataMap.length; i++){
				dataMap[i].text = text;
			}
			this.setState({dataMap: dataMap});

		}
	}
	//获取数组中的最大值
	getMax(array){
		var max = 0;
		for(var i=0; i<array.length; i++){
			var num = parseFloat(array[i]);
			if(isNaN(num)){
				continue;
			}else{
				if(num > max){
					max = num;
				}
			}
		}
		return max;
	}
	//获取图表hover模板
	getTooltip(unit){
		var unit = unit? unit : '';
		return function(data){
			var data = data[0];
			if(data.value == undefined){
				return;
			}else{
				return `<div class="tooltip-wrapper">
						${ data.seriesName } <br>
						<span class="chart-tooltip-color" style="background:${ data.color }"></span>
						${ data.name } : ${ Util.formatNum(data.value) } ${ unit }
						</div>`;
			}
		}
	}
	//查询报错
	ajaxError(msg){
		var chartBox = this.refs.chart;
		var msg = msg? msg : '查询出错，请稍后再试';
		msg = '<h3 class="error">'+ msg + '</h3>';

		chartBox.innerHTML = msg
	}
	//随机一串字符
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
	onRightTabChange(index, name){
		if(this.state.loading){
			return;
		}
		if(this.state.overviewTab != index){
			this.setState({overviewTab: index})
			this.state.condition.name = name;
			this.getData();
		}
	}
	
	/**
	 * 处理不同指标模板
	 */
	getTemplete(){
		const { detail } = this.props;
		const { condition, overviewTab } = this.state;
		const typetxt = condition.type == 'device' ? '设备' : '用户';
		if(['usetime','usetime-mobile','avgVisitLen','avgVisitLen-mobile','retained','retained-mobile'].indexOf(detail.graphId) > -1){
			let avg = this.state.avg || 0;
			if (detail.graphId == 'usetime' || detail.graphId == 'usetime-mobile') {
				let min = parseInt(avg / 60); //使用的分钟数
				let sec = avg % 60; //使用的秒数
				avg = min + ' 分' + sec + ' 秒';
			}
			return (
				<div>
					<div styleName="titleNum" ref="tlnum">
						<h3>{avg}</h3>
						<small>环比 : {this.state.ratio}</small>
					</div>
					<div styleName="chartBox num_chart" ref="chart"></div>
				</div>
			)
		}else if(['firstPageNewUser','firstPageNewUser-mobile','webPageNewUser','webPageNewUser-mobile','cityNewUser','cityNewUser-mobile','referrerNewUser','referrerNewUser-mobile',
					'pageNewUser','pageNewUser-mobile',
					'eventNewUser','eventNewUser-mobile','cityNewUser-mobile','devicemodelNewUser-mobile',
					'appversionNewUser','appversionNewUser-mobile','appchannelNewUser','appchannelNewUser-mobile'].indexOf(detail.graphId) > -1){

			var lineColor = '';
			if(['firstPageNewUser','firstPageNewUser-mobile','pageNewUser','pageNewUser-mobile','appversionNewUser','appversionNewUser-mobile'].indexOf(detail.graphId) > -1){
				lineColor = '#23AED9';
			}else if(['webPageNewUser','webPageNewUser-mobile','eventNewUser','eventNewUser-mobile','appchannelNewUser','appchannelNewUser-mobile'].indexOf(detail.graphId) > -1){
				lineColor = '#3DBFBF';
			}

			return (
				<div>
					<div styleName="btn-group">
						<Button size="small" inline={ true} onClick={this.onRightTabChange.bind(this, 0, detail.rightTab[0])} type={ overviewTab==0? "primary":"" }>新增{ typetxt }</Button>
						<Button size="small" inline={ true} onClick={this.onRightTabChange.bind(this, 1, detail.rightTab[1])} type={ overviewTab==1? "primary":"" }>活跃{ typetxt }</Button>
					</div>
					<div styleName="chartBox tab_chart" ref="chart">
						<Table_Chart dataSource={this.state.dataMap} lineColor={lineColor}></Table_Chart>
					</div>
					
				</div>
			)
		}else{
			return (
				<div styleName="chartBox single_chart" ref="chart"></div>
			)
		}
	}
	render() {
		const { detail } = this.props;
		const { loading } = this.state;
		var dataCnt   = this.getTemplete();

		return 	(<div styleName="bord" ref="bord">
					<div styleName ="head">
						<div styleName ="title">
							<span>{ detail.name }</span>
						</div>
					</div>
					<div styleName ="body" >
					{
						loading ? <Icon type="loading" style={{ position:'absolute', top:'40%', left: '50%', zIndex: '999' }}/> : null
					}
					{
						dataCnt
					}
					</div>
				</div>);
	}
}

const turnCss = CSSModules(DashBox, styles, { allowMultiple: true });

export default turnCss;