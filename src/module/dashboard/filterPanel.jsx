//二维码控制器
import React 		from 'react';
import ReactDOM 	from 'react-dom';
import _base 		from '../../../common/base';

class SearchInput extends React.Component{
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
	}
	componentDidMount(){
		$(this.refs.input).keydown(function(e){
			if(e.keyCode==13){
				this.search();
			}
		}.bind(this));
	}
	search(){
		var input = this.refs.input;
		var text  = input.value;
		this.$emit('search',text);
	}
	getValue(){
		return this.refs.input.value;
	}
	clear(){
		var input = this.refs.input;
		input.value = '';
	}
	render(){
		return (
			<div className="input-group search-group">
				<input ref="input" className="form-control" placeholder="请输入渠道或版本" />
				<span className="input-group-addon" onClick={this.search.bind(this)}><i className="demo-icon icon-search"></i></span>
			</div>
		)
	}
}

class FilterPanel extends React.Component{
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
		/**
		 * cur结尾的是当前操作的数据
		 * que结尾的是最终查询的条件
		 * web、mobile、iOS、Android四个对象才是查询所用的参数，其他的只是用来处理显示逻辑的
		 */
		super(props);
		this.state =  {
			platform: 'web',
			web: {
				ver_sel_que: [],
				cha_sel_que: []
			},
			mobile: {
				ver_sel_que: [],
				cha_sel_que: []
			},
			iOS: {
				ver_sel_que: [],
				cha_sel_que: []
			},
			Android: {
				ver_sel_que: [],
				cha_sel_que: []
			},
			ver_sel_cur: [],
			ver_sel_que: [],
			ver_sou_cur: [],

			cha_sel_cur: [],
			cha_sel_que: [],
			cha_sou_cur: []
		};
	}
	setPlatform(data) {
		for(var key in data) {
			if(data.hasOwnProperty(key)) {
				this.state[key] = data[key];
			}
		}
	}
	//基本配置渲染完之后
	componentDidMount(){
		this.refs.searchGroup.$on('search', function(event, text){
			this.getData(1);
		}.bind(this))
		
	}
	//flag=0是弹出是查询，flag=1时是点击搜索框查询
	getData(flag){
		var searchTxt = this.refs.searchGroup.getValue();
		var platform  = this.state.platform;
		var productId = _base.getNowProductId();
		$.ajax({
			url  : '/hwi/summary/getChannelAndVersion',
			type : 'GET',
			beforeSend: function(xhr) {
				xhr.withCredentials = true;
			},
			xhrFields: {
				withCredentials: true
			},
			data : {appkey: platform,value: searchTxt},
			success : function(data){
				if(data.success){
					var result = {
						version: [],
						chanel: []
					}
					for(var i=0; i<data.relatedObject.length; i++){
						var item = data.relatedObject[i];
						if(item.type==1){
							//版本
							result.version.push(item);
						}else{
							//渠道
							result.chanel.push(item);
						}
					}
					this.setData(flag, result);
				}else{
					this.setData(flag, []);
				}
			}.bind(this),
			error : function(e){
				this.setData(flag, []);
			}.bind(this)
		})
	}
	/**
	 * flag=0 根据上次生效的选中项，对版本、渠道列表进行select，用于窗口打开，重新获取列表
	 * flag=1 根据当前选中的选中项，对版本、渠道列表进行select，用于搜索查询，重新获取列表
	 */
	setData(flag, result){
		var ver_sou = result.version;
		var cha_sou = result.chanel;
		var ver_sel = [];
		var cha_sel = [];
		if(flag==0){
			ver_sel = this.state.ver_sel_que;
			cha_sel = this.state.cha_sel_que;
		}else{
			ver_sel = this.state.ver_sel_cur;
			cha_sel = this.state.cha_sel_cur;
		}
		for(var i=0; i<ver_sou.length; i++){
			for(var j=0; j<ver_sel.length; j++){
				if(ver_sou[i].id == ver_sel[j].id){
					ver_sou[i].selected = true;
				}
			}
		}
		for(var i=0; i<cha_sou.length; i++){
			for(var j=0; j<cha_sel.length; j++){
				if(cha_sou[i].id == cha_sel[j].id){
					cha_sou[i].selected = true;
				}
			}
		}
		this.setState({
				ver_sel_cur: ver_sel,
				ver_sou_cur: ver_sou,

				cha_sel_cur: cha_sel,
				cha_sou_cur: cha_sou
		});
	}
	getParam(){
		var platform = this.state.platform;
		var channels = this.state[platform].cha_sel_que;
		var versions = this.state[platform].ver_sel_que;

		var chanelList = [];
		var verList = [];
		for(var i=0; i<channels.length; i++){
			chanelList.push(channels[i].value);
		}
		for(var i=0; i<versions.length; i++){
			verList.push(versions[i].value);
		}
		return {
			channels : chanelList.length==0? 'all' : chanelList.join(','),
			versions : verList.length==0? 'all' : verList.join(',')
		}
	}
	show(platform){
		this.onChangePlatform(platform);
		$(this.refs.modalBody).modal('show');
		this.refs.searchGroup.clear();
		//每次show的时候，用上一次的有效数据que覆盖cur
		this.getData(0);
		
	}
	hide(){
		$(this.refs.modalBody).modal('hide');
	}
	onChangePlatform(platform){
		this.state.platform = platform;
		var state = $.extend(true, {platform: platform}, this.state[platform]);
		this.setState(state);
	}
	onVersionClick(item){
		var versionSelected = this.state.ver_sel_cur;
		var versionSource   = this.state.ver_sou_cur;

		if(item.selected){
			//取消选中逻辑
			var selectList = [];
			for(var i=0; i<versionSelected.length; i++){
				if(item.id != versionSelected[i].id){
					var node = versionSelected[i];
					selectList.push(node);
				}
			}
			for(var i=0; i<versionSource.length; i++){
				if(item.id == versionSource[i].id){
					versionSource[i].selected = false;
					break;
				}
			}
			this.setState({
				ver_sel_cur: selectList,
				ver_sou_cur: versionSource
			})
		}else{
			var selectList = versionSelected.concat({id: item.id, value: item.value});;
			//选中逻辑
			for(var i=0; i<versionSource.length; i++){
				if(item.id == versionSource[i].id){
					versionSource[i].selected = true;
					break;
				}
			}
			this.setState({
				ver_sel_cur: selectList,
				ver_sou_cur: versionSource
			})
		}
	}
	onChanelClick(item){
		var chanelSelected = this.state.cha_sel_cur;
		var chanelSource   = this.state.cha_sou_cur;

		if(item.selected){
			//取消选中逻辑
			var selectList = [];
			for(var i=0; i<chanelSelected.length; i++){
				if(item.id != chanelSelected[i].id){
					var node = chanelSelected[i];
					selectList.push(node);
				}
			}
			for(var i=0; i<chanelSource.length; i++){
				if(item.id == chanelSource[i].id){
					chanelSource[i].selected = false;
					break;
				}
			}
			this.setState({
				cha_sel_cur: selectList,
				cha_sou_cur: chanelSource
			})
		}else{
			//选中逻辑
			var selectList = chanelSelected.concat({id: item.id, value: item.value});
			for(var i=0; i<chanelSource.length; i++){
				if(item.id == chanelSource[i].id){
					chanelSource[i].selected = true;
					break;
				}
			}
			this.setState({
				cha_sel_cur: selectList,
				cha_sou_cur: chanelSource
			})
		}
	}
	onSubmit(){
		var ver_sel_cur = this.state.ver_sel_cur;
		var cha_sel_cur = this.state.cha_sel_cur;
		var platform    = this.state.platform;

		this.state.ver_sel_que = ver_sel_cur;
		this.state.cha_sel_que = cha_sel_cur;
		this.state[platform]   = {
			ver_sel_que : $.extend(true, [], ver_sel_cur),
			cha_sel_que : $.extend(true, [], cha_sel_cur)
		}
		this.setState({
			ver_sel_que : $.extend(true, [], ver_sel_cur),
			cha_sel_que : $.extend(true, [], cha_sel_cur)
		})

		this.hide();
		this.$emit('submit');
	}
	onCancel(){
		var ver_sou_cur = this.state.ver_sou_cur;
		var cha_sou_cur = this.state.cha_sou_cur;
		for(var i=0; i<ver_sou_cur.length; i++){
			ver_sou_cur[i].selected = false;
		}
		for(var i=0; i<cha_sou_cur.length; i++){
			cha_sou_cur[i].selected = false;
		}
		this.setState({
			ver_sel_cur : [],
			ver_sou_cur : ver_sou_cur,
			cha_sel_cur : [],
			cha_sou_cur : cha_sou_cur
		})
	}
	render(){
		var versionSelected = this.state.ver_sel_cur;
		var versionSource   = this.state.ver_sou_cur;
		var chanelSelected  = this.state.cha_sel_cur;
		var chanelSource    = this.state.cha_sou_cur;
		return (
			<div ref="modalBody" className="modal fade" data-backdrop="static">
				<div className="modal-window filterPanel">
					<div ref="winBody" className="modal-content">
						<div className="modal-header">
							<span onClick={this.hide.bind(this)} className="demo-icon icon-wrong"></span>
						</div>
						<div className="modal-body">
							<div>
								<SearchInput ref="searchGroup"></SearchInput>
							</div>
							<div className="clearfix">
								<span className="pull-left filter-label">版本</span>
								<ul className="selected" ref="versionSelected">
									{
										versionSelected.map(function(item, index){
											item.selected = true;
											return <li key={index} className="selected" title={item.value}>
														<span className="namecnt"><span className="autocut">{item.value}</span></span>
														<span onClick={this.onVersionClick.bind(this,item)} className="demo-icon icon-wrong-circle"></span>
													</li>
										}.bind(this))
									}
								</ul>
							</div>
							<hr/>
							<div className="clearfix">
								<ul className="list" ref="versionSource">
									{
										versionSource.map(function(item, index){
											return <li key={index} className={item.selected? "active":""} onClick={this.onVersionClick.bind(this,item)} title={item.value}>
														<i className={"demo-icon icon-checkbox"+(item.selected? "-checked":"")}></i>
														<span className="namecnt"><span className="autocut">{item.value}</span></span>
													</li>
										}.bind(this))
									}
								</ul>
							</div>
							<div className="clearfix" style={{"marginTop":"40px"}}>
								<span className="pull-left filter-label">渠道</span>
								<ul className="selected" ref="chanelSelected">
									{
										chanelSelected.map(function(item, index){
											item.selected = true;
											return <li key={index} className="selected" title={item.value}>
														<span className="namecnt"><span className="autocut">{item.value}</span></span>
														<span onClick={this.onChanelClick.bind(this, item)} className="demo-icon icon-wrong-circle"></span>
													</li>
										}.bind(this))
									}
								</ul>
							</div>
							<hr/>
							<div className="clearfix">
								<ul className="list" ref="chanelSource">
									{
										chanelSource.map(function(item, index){
											return <li key={index} className={item.selected? "active":""} onClick={this.onChanelClick.bind(this, item)} title={item.value}>
														<i className={"demo-icon icon-checkbox"+(item.selected? "-checked":"")}></i>
														<span className="namecnt"><span className="autocut">{item.value}</span></span>
													</li>
										}.bind(this))
									}
								</ul>
							</div>
						</div>
						<div className="modal-footer">
							<button onClick={this.onSubmit.bind(this)} className="btn btn-primary pull-right submit">确定</button>
							<button onClick={this.onCancel.bind(this)} className="btn btn-default pull-right cancel">重置</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
	
var filterContainer = document.createElement('div');
document.body.appendChild(filterContainer);
export default ReactDOM.render(<FilterPanel />,filterContainer);