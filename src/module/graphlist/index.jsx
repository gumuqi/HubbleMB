
import React from 'react';
import ReactDOM from 'react-dom';
import _base 	from '../../common/base';
import Graph 	from './module/graph';
import Toptool  from './module/toptool';
import AddGraphWin from '../../business/bookmark/graphNew';

import '../../business/message/message';
import '../../../css/less/import.less';

_base.setHistory('单图管理');

	var graphObj = new Graph().$inject('#graphCnt');
	var toolObj  = new Toptool().$inject('#topTool');
	var addObj;

	//存放新建单图时的弹窗
	let winContainer = document.getElementById('addGraphWin-in-analytics');
	if(!winContainer) {
		let cont = document.createElement('div');
		cont.id = 'addGraphWin-in-analytics';
		document.body.appendChild(cont);
		addObj = ReactDOM.render(<AddGraphWin onSubmit={ e => getGraphList() }/>, cont);
	}
			
				
	toolObj.$on('search', function(keyword){
		getGraphList(keyword);
	});
	toolObj.$on('rangeChange', function(range){
		getGraphList();
	});
	toolObj.$on('typeChange', function(type){
		graphObj.changeType(type);
		var keyword = toolObj.getKeyword();
		getGraphList(keyword);
	});
	graphObj.$on('addToBoard', function(graph){
		addObj.show(graph, 'submmitAddToDashboard' , null, {
			winTitle: '单图添加到看板',
			submitTxt: '完成'
		});
	});

	function getGraphList(keyword){
		var range   = toolObj.getRange();
		graphObj.loadingStart();
		var param = {
			type: range,
			keyWord: keyword || ''
		};
			

		_base.ajax({
			url		: '/Dashboard/getGraphList',
			type	: 'GET',
			data  	: param,
			success : function(data) {
				graphObj.loadingEnd();
				if(data.success) {
					var relatedObject = data.relatedObject;
					graphObj.setData(relatedObject);
				}
			},
			error: function() {
				graphObj.loadingEnd();
				_base.serverError();
			}
		});
	}
	
	getGraphList();
