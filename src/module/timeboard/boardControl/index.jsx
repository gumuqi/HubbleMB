//总控制器
import React from 'react';

import Item  from './item';


class Control extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			interList : []
		}
	}
	//通知每个box去服务端取数据
	getData(param){
		const { boxData } = this.props;
		const { interList } = this.state;

		for(let i=0; i<interList.length; i++){
			clearInterval(interList[i]);
		}
		
		for(let i=0; i<boxData.length; i++){
			let box   = boxData[i];
			this.refs[box.id].setParam(param);
			this.refs[box.id].getChartData(); //请求每个box的数据
		}
	}
	/**
	 * 取消所有查询
	 */
	cancelAll(){
		const { boxData } = this.props;

		for(var i=0; i<boxData.length; i++){
			var box = boxData[i];
			this.refs[box.id].cancelWhenLeave();
		}
	}
	render() {
		const { boxData } = this.props;
		
		return (
			<div style={{ paddingTop: '23px' }}>
			{
				boxData.map(box => {
					return(
						<Item ref={ box.id } key={ box.name + box.subname } detail={ box }></Item>
					)
				})
			}
			</div>
		);
	} 
}

export default Control;
