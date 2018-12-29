import React 		 from 'react';
import CSSModules from 'react-css-modules';

import Icon from 'antd-mobile/lib/icon';

import Wrapper from '../leftdrawer';
import Filter from './filter';
import BoardControl  from './boardControl';

import styles from './index.less';

let boardData = [{
    id: 11,
    name: '活跃用户数',
    subname: '今日累计',
    model: 'realtime',
    graphId: 'activeUser',
    condition: '{"type":"Total","chartType":"number"}',
    layouts: {
        w: 3,
        h: 8,
        x: 0,
        y: 0,
        static: true
    }
},{
    id: 12,
    name: '活跃设备数',
    subname: '今日累计',
    model: 'realtime',
    graphId: 'activeDevice',
    condition: '{"type":"Total","chartType":"number"}',
    layouts: {
        w: 3,
        h: 8,
        x: 3,
        y: 0,
        static: true
    }
},{
    id: 13,
    name: '浏览量',
    subname: '今日累计',
    model: 'realtime',
    graphId: 'pv',
    condition: '{"type":"Total","chartType":"number"}',
    layouts: {
        w: 3,
        h: 8,
        x: 6,
        y: 0,
        static: true
    }
},{
    id: 14,
    name: '激活设备数',
    subname: '今日累计',
    model: 'realtime',
    graphId: 'newUser',
    condition: '{"type":"Total","chartType":"number"}',
    layouts: {
        w: 3,
        h: 8,
        x: 9,
        y: 0,
        static: true
    }
},{
    id: 21,
    name: '活跃用户数',
    subname: '今日实时',
    model: 'realtime',
    graphId: 'activeUser',
    condition: '{"type":"Interval","chartType":"line","windowLength":"5"}',
    layouts: {
        w: 6,
        h: 12,
        x: 0,
        y: 8,
        static: true
    }
},{
    id: 22,
    name: '活跃设备数',
    subname: '今日实时',
    model: 'realtime',
    graphId: 'activeDevice',
    condition: '{"type":"Interval","chartType":"line","windowLength":"5"}',
    layouts: {
        w: 6,
        h: 12,
        x: 6,
        y: 8,
        static: true
    }
},{
    id: 31,
    name: '浏览量',
    subname: '今日实时',
    model: 'realtime',
    graphId: 'pv',
    condition: '{"type":"Interval","chartType":"line","windowLength":"5"}',
    layouts: {
        w: 6,
        h: 12,
        x: 0,
        y: 20,
        static: true
    }
},{
    id: 32,
    name: '激活设备数',
    subname: '今日实时',
    model: 'realtime',
    graphId: 'newUser',
    condition: '{"type":"Interval","chartType":"line","windowLength":"5"}',
    layouts: {
        w: 6,
        h: 12,
        x: 6,
        y: 20,
        static: true
    }
},{
    id: 41,
    name: 'Top访问页面',
    subname: '今日累计',
    model: 'realtime',
    graphId: 'pvTop',
    condition: '{"type":"TopN","chartType":"top-chart"}',
    layouts: {
        w: 6,
        h: 18,
        x: 0,
        y: 32,
        static: true
    }
},{
    id: 42,
    name: 'Top活跃版本',
    subname: '今日累计（设备）',
    model: 'realtime',
    graphId: 'appversionTop',
    condition: '{"type":"TopN","chartType":"top-chart"}',
    layouts: {
        w: 6,
        h: 18,
        x: 6,
        y: 32,
        static: true
    }
}]

class Manager extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        openFilter: false,
        boardData: []
      }
    }
    componentDidMount() {
        this.setState({
            boardData: boardData
        }, () => {
            this.getData()
        })
    }
    onOpenWrawer(e) {
		const { openFilter } = this.state;
		this.setState({ openFilter: !openFilter });
	}
	/**
	 * 切换产品
	 */
	onProductChange() {
		// 先把右侧应用列表更新
		this.refs.filter.rebuild();
		// 然后执行查询
		this.getData();
	}
	getData() {
		let param = this.refs.filter.getParam();
		Object.assign(param, {
			productId: globalData.currProduct.id
		})

		this.refs.boardControl.getData(param);
	}
    render() {
       
        const { leftDrawerOpen } = this.props;
        const { openFilter, boardData } = this.state;
        return (
            <Wrapper>
                <div styleName="filter" className={ leftDrawerOpen ? 'hide' : '' }onClick={ e => this.onOpenWrawer(e) }>
                    筛选<Icon type="down" size="xs" style={{ marginverticalAlign: 'bottom' }}/>
                </div>
                <div className={ openFilter ? 'hide' : '' }>
                    <BoardControl ref="boardControl" boxData={ boardData }/>
                </div>
                <Filter
                    ref="filter"
                    open={ openFilter }
                    onSearch={ e => this.getData(e) }
                    onOpenChange={ e => this.onOpenWrawer(e) }
                >
                </Filter>
            </Wrapper>
        )
        
    }
}
const turnCss = CSSModules(Manager, styles, { allowMultiple: true });

export default turnCss;