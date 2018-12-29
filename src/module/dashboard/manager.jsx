/**
 * @author: 范杨(hzfanyang@corp.netease.com)
 * @date: 2018-07-18
 * @description: 看板右侧control模块
 */
import _base 		from '../../../common/base';
import React from 'react';
import BoardControl from './bordControl';
import TopTool		from './topTool';
import AddGraph 	from './addGraph';
import Loading from '../../../business/component/loading';

class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //当前选中的看板
      board: null,
      loading: true
    }
  }
  componentDidMount() {

  }
  /**
   * 选中一个看板
   * @param {*} board 
   */
  selectBoard(board) {
    //选中一个新的看板之前，先把之前的查询cancel掉
    this.refs.boardControl.cancelAll();
    this.refs.boardControl.clearData();
    this.state.board = board;
    this.refs.topTool.setData(board);
    this.getDBRList();
  }
  /**
   * 获取当前看板所包含的单图列表
   * @param  {[type]} dashboardId [description]
   * @return {[type]}             [description]
   */
  getDBRList() {
    let { board } = this.state;
    let that = this;
    _base.ajax({
      url: '/Dashboard/getDGRList',
      type: 'GET',
      data: {dashboardId: board.id},
      success: (data) => {
        this.setState({ loading: false });
        if(data.success) {
          var dataSource = data.relatedObject;
          that.refs.boardControl.setData({data:dataSource, dashboardId:board.id});
          var param = that.refs.topTool.getParam();
          that.refs.boardControl.getData(param);
        } else {
          var msg = '';
          if(data.errorCode == '20310') {
            msg = '看板不存在';
            setTimeout(function(){
              window.location.href = '/analytics/dashboard#nowProductId=' + _base.getNowProductId() + "="; 
            }, 2000);
          }
          if(data.errorCode == '20311') {
            msg = '没有该看板的权限';
            setTimeout(function(){
              window.location.href = '/analytics/dashboard#nowProductId=' + _base.getNowProductId() + "="; 
            }, 2000);
          }
          _base.serverError(data.errorCode, msg);
        }
      },
      error: () => {
        this.setState({ loading: false });
      }
    })
  }
  paramChange() {
    var param = this.refs.topTool.getParam();
    this.refs.boardControl.getData(param);
  }
  addGraph(board) {
    this.refs.addGraph.show(board);
  }
  editTypeChange(flag) {
    this.refs.boardControl.changeEditType(flag);
    //this.getDBRList();
  }
  addSuccess(graphList) {
    //let { board } = this.state;
    this.refs.boardControl.addData(graphList);
    //this.getDBRList(board.id);
  }
  render() {
    const { loading } = this.state;
    return (
      <div className="dashboard-wrap">
        <div className="toptool clearfix" id="topTool">
          <TopTool ref="topTool"
          onParamChange={ e => this.paramChange(e) }
          onAddGraph={ e => this.addGraph(e) }
          onEditTypeChange={ e => this.editTypeChange(e) }/>
        </div>
        <div id="content" className="content clearfix" style={{position: "relative", padding: "0px 10px", minWidth: "1220px"}}>
            {
              loading ? <Loading /> : null
            }
            <div id="graphList" style={{marginTop: "-20px"}}>
              <BoardControl ref="boardControl"/>
            </div>
            <div id="addGraphWin">
              <AddGraph ref="addGraph" onAddSuccess={ e => this.addSuccess(e) }/>
            </div>
            <div id="detailWinBox"></div>
            <div id="noGraph" className="noGraph"></div>
        </div>
      </div>
    )
  }
}

export default Manager;
