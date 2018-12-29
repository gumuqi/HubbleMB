import _base 		from '../../../common/base';
import React 		from 'react';
import ReactDOM 	from 'react-dom';
import Component 	from '../../../business/component/component';

class AddGraph extends React.Component{
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
			boardList: [],
			type: "mine",
			board: {}
		};
	}
	//基本配置渲染完之后，去拿图数据
	componentDidMount(){
		$(this.refs.search).keydown(function(e){
			if(e.keyCode==13){
				this.getData();
			}
		}.bind(this));

		var roleId    = _base.getRoleId();
		this.state.roleId = roleId;
	}
	componentWillUpdate(){

	}
	getData(){
		let { board } = this.state;
		var that = this;
		var param = {
						dashboardId: board.dashboardId,
						keyWord: this.refs.search.value
					};
		if(this.state.type == "all"){
			param.type = "all";
		}else if(this.state.type == "inner"){
			param.type = "inner";
		} else {
			param.type = "mine";
		}
		_base.ajax({
			url: '/Dashboard/getGraphList',
			type: 'GET',
			data: param,
			success: function(data){
				if(data.success){
					var dataSource = data.relatedObject;
					that.setData(dataSource);
				}else{
					_base.serverError(data.errorCode);
				}
			},
			error: function(e){

			}
		})
	}
	setData(list){
		this.setState({boardList: list});
		if(list.length >0 ){
			this.refs.noGraph.innerHTML = "";
		}else{
			this.refs.noGraph.innerHTML = "没有任何单图";
		}
	}
	show(board){
		this.state.board = board;
		$(this.refs.modeCnt).modal("show");
		this.getData();
	}
	hide(){
		$(this.refs.modeCnt).modal("hide");
	}
	/**
	 * 点击单图时，如果是本来就已经在看板内的（isIn）,不可取消选择
	 * 如果是新加的（isAdd）可以取消选择
	 * @param  {[type]} id [description]
	 * @return {[type]}    [description]
	 */
	onBoardClick(id){
		var boardList = this.state.boardList;
		for(var i=0; i<boardList.length; i++){
			var item = boardList[i];
			if(id == item.id){
				if(item.isIn){
					return;
				}else{
					item.isAdd = !item.isAdd;
					break;
				}
			}
		}
		this.setState({boardList: boardList});
	}
	/**
	 * tab切换
	 * @param  {[type]} tab [description]
	 * @return {[type]}     [description]
	 */
	tabChange(tab){
		this.setState({type: tab}, this.getData);
	}
	cancel(){
		this.hide();
		var board = this.state.board;
		DATracker.track('submmitAddGraph', {
			productID: _base.nowLoginInfo.currProduct.id,
			productName: _base.nowLoginInfo.currProduct.name,
			actionType: 'cancel',
			dashboardID: board.dashboardId,
			dashboardName: board.bordName,
			folderID: board.folderId,
      folderName: board.folderName,
			dashboardCategory: board.folderType == 1 ? 'public' : 'private',
		});
	}
	submit(){
		var board = this.state.board;
		var param = {
			id: board.dashboardId, 
			graphList: []
		}
		var boardList = this.state.boardList;
		for(var i=0; i<boardList.length; i++){
			var item = boardList[i];
			if(item.isAdd){
				param.graphList.push(item.id);
			}
		}
		_base.ajax({
			url : '/Dashboard/addGraph',
			type : 'POST',
			data: param,
			success : function(data){
				if(data.success){
					this.hide();
					this.props.onAddSuccess(param.graphList);
				}else{
					if(data.errorCode == 20303){
						this.error($(this.$refs.graphname), '图表名称已存在');
					}else{
						_base.serverError(data.errorCode);
					}
				}
				DATracker.track('submmitAddGraph', {
					productID: _base.nowLoginInfo.currProduct.id,
					productName: _base.nowLoginInfo.currProduct.name,
					actionType: 'save',
					dashboardID: board.dashboardId,
					dashboardName: board.bordName,
					folderID: board.folderId,
					folderName: board.folderName,
					dashboardCategory: board.folderType == 1 ? 'public' : 'private',
					graphNumber: param.graphList.length
				});
			}.bind(this),
			error : function(){
				_base.serverError(data.errorCode);
			}.bind(this)
		})
	}
	render(){
		var items 	  = [];
		var type      = this.state.type;
		var boardList = this.state.boardList;
		var isAdmin   = (this.state.roleId=="管理员")? true:false;
		var isAnalyst = (this.state.roleId=="分析师")? true:false;

		for(var i=0; i<boardList.length; i++){
			var item = boardList[i];
			items.push(
				<div key={"graph"+i} onClick={this.onBoardClick.bind(this, item.id)} 
				className={"pull-left boarditem "+(item.isIn? "added":"")+(item.isAdd? "active":"")} value={item.id}>
					<span className="autocut" title={item.name}>{item.name}<br/><span className="creator">创建人：{item.creatorName}</span></span>
					<i className="demo-icon icon-right-circle"></i>
				</div>
			)
		}
		return (
				<div className="modal fade in" ref="modeCnt" data-backdrop="static">
					<div className="modal-dialog modal-window addDetail">
						<div className="modal-content" style={{"width": "650px", "marginTop": "160px"}}>
							<div className="modal-header" style={{height: "68px"}}>
								<div className={"btn-group btn-group-hubble pull-left "+(isAdmin? "":"hide")}>
									<button onClick={this.tabChange.bind(this, "mine")} className={"btn btn-"+(type=="mine"? "primary":"default")}>我的</button>
									<button onClick={this.tabChange.bind(this, "inner")} className={"btn btn-"+(type=="inner"? "primary":"default")}>内置</button>
									<button onClick={this.tabChange.bind(this, "all")} className={"btn btn-"+(type=="all"? "primary":"default")}>全部</button>
								</div>
								<div className={"btn-group btn-group-hubble pull-left "+(isAnalyst? "":"hide")}>
									<button onClick={this.tabChange.bind(this, "mine")} className={"btn btn-"+(type=="mine"? "primary":"default")}>我的</button>
									<button onClick={this.tabChange.bind(this, "inner")} className={"btn btn-"+(type=="inner"? "primary":"default")}>内置</button>
								</div>
								<div className="input-group search-group pull-right">
									<input ref="search" className="form-control" placeholder="搜索单图名称或创建人" />
									<span className="input-group-addon" onClick={this.getData.bind(this)}>
										<i className="demo-icon icon-search"></i>
									</span>
								</div>
							</div>
							<div className="modal-body clearfix">
								{items}
								<div ref="noGraph"></div>
							</div>
							<div className="modal-footer">
								<button onClick={this.submit.bind(this)} className="btn btn-primary pull-right">确定</button>
								<button onClick={this.cancel.bind(this)} className="btn btn-default pull-right">取消</button>
							</div>
						</div>
					</div>
				</div>
		)
	}
}
	 
export default AddGraph;