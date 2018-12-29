import React 		from 'react';
import ReactDOM 	from 'react-dom';
import base 		from '../../../common/base';
import Component    from '../../../business/component/component';

const username    = base.nowLoginInfo.username;  //登录用户名
class AddMember extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //所有用户列表
            originList: [],
            //筛选之后的列表
            accountList: []
        }
    }
    componentDidMount(){
        $(this.refs.modeCnt).modal("show");
        $(this.refs.modeCnt).on('hidden.bs.modal', this.props.onCancel);
        this.getAccount();
    }
    /**
     * 关键字搜索用户
     * @param {*用户名或邮箱} txt 
     */
    searchMember(txt){
        txt = txt? txt.trim():'';
        let list = this.state.originList;
        let resu = [];
        if(txt==''){
            //搜索空字符串的话，返回全部数据
            for(let i=0; i<list.length; i++){
                let item = list[i];
                if(item.accountId === username){
                    continue;
                }else{
                    resu.push(item);
                }
            }
        }else{
            //否则按关键子模糊匹配
            for(let i=0; i<list.length; i++){
                let item = list[i];
                if(item.accountId === username){
                    continue;
                }
                if(item.name.indexOf(txt)>-1 || item.accountId.indexOf(txt)>-1){
                    resu.push(item);
                }
            }
        }
        this.setState({accountList: resu});
    }
    /**
     * 提交添加成员请求
     */
    onSubmit(){
        let { board } = this.props;
        let that = this;

        //部分可见
        let list = this.state.originList;
        let resu = [];
        for(let i=0; i<list.length; i++){
            if(list[i].hasShared){
                resu.push(list[i].accountId);
            }
        }
        base.ajax({
            url: '/Dashboard/shareDashboard',
            data: {
                dashboardId: board.dashboardId,
                userIdList: resu
            },
            success: function(data){
                if(data.success){
                    that.onCancel()
                }
            }
        })
        
    }
    onCancel(){
        $(this.refs.modeCnt).modal("hide");
    }
    getAccount(){
        let { board } = this.props;
        let that = this;
        base.ajax({
            url: '/Dashboard/getSharedUser',
            type: 'GET',
            data: {dashboardId: board.dashboardId},
            success: function(data){
                if(data.success){
                    that.state.originList = data.relatedObject;
                    that.searchMember();
                }
            }
        })
    }
    addMemberChoice(item){
        let list = this.state.accountList;
        for(let i=0; i<list.length; i++){
            if(list[i].accountId == item.accountId){
                list[i].hasShared = !item.hasShared;
                break;
            }
        }
        this.setState({accountList: list});
    }
    getLeftChildren(){
        let list = this.state.accountList;
        let resu = [];
        for(let i=0; i<list.length; i++){
            let item   = list[i];
            let clazz  = 'demo-icon ';
                clazz += item.hasShared? 'icon-checkbox-checked':'icon-checkbox';
                resu.push(
                <li key={item.name+item.accountId} onClick={this.addMemberChoice.bind(this,item)}>
                    <span  title=''>
                        <i className={clazz}></i>
                        <span className="autocut memberName">{item.name}</span>
                        <span className="autocut memberAccountId"> {item.accountId}</span>
                    </span>
                </li>
            )
        }
        return resu;
    }
    getRightChildren(){
        let list = this.state.accountList;
        let resu = [];
        for(let i=0; i<list.length; i++){
            let item   = list[i];
            if(item.hasShared){
                resu.push( 
                    <li key={item.name+item.accountId}>
                        <span>{item.name} </span>
                        <span> ( {item.accountId} )</span>
                        <i className="demo-icon icon-wrong-small" onClick={this.addMemberChoice.bind(this,item)}></i>
                    </li>
                )
            }
        }
        return resu;
    }
    render(){
        let leftList  = this.getLeftChildren();
        let rightList = this.getRightChildren();

        return(
            <div className="modal fade" ref="modeCnt" data-backdrop="static">
            <div className="modal-dialog modal-window addMember" style={{width: "818px"}}>
                <div className="modal-content">
                    <div className="modal-header">
                        <span onClick={this.onCancel.bind(this)} className="demo-icon icon-wrong"></span>
                    </div>
                    <div className="modal-body clearfix">
                        <div className="leftBox">
                            <div className="transition-all">
                                <Component.Search onSearch={this.searchMember.bind(this)} placeholder="搜索用户名或邮箱"></Component.Search>
                                <ul className="memberList">
                                    {leftList}
                                </ul>
                            </div>
                            <div className={"see-all transition-all hide"}>全部成员可见</div>
                        </div>
                        <div className="rightBox transition-all">
                            <div className="head">已选成员（{rightList.length}人）</div>
                            <ul className="choiceList">
                                {rightList}
                            </ul>
                        </div>   
                    </div>
                    <div className="modal-footer">
                            <button onClick={this.onSubmit.bind(this)} className="btn btn-primary pull-right">确 定</button>
                            <button onClick={this.onCancel.bind(this)} className="btn btn-default pull-right">取 消</button>
                    </div>
                </div>
            </div>
         </div>
        )
    }
}

class Wrap extends React.Component{
    constructor(){
        super();
        this.state = {
            show: false,
            board: null
        }
    }
    show(board){
        this.state.board = board;
        let that = this;
        base.ajax({
			url: '/Dashboard/detail',
			type: 'GET',
			data: {id: board.dashboardId},
			success: function(data){
				if(data.success) {
					var dashboard = data.relatedObject;
                    that.setState({show: true, board: board});
				}
			},
			error: function(e){

			}
		})
       
    }
    hide(){
        this.setState({show: false});
    }
    render(){
        const { board } = this.state;
        let com = this.state.show? <AddMember board={ board } onCancel={this.hide.bind(this)} /> : <div></div>;
        return com;
    }
}
let div = document.createElement('div');
document.body.appendChild(div);
let wrapObj = ReactDOM.render(<Wrap />,div);
export default wrapObj;
