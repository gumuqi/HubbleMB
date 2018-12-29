window.globalData = {
    loginInfo: {}
};
/**
 * 日期格式化
 * @param fmt
 * @returns
 */
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

/**
 * differ	相差differ天的时间
 * return   相差differ的毫秒数
 */
Date.prototype.DifferDate = function (differ) { //author: meizz 
    var differ = this.getTime()-differ*24*60*60*1000;
    return differ;
};
/**
 * 数组去重
 * 如果是对象数组，keys代表唯一标识字段，可以是多个
 */
Array.prototype.unique = function(params){
    var res = [];
    var json = {};
    for(var i = 0; i < this.length; i++){
    var key = this[i];
    var str = key;
    //如果数组元素是对象
    if(typeof key =='object' && !!params){
        str = '';
        for(var j=0; j<params.length; j++){
            str += key[params[j]]
        }
    }
    if(!json[str]){
        res.push(key);
        json[str] = 1;
    }	
    }
    return res;
}

/**
 * 数组对象排序，参数为对象的属性
 * 根据属性的个数及顺序，一次按属性对数组进行排序
 * 如学生数组，先按班级排序，然后在各个班级内，按年龄排序[{name:'张三', age:18, class:1}]
 */
Array.prototype.sortByFields = function(field1, field2, field3, field4 ){
    //by函数接受一个成员名字符串做为参数
    //并返回一个可以用来对包含该成员的对象数组进行排序的比较函数
    var compare = function(name, prename){
        return function(o, p){
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                //prename一样的才排序
                if(prename && (o[prename] != p[prename])){
                    return 0;
                }
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            }
            else {
                throw ("error");
            }
        }
    }
    
    if(!field1){
        this.sort();
    }
    //按第一个属性排序
    if(field1){
        this.sort(compare(field1));
    }
    
    //在第一个属性排序后的基础上，进行第二个排序
    if(field2){
        this.sort(compare(field2, field1));
    }
    
    if(field3){
        this.sort(compare(field3, field2));
    }

    if(field4){
        this.sort(compare(field4, field3));
    }

}
/**
 * 去除所有空格
 */
String.prototype.trim = function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
　  }
/**
 * 去掉左边空格
 */
String.prototype.ltrim=function(){
　　return this.replace(/(^\s*)/g,"");
}
/**
 * 去掉右边空格
 */
String.prototype.rtrim=function(){
　　return this.replace(/(\s*$)/g,"");
}

export default {
    formatNum: function(str){
        str = "" + str;
        if(isNaN(str)){ //不是数字直接返回
            return str;
        }
        var newStr = "";
        var count = 0;
         
        if(str.indexOf(".")==-1){
            for(var i=str.length-1;i>=0;i--){
                if(count % 3 == 0 && count != 0){
                    newStr = str.charAt(i) + "," + newStr;
                }else{
                    newStr = str.charAt(i) + newStr;
                }
                count++;
           }
           str = newStr + ""; //自动补小数点后两位
        }
        else
        {
            for(var i = str.indexOf(".")-1;i>=0;i--){
                if(count % 3 == 0 && count != 0){
                    newStr = str.charAt(i) + "," + newStr;
                }else{
                    newStr = str.charAt(i) + newStr; //逐个字符相接起来
                }
                count++;
           }
           str = newStr + (str + "00").substr((str + "00").indexOf("."),3);
        }
        return str;
    },
    randomString    : function(len) {
    　　len = len || 32;
    　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    　　var maxPos = $chars.length;
    　　var pwd = '';
    　　for (let i = 0; i < len; i++) {
    　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return pwd;
    },
}