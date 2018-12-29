import Regular 		from '../../../../../lib/regular/regular';
import _base 		from '../../../common/base';

	var TopTool = Regular.extend({
		name: 'TopTool',
		template: ''  +
		        '{#if roleId!="普通用户" && roleId!="自定义角色" && roleId!="分析师"}' +
		        '<div class="btn-group btn-group-hubble pull-left"> ' +
					'<button on-click={this.onRangeChange("mine")} class={"btn btn-"+(range=="mine"? "primary":"default")}>我的</button>' +
					'<button on-click={this.onRangeChange("inner")} class={"btn btn-"+(range=="inner"? "primary":"default")}>内置</button>' +
					'<button on-click={this.onRangeChange("all")} class={"btn btn-"+(range=="all"? "primary":"default")}>全部</button>' +
				 '</div>' +
				 '{/if}' +
				 '{#if roleId=="分析师"}' +
				 '<div class="btn-group btn-group-hubble pull-left"> ' +
					 '<button on-click={this.onRangeChange("mine")} class={"btn btn-"+(range=="mine"? "primary":"default")}>我的</button>' +
					 '<button on-click={this.onRangeChange("inner")} class={"btn btn-"+(range=="inner"? "primary":"default")}>内置</button>' +
				  '</div>' +
				  '{/if}' +
		         '<div class="pull-right">' +
					  '<div on-click={this.onTypeChange(0)} class={"pull-left filterBtn "+(type==0? "active":"")}><i class="demo-icon icon-chart"></i></div>' +
					  '<div on-click={this.onTypeChange(1)} class={"pull-left filterBtn "+(type==1? "active":"")}><i class="demo-icon icon-bars-light"></i></div>' +
					  '<div class="pull-left input-group search-group">' +
			              '<input ref="searchInput" class="form-control" placeholder="输入单图名称/名称/邮箱">' +
			              '<span on-click={this.onSearch()} class="input-group-addon"><i class="demo-icon icon-search"></i></span>' +
			          '</div>' +
			       '</div>',
		/**
		 * type=0代表显示图，type=1代表显示表格
		 * @return {[type]} [description]
		 */
		config: function(){
			_base.extend(this.data, {
				type: 0,
				range: 'mine',
				roleId: _base.getRoleId()
			})
		},
		init: function(){
			var that = this;
			$(this.$refs.searchInput).keydown(function(e){
				if(e.keyCode==13){
					that.onSearch();
				}
			})
		},
		onRangeChange: function(range){
			if(range==this.data.range) return;
			this.data.range = range;
			this.$update({range: range});
			this.$emit('rangeChange', range);
		},
		onTypeChange: function(type){
			this.$update({type: type});
			this.$emit('typeChange', type);
		},
		getKeyword: function(){
			return $(this.$refs.searchInput).val();
		},
		getRange: function(){
			return this.data.range;
		},
		onSearch: function(){
			var keyWord = $(this.$refs.searchInput).val();
			this.$emit('search', keyWord);
		}
	})

export default TopTool;