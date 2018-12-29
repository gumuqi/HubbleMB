/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2018-12-05
 * @description: 概览上半部分
 */
import React from 'react';
import CSSModules from 'react-css-modules';

import Item from './item';

import styles from './index.less';

class TabControl extends React.Component {
	/**
	 * 通知每个子模块去查询数据
	 */
	getData(param) {
		const { boxData } = this.props;
		boxData.map(box => {
			this.refs[box.name].getData(param);
		})
	}	
	render(){
		const { boxData } = this.props;
		return (
			<div styleName="tab-cnt" className="clearfix">
			{
				boxData.map(box => {
					return <Item ref={ box.name } key={ box.name } detail={ box } />
				})
			}
			</div>
		)
	}
}

const turnCss = CSSModules(TabControl, styles, { allowMultiple: true });

export default turnCss;