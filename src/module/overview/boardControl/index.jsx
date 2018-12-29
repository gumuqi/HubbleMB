
import React from 'react';
import Item  from './item';

class BoardControl extends React.Component {
	/**
	 * 通知每个子模块去查询数据
	 */
	getData(param) {
		const { boxData } = this.props;
		boxData.map(box => {
			this.refs[box.name].getData(param);
		})
	}
	render() {
		const { boxData } = this.props;

		return (
			<div>
			{
				boxData.map(box => {
					return(
						<Item ref={ box.name } key={ box.name } detail={ box }></Item>
					)
				})
			}
			</div>
		);
	} 
}

export default BoardControl;
