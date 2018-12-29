import _base 				from '../../../common/base';
import React 				from 'react';
import ReactDOM 			from 'react-dom';
import echarts    			from '../../../../../plugins/chartjs/echarts.common.min';
import moment				from '../../../../../plugins/daterangepicker/moment';
import daterangepicker      from '../../../../../plugins/daterangepicker/daterangepicker';
import easyselect      		from '../../../../../plugins/bootstrap-select/bootstrap-easyselect';
import BusinessChoiceApp   	from '../../../business/businessChoiceApp/businessChoiceApp';
import Email 				from '../../../business/email/email';
import addMember 			from './addMember';
var fromDate = _base.getParamFormURL('fromDate');
var toDate = _base.getParamFormURL('toDate');

var roleId = _base.getRoleId();

class TopTool extends React.Component{
	static defaultProps = {

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
		this.state = {
			type: 1, //1为公开，2为私有，3为与我分享
			//整个页面是否处于编辑状态
			editType: false,
			dashboardId: '',
			//看板名称
			bordName: '',
			//应用列表
			appid: [],
			//操作权限
			permissions: '',
			emailEditorPermission: ''
		};
		this.choiceApp = null;
		// 保存到本地的选中的时间条件
		this._localDataDate = {};
		this._labelDate = '';
	}
	//基本配置渲染完之后，去拿图数据
	componentDidMount(){
		var that = this;
		var emailEditorPermission;

		var callback = function(permissionArr, permissionList) {
			if(!permissionList) return;
			if(permissionList.indexOf('emailManager:access') > -1) {
				emailEditorPermission = 'edit';
			}
		};
		//获取权限
		_base.permission.on('permission:default', function(eventName, permissionArr, permissionList) {
			callback(permissionArr, permissionList);
			that.setData({emailEditorPermission: emailEditorPermission});
		});
		
		that.choiceApp = new  BusinessChoiceApp().$inject(this.refs.choiceApp);
		that.choiceApp.$on('change', function(data) {
			that.state.appid = data.appid;
			if (!data.default) {
				that.props.onParamChange();
			}
		});
		that.choiceApp.$on('loadDataOk', function(hasChoice) {
			if (!hasChoice) {
				that.state.appid = [];
			}
		});
		
	}
	componentWillUpdate(){

	}

	setLocalDate() {
		localStorage.setItem(this._labelDate, JSON.stringify(this._localDataDate));
	}
	getLocalDate() {
		this._localDataDate = {};
		var localData = localStorage.getItem(this._labelDate);
		if(!!localData){
			try {
				this._localDataDate = JSON.parse(localData);
			} catch (error) {}
		}
	}
	// 时间选择控件初始化
	dateComDefalut(id) {
		var that = this;

		var loginInfo = _base.nowLoginInfo;
		var productId = _base.getNowProductId();
		var username  = loginInfo.username;
		that._labelDate = 'latestChoiceDashboard'+'_'+productId+'_'+username + 'dashboard_'+ id;

		that.getLocalDate();

		var startDate = moment().subtract('days', 7);
		var endDate = moment().subtract('days', 1);
		if (that._localDataDate.chosenLabel) {
			if (that._localDataDate.chosenLabel === '今天') {
				startDate = moment().subtract('days', 0);
				endDate = moment().subtract('days', 0);
			} else
			if (that._localDataDate.chosenLabel === '昨天') {
				startDate = moment().subtract('days', 1);
				endDate = moment().subtract('days', 1);
			} else 
			if (that._localDataDate.chosenLabel === '过去7天') {
				startDate = moment().subtract('days', 7);
				endDate = moment().subtract('days', 1);
			} else 
			if (that._localDataDate.chosenLabel === '过去30天') {
				startDate = moment().subtract('days', 30);
				endDate = moment().subtract('days', 1);
			} else 
			if (that._localDataDate.chosenLabel === '自定义' && that._localDataDate.value){
				var ddArr = that._localDataDate.value.split(' - ');
				if (ddArr.length === 2) {
					startDate = moment(ddArr[0]);
					endDate = moment(ddArr[1]);	
				}
			}
		}

		$(that.refs.timeAll).daterangepicker({
			startDate: startDate,
			endDate: endDate,
			opens: 'left'
		}).on('apply.daterangepicker',function(event, obj){
			that._localDataDate = {
				chosenLabel: obj.chosenLabel,
				value: ''
			};
			if (that._localDataDate.chosenLabel === '自定义') {
				that._localDataDate.value = event.target.value;
			}
			that.setLocalDate();
			that.props.onParamChange();
		})

		if(fromDate && toDate) {
			$(that.refs.timeAll).val( fromDate + ' - ' + toDate);
		}
	}
	setData(param){
		var data = {};
		var that = this;
		if(!param) return;

		if(param.folderType != undefined){
			//1为公开，2为私有，3为与我分享
			data.folderType = param.folderType; 
		}
		if(param.folderName != undefined) {
			data.folderName = param.folderName; 
		}
		if(param.folderId != undefined) {
			data.folderId = param.folderId; 
		}
		if(param.id != undefined){
			data.dashboardId = param.id;
		}
		if(param.name != undefined){
			data.bordName = param.name;
		}
		if(param.permissions != undefined) {
			data.permissions = param.permissions || "";
		}
		this.choiceApp.setSaveLabel('dashboard_'+ param.id);
		this.choiceApp._getAppList();
		
		this.setState({ editType: false, ...data });

		that.dateComDefalut(param.id);

	}
	//设置名称
	setName(name){
		if(!!name){
			this.setState({'bordName': name});
		}
	}
	//获取时间
	getDate(){
		var daterange = $(this.refs.timeAll).val();
		var datelist  = daterange.split(' - ');
		return {fromDate:datelist[0], toDate:datelist[1]};
	}
	//获取toptool中的参数
	getParam(){
		var param  = {};
		var date   = this.getDate();
		_base.extend(param, date);
		_base.extend(param, {appid: this.state.appid});
		return param;
	}
	onDeleteClick(){

		$('#confirmModal').find('.modal-body >p').text('确定要删除吗？');
		$('#confirmModal').modal({
			backdrop: false,
			show: true
		});
		$('#confirmModal').off('click');
		$('#confirmModal').on('click', '.ok' ,function() {
			this.delBoard();
			$('#confirmModal').modal('hide');
		}.bind(this));
		$('#confirmModal').on('click', '.cancel' ,function() {
			$('#confirmModal').modal('hide');
		});
	}
	//删除看板
	delBoard(){
		_base.ajax({
			url : '/Dashboard/deleteDashboard',
			type : 'POST',
			data: {id: this.state.dashboardId},
			success : function(data){
				window.location.href = '/analytics/dashboardmanager#nowProductId=' + _base.getNowProductId() + '=';
			}.bind(this),
			error : function(){
				
			}.bind(this)
		})
	}
	//切换整个页面的编辑状态
	onChangeEditType(){
		var flag 		= this.state.editType;

		this.setState({editType: !flag});
		this.props.onEditTypeChange(!flag);
		var board = this.state;
		
		DATracker.track('editDashboard', {
			productID: _base.nowLoginInfo.currProduct.id,
			productName: _base.nowLoginInfo.currProduct.name,
			dashboardID: board.dashboardId,
			dashboardName: board.bordName,
			folderID: board.folderId,
      		folderName: board.folderName,
			dashboardCategory: board.folderType == 1 ? 'public' : 'private',
			actionType: 'edit'
		});
	}
	/**
	 * 打开添加单图窗口
	 * @return {[type]} [description]
	 */
	onAddGraph(){
		var board = this.state;
		this.props.onAddGraph(board);

		DATracker.track('editDashboard', {
			productID: _base.nowLoginInfo.currProduct.id,
			productName: _base.nowLoginInfo.currProduct.name,
			dashboardID: board.dashboardId,
			dashboardName: board.bordName,
			folderID: board.folderId,
      		folderName: board.folderName,
			dashboardCategory: board.folderType == 1 ? 'public' : 'private',
			actionType: 'addGraph'
		});
	}
	/**
	 * 设置邮件
	 */
	onSetEmail() {
		var date   = this.getDate();
		var appid = '';
		if(this.state.appid.length) {
			appid = this.state.appid.join(',');
		} 
		var email = new Email({
			data: {
				dashboardId: this.state.dashboardId,
				fromDate: date.fromDate,
				toDate: date.toDate,
				appid: appid
			}
		}).$inject('body');
		email.$on('editorOk', function() {
			//创建邮件成
			_base.serverError('', '邮件创建成功');
		});

		var board = this.state;
		
		DATracker.track('editDashboard', {
			productID: _base.nowLoginInfo.currProduct.id,
			productName: _base.nowLoginInfo.currProduct.name,
			dashboardID: board.dashboardId,
			dashboardName: board.bordName,
			folderID: board.folderId,
      folderName: board.folderName,
			dashboardCategory: board.folderType == 1 ? 'public' : 'private',
			actionType: 'email'
		});
	}
		/**
	 * 打开添加看板分享窗口
	 */
	onAddMember(){
		var board = this.state;
		addMember.show(board);
		
		DATracker.track('editDashboard', {
			productID: _base.nowLoginInfo.currProduct.id,
			productName: _base.nowLoginInfo.currProduct.name,
			dashboardID: board.dashboardId,
			dashboardName: board.bordName,
			folderID: board.folderId,
      folderName: board.folderName,
			dashboardCategory: board.folderType == 1 ? 'public' : 'private',
			actionType: 'rights'
		});
	}
	render() {
		//看板的类型，1为公有，2为私有
		let { folderType, editType, dashboardId, permissions } = this.state;

		let editAble  = false;
		if (permissions.indexOf('edit') > -1) {
			editAble = true;
		}

		var canAddEmail = 'hide';
		if(editAble) {
			canAddEmail = '';
		} else if(this.state.emailEditorPermission == 'edit'){
			canAddEmail = '';
		}

		return 	(
			<div className={ dashboardId ? "" : "hide" }>
				
					<div className="pull-left">
						<span className="boardName pull-left" title={this.state.bordName}><span ref="bordNameSpan" className="autocut">{this.state.bordName}</span></span>
						{
							permissions.indexOf('edit') > -1 ?
							<span onClick={this.onSetEmail.bind(this)} className={"setEmail " + canAddEmail}><i className="demo-icon icon-email"></i>发送邮件</span> : null
						}
					</div>
				
				
				<div className="pull-right">
					<div className="pull-left" ref="choiceApp" style={{"marginRight":"24px"}}></div>
					<div className="pull-left input-group time-group">
						<div className="input-group-addon">
							<i className="demo-icon icon-calendar"></i>
						</div>
						<input type="text" className="pull-left form-control" ref="timeAll" readOnly="readonly"/>
					</div>
					<span className={"pull-left "+ (editAble? "":"hide")}>
						<span onClick={this.onChangeEditType.bind(this)} className={"editBtn " + (editType? "hide":"")} titile="进入编辑模式"><i className="demo-icon icon-15"></i>编辑</span>
						<span onClick={this.onChangeEditType.bind(this)} className={"editBtn " + (editType? "":"hide")} titile="退出编辑模式"><i className="demo-icon icon-15"></i>退出编辑</span>
						<span onClick={this.onAddGraph.bind(this)} className="editBtn"><i className="demo-icon icon-add"></i>添加单图</span>
						{
							folderType==2?
							<span onClick={this.onAddMember.bind(this)} className="editBtn" style={{width:"32px"}}><i className="demo-icon icon-user-filter" style={{"marginRight":"1px"}}></i></span> : null
						}
					</span>
				</div>
			</div>
		);
	}
}
	 
export default TopTool;