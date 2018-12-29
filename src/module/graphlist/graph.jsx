import Regular 		from '../../../../../lib/regular/regular';
import _base 		from '../../../common/base';
import Component	from '../../../business/component/component';
	
    var GraphItem = Regular.extend({
    	name: 'GraphItem',
		template: '<div class="board-cnt" >' +
						'<div class="board-preview" ref="boardPreview">' +
						    '{#if graph.type == "inner"}' +
							  '<span class="innerGraph">Hubble</span>' +
							'{/if}' +
							'<img src={"./dist/img/graph-"+graph.chartType+".png"} class={"graph-"+graph.chartType}/>' +
						'</div>' +
						'<div class="board-footer">' +
							'<div class={"board-title autocut " + (graph.isEditing? "hide":"")} title={graph.name}>{graph.name}</div>' +
							'<input on-keydown={this.onKeydown($event)} ref="graphNameInput" class={"form-control graph-input " + (graph.isEditing? "":"hide")} value="{graph.name}" maxlength="30">' +
							'<div class="board-info autocut">{graph.creatorName} &nbsp;&nbsp; 创建于：{graph.createTime}</div>' +
							'<div class="board-tools">' +
								'<a on-click={this.onAddClick($event)}>添加到看板</a>' +
								'{#if graph.type != "inner"}' +
									'{#if (graph.isMy)}' +
									'<i on-click={this.onEditName($event)} class="demo-icon icon-15"></i>' +
									'<i on-click={this.onDeleteClick($event)} class="demo-icon icon-dustbin" data-toggle="tooltip" title="删除该单图"></i>' +
									'{/if}' +
								'{/if}' +
							'</div>' +
						'</div>' +
				  '</div>',
		config: function(){

		},
		init: function(){
			var graph = this.data.graph;
			var url   = '/analytics/'
			switch(graph.model){
				case 'event':
					url += 'segmentation';
					break;
				case 'funnels':
					url += 'funnels';
					break;
				case 'ration':
					url += 'retention';
					break;
				case 'addiction':
					url += 'addiction';
					break;
				case 'userAttributes':
					url += 'user_attribute';
					break;
				case 'route':
					url += 'behaviorpath';
					break;
				default:
					url  = '';
			}
			if(graph.type != 'inner') {
				$(this.$refs.boardPreview).click(function(){
					location.href = url + '?graphId=' + graph.id  + '#nowProductId=' +  _base.getNowProductId() + '=';
				});
			}
			this.data.roleId  = _base.nowLoginInfo.roleId;
		},
		/**
		 * 编辑名称
		 * @return {[type]} [description]
		 */
		onEditName: function(e){

			var graph = this.data.graph;
			if(graph.isMy || this.data.roleId){
				//
			}else{
				return;
			}

			graph.isEditing = true;
			graph = _base.extend(graph, {
				isEditing: true
			})
			this.$update({graph: graph});
			e.stopPropagation();
			this.$emit('editName', graph.id);
		},
		onKeydown: function(e){
			if(e.event.keyCode == 13){
				this.saveGraph();
			}
		},
		/**
		 * 保存看板
		 * @return {[type]} [description]
		 */
		saveGraph: function(){
			var graph = this.data.graph;
			if(!graph.isEditing) return;
			var name  = this.$refs.graphNameInput.value;
			var flag  = this.checkName(name);
			if(!flag) return;

			var param = {
				id: graph.id,
				name: name
			}
			_base.ajax({
				url : '/Dashboard/saveGraph',
				type : 'POST',
				data: param,
				success : function(data){
					if(data.success){

						var gg = _base.extend(graph, {
							isEditing: false,
							name: name
						})
						this.$update({graph: gg});
					}else{
						var $nameInput 	= $(this.$refs.bordNameInput);
						this.nameError($nameInput, '名称重复');
					}
				}.bind(this),
				error : function(){
					
				}.bind(this)
			})
		},
		/**
		 * 名称格式验证
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		checkName: function(name) {
			var bool 		= true;
			var pattern 	= new RegExp(_base.specialCode);
			var $nameInput 	= $(this.$refs.graphNameInput);
			var bordname 	= $.trim(name);
			if(bordname == "") {
				this.nameError($nameInput, '不能为空');
				bool = false;
			} else if(pattern.test(bordname)){  
				this.nameError($nameInput, _base.specialMsg);
				bool = false;
			} else{
				$nameInput.popover('destroy');
				$nameInput.css({'border-color':'#d2d6de'});
				bool = true;
			} 
			return bool;
		},
		/**
		 * 输入框异常提示
		 */
		nameError : function($input,message) {
			if(!$input) return;
			$input.attr('data-content', message || _base.specialMsg);
			$input.attr('data-placement', 'top');

			$input.focus();  
			$input.css({'border-color':'red'});
			$input.popover('show');
		},
		onAddClick: function(){
			var graph = this.data.graph;
			this.$emit('addToBoard',graph);
			DATracker.track('operateGraph', {
				productID: _base.nowLoginInfo.currProduct.id,
				productName: _base.nowLoginInfo.currProduct.name,
				module: graph.model,
				graphID: graph.id,
				graphName: graph.name,
				graphCategory: graph.chartType,
				actionType: 'addToDashboard'
			});
		},
		onDeleteClick: function(){

			$('#confirmModal').find('.modal-body >p').text('确定要删除该单图吗？');
			$('#confirmModal').modal({
				backdrop: false,
				show: true
			});
			$('#confirmModal').off('click');
			$('#confirmModal').on('click', '.ok' ,function() {
				this.delGraph();
				$('#confirmModal').modal('hide');
			}.bind(this));
			$('#confirmModal').on('click', '.cancel' ,function() {
				$('#confirmModal').modal('hide');
			});
		},
		//删除单图
		delGraph: function(){
			var graph = this.data.graph;
			var param = {
				id: graph.id
			}
			_base.ajax({
				url : '/Dashboard/deleteGraph',
				type : 'POST',
				data: param,
				success : function(data){
					this.$emit('graphDelete', graph.id);
				}.bind(this),
				error : function(){
					
				}.bind(this)
			})
		},
    });

	var GraphTable = Regular.extend({
		name: 'GraphTable',
		template: '<div class="table-cnt">' +
				  '<table class="table">' +
				  '<thead>' +
				  	  '{#list headData as head}' +
							'<th on-click={this.onSort(head.key)}>{head.name}' +
							'{#if head.sort!=""}<i class={"demo-icon icon-"+head.sort}></i>{/if}</th>' +
				  	  '{/list}' +
				  '</thead>' +
				  '<tbody>' +
				  	  '{#list graphList as graph}' +
					  '<tr>' +
						  '<td>'+
						      '{#if graph.isInputing}' +
					      	    '<input ref={"td-"+graph.id} on-keydown={this.onKeydown($event, graph.id)} class="form-control first-td-input" value={graph.name} maxlength="30"/>' +
							  '{#else}'+
							    '{#if graph.type != "inner"}' +
								  '<span on-click={this.jump(graph)} class="autocut">{graph.name}</span><i on-click={this.onEditName($event, graph.id)}class="demo-icon icon-15"></i>'+
								'{#else}' +
								  '<span class="autocut" style="color:#666666;">{graph.name}</span>'+
								'{/if}' +
							  '{/if}' +
					      '</td>' +
					  	  '<td>{graph.creatorName}</td>' +
					  	  '<td>{graph.createTime}</td>' +
								'<td>' +
									'<a on-click={this.onAddClick(graph)} style="cursor:pointer">添加到看板</a>' +
							   '{#if graph.type != "inner"}' +
									'{#if (graph.type!=-1 && graph.isMy)}' +
									'<i on-click={this.onDelGraph($event, graph)} class="demo-icon icon-dustbin" data-toggle="tooltip" title="删除改单图"></i>' +
									'{#else}' +
									'<i class="demo-icon icon-dustbin v-hidden"></i>' +
									'{/if}' +
							   '{/if}' +	
					  	  '</td>' +
					  '</tr>' +
					  '{/list}' +
				  '</tbody>' +
				  '</table>' +
				  '</div>',
		config: function(){
			_base.extend(this.data, {
				headData: [{
					key: 'name',
					name: '单图',
					sort: ''
				},{
					key: 'creatorName',
					name: '创建人',
					sort: ''
				},{
					key: 'createTime',
					name: '时间',
					sort: 'desc'
				},{
					name: '操作',
					sort: ''
				}]
			})
		},
		init: function(){
			$(document.body).click(function(e){

				if($(e.target).hasClass('first-td-input')){
					//点进input不处理
					return;
				}else{
					//点击其他地方，执行保存
					var list   = this.data.graphList;
					for(var i=0; i<list.length; i++){
						if(list[i].isInputing){
							this.saveGraph(list[i].id);
						}
					}
				}
			}.bind(this));
		},
		/**
		 * 编辑名称
		 * @return {[type]} [description]
		 */
		onEditName: function(e, id){
			if(e.target.tagName == 'INPUT'){
				return;
			}
			var list   = this.data.graphList;
			for(var i=0; i<list.length; i++){
				if(list[i].isInputing){
					this.saveGraph(list[i].id);
				}
			}

			e.stopPropagation();
			var curitem;
			var list   = this.data.graphList;
			for(var i=0; i<list.length; i++){
				if(id == list[i].id){
					if(list[i].isMy){
						list[i].isInputing = true;
						break;
					}else{
						return;
					}
					
				}
			}
			this.$update({graphList: list})
		},
		onKeydown: function(e, id){
			if(e.event.keyCode == 13){
				this.saveGraph(id);
			}
		},
		/**
		 * 保存单图
		 * @return {[type]} [description]
		 */
		saveGraph: function(id){
			var graph;
			var list   = this.data.graphList;
			for(var i=0; i<list.length; i++){
				if(id == list[i].id){
					graph = list[i];
					break;
				}
			}
			if(!graph.isInputing) return;
			var name  = this.$refs['td-'+id].value;
			var flag  = this.checkName(id,name);
			if(!flag) return;

			var param = {
				id: graph.id,
				name: name
			}

			_base.ajax({
				url : '/Dashboard/saveGraph',
				type : 'POST',
				data: param,
				success : function(data){
					if(data.success){
						graph.name = name;
						graph.isInputing = false;
						this.$update({graphList: list});
					}else{
						var $nameInput 	= $(this.$refs['td-'+id]);
						this.nameError($nameInput, '名称重复');
					}
				}.bind(this),
				error : function(){
					
				}.bind(this)
			})
		},
		/**
		 * 名称格式验证
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		checkName: function(id,name) {
			var bool 		= true;
			var pattern 	= new RegExp(_base.specialCode);
			var $nameInput 	= $(this.$refs['td-'+id]);
			var bordname 	= $.trim(name);
			if(bordname == "") {
				this.nameError($nameInput, '不能为空');
				bool = false;
			} else if(pattern.test(bordname)){  
				this.nameError($nameInput, _base.specialMsg);
				bool = false;
			} else{
				$nameInput.popover('destroy');
				$nameInput.css({'border-color':'#d2d6de'});
				bool = true;
			} 
			return bool;
		},
		/**
		 * 输入框异常提示
		 */
		nameError : function($input,message) {
			if(!$input) return;
			$input.attr('data-content', message || _base.specialMsg);
			$input.attr('data-placement', 'top');

			$input.focus();  
			$input.css({'border-color':'red'});
			$input.popover('show');
		},
		/**
		 * 排序
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		onSort: function(key){
			if(!key) return;

			var curTH;
			var sortType = 0;
			var headData = this.data.headData;
			for(var i=0; i<headData.length; i++){
				if(headData[i].key == key){
					curTH = headData[i];
					if(curTH.sort=='desc'){
						curTH.sort = 'asc';
						sortType   = 1;
					}else{
						curTH.sort = 'desc';
						sortType   = -1;
					}
				}else{
					headData[i].sort = '';
				}
			}

			var graphList = this.data.graphList;
			graphList.sort(function(a, b){
				if (key=='name' || key=='creatorName') {
					return sortType*a[key].localeCompare(b[key]);
			    }
			    else if(key=='createTime'){
			    	return sortType*(new Date(a[key]) - new Date(b[key]));
			    }else{
			    	return 0;
			    }
			})
			this.$update({headData: headData, graphList: graphList});
		},
		onAddClick: function(graph){
			this.$emit('addToBoard',graph);
			DATracker.track('operateGraph', {
				productID: _base.nowLoginInfo.currProduct.id,
				productName: _base.nowLoginInfo.currProduct.name,
				module: graph.model,
				graphID: graph.id,
				graphName: graph.name,
				graphCategory: graph.chartType,
				actionType: 'addToDashboard'
			});
		},
		/**
		 * 删除确认
		 * @param  {[type]} e  [description]
		 * @param  {[type]} id [description]
		 * @return {[type]}    [description]
		 */
		onDelGraph: function(e, graph){
			e.stopPropagation();
			$('#confirmModal').find('.modal-body >p').text('确定要删除该单图吗？');
			$('#confirmModal').modal({
				backdrop: false,
				show: true
			});
			$('#confirmModal').off('click');
			$('#confirmModal').on('click', '.ok' ,function() {
				this.delGraph(graph);
				$('#confirmModal').modal('hide');
			}.bind(this));
			$('#confirmModal').on('click', '.cancel' ,function() {
				$('#confirmModal').modal('hide');
			});
		},
		//删除单图
		delGraph: function(graph){
			var param = {
				id: graph.id
			}
			_base.ajax({
				url : '/Dashboard/deleteGraph',
				type : 'POST',
				data: param,
				success : function(data){
					this.$emit('graphDelete', graph.id);
				}.bind(this),
				error : function(){
					
				}.bind(this)
			})
		},
		/**
		 * 跳转到单图页
		 * @param  {[type]} id [description]
		 * @return {[type]}    [description]
		 */
		jump: function(graph){
			var url   = '/analytics/'
			switch(graph.model){
				case 'event':
					url += 'segmentation';
					break;
				case 'funnels':
					url += 'funnels';
					break;
				case 'ration':
					url += 'retention';
					break;
				case 'addiction':
					url += 'addiction';
					break;
				case 'userAttributes':
					url += 'user_attribute';
					break;
				case 'route':
				    url += 'behaviorpath';
				    break;
				default:
					url  = '';
			}
			location.href = url + '?graphId=' + graph.id;
		}
	})

	var GraphList = Regular.extend({
		name: 'GraphList',
		template: '{#if viewType==0}' +
					  '{#list graphList as graph}' +
					  '<GraphItem ref={graph.id} graph={graph} on-addToBoard={this.addToBoard($event)} on-graphDelete={this.onGraphDelete($event)} on-editName={this.saveGraph($event)}>' +
					  '</GraphItem>' +
					  '{/list}' +
				  '{#else}' +
				  	  '<GraphTable graphList={graphList} on-addToBoard={this.addToBoard($event)} on-graphDelete={this.onGraphDelete($event)}></GraphTable>' +
				  '{/if}' +
				  
				  '<component.Loading ref="loading"></component.Loading>' +
				  '<div ref="noGraph" class="noGraph"></div>',
		config: function(){
			_base.extend(this.data, {
				loading: true,
				viewType: 0,
				graphList : []
			})
		},
		init: function(){
			$(document.body).click(function(e){
				if($(e.target).hasClass('graph-input')){
					//点进input不处理
				}else{
					//点击其他地方，执行保存
					this.saveGraph();
				}
			}.bind(this));
		},
		/**
		 * 传入单图列表数据，并渲染列表
		 * @param {[type]} list [description]
		 */
		setData: function(list){
			var roleId = _base.getRoleId();
			for(var i=0; i<list.length; i++){
				var createTime     = list[i].createTime || "";
					createTime     = createTime.substr(0, 10);
				list[i].isEditing  = false;
				list[i].createTime = createTime;
				list[i].creatorName = list[i].creatorName? list[i].creatorName: '';
				if(roleId == "管理员"){
					list[i].isMy  = true;
				}
			}
			list.sort(function(a, b){
				return new Date(b.createTime) - new Date(a.createTime);
			})
			if(list.length==0){
				this.noGraph();
			}else{
				this.$refs.noGraph.innerHTML = '';
			}
			this.$update({graphList: list});
		},
		/**
		 * 保存单图
		 * @return {[type]} [description]
		 */
		saveGraph: function(graphId){
			if(this.data.viewType==1) return;
			var list = this.data.graphList;
			for(var i=0; i<list.length; i++){
				var id = list[i].id;
				if(graphId && graphId==id){
					continue;
				}else if(this.$refs[id]){
					this.$refs[id].saveGraph();
				}
				
				
			}
		},
		addToBoard: function(grap){
			this.$emit('addToBoard',grap);
		},
		/**
		 * 删除看板
		 * @return {[type]} [description]
		 */
		onGraphDelete: function(id){
			var result = [];
			var list   = this.data.graphList;
			for(var i=0; i<list.length; i++){
				if(id != list[i].id){
					result.push(list[i]);
				}
			}
			this.$update({graphList: result});
		},
		/**
		 * 图表、表格切换
		 * @param  {[type]} type [description]
		 * @return {[type]}      [description]
		 */
		changeType: function(type){
			if(this.data.graphList.length==0){
				return;
			}
			this.$update({viewType: type});
			if(type==0){
				$('#graphCnt').css({background: 'transparent'});
			}else{
				$('#graphCnt').css({background: '#fff'});
			}
		},
		loadingStart: function(){
			this.$refs.loading.show();
		},
		loadingEnd: function(){
			this.$refs.loading.hide();
		},
		noGraph: function(){
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
			
			$(this.$refs.noGraph).html( '没有添加任何图表' +
					    		'<small>您可以通过点击分析功能右上角添加icon，组建自己的单图</small>' +
					    		linkStr);
		}
	})

export default GraphList;