/**
* @version 1.0 sqlite操作文件
* @todo 待解决的事情：   采用面向对象实现，这样在拼接SQL的时候就不用受到上次调用同样方法的影响，这样不用再每个方法都传一个固定的object对象
*/
(function(window){
    var u = {};
    u.trim = function(str){
        if(String.prototype.trim){
            return str == null ? "" : String.prototype.trim.call(str);
        }else{
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
    };
    u.isArray = function(obj){
        if(Array.isArray){
            return Array.isArray(obj);
        }else{
            return obj instanceof Array;
        }
    };
    // 文件操作状态码
    u.fsCode = ['没有错误','找不到文件错误','不可读取错误','编码格式错误','无效操作错误','无效修改错误','磁盘溢出错误','文件已存在错误'];
    u.db = null; // 数据库对象
    u.dbInfo = null; // 存储了是否打开了数据库的相关信息

    // 数据库存放在widget的路径,对应要复制到fs目录下的地址固定为fs://sqlite/
    u.dbPath = {"draft" : "widget://res/draft.sqlite"};
    u.fs = null;
    u.storeArr = []; // 用于存放配置对象的数组
    u.idleIds = []; // 空闲已经被释放的optionId
    /**
     * 创建一个用于存放各种属性的对象
     */
    u.createObj = function(){
        if(u.idleIds.length > 0){
            var optionId = u.idleIds.pop();
        }else{
            var optionId = u.storeArr.length;
        }

        u.storeArr[optionId] = new Object;

        return optionId;
    };
    /**
     * 打开数据库
     * */
    u._openDb = function(optionId,success,fail){
        if(!u.db){
            u.db = api.require('db');
        }
        if (u.storeArr[optionId].dbName == '') {
            console.error('sqlite数据库名称为空');
            return false;
        }

        // 获取用户是否已经打开该数据库了
        if(!u.dbInfo){
            u.dbInfo = $api.getStorage('sqlite_dbInfo');
            if(u.dbInfo == undefined){
                u.dbInfo = {};
            }
        }

        if(u.dbInfo[u.storeArr[optionId].dbName]){
            // 该数据库已经打开了，无需重新打开
            if (typeof success == 'function'){
                success();
            }
            return true;
        }

        if (!u.fs) {
            u.fs = api.require('fs');
        }

        var filepath = u.getDbPath(u.storeArr[optionId].dbName);
        //先检查fs 有无数据库文件
        u.fs.exist({
            path: filepath
        },function(ret,err){
            if(ret.exist){
                //找到数据库了 并查询看能用不
                u._simpleOpenDb(optionId,filepath,success,fail);
            }else{
                //没有找到数据库 就拷贝一份到fs 目录
                u.fs.copyTo({
                    oldPath: u.dbPath[u.storeArr[optionId].dbName],
                    newPath: "fs://sqlite"
                },function(ret,err){
                    if (ret.status) {
                        u._simpleOpenDb(optionId,filepath,success,fail);
                    }else {
                        if(typeof fail == 'function'){
                            if(err.code != undefined){
                                var msg = u.fsCode[err.code];
                            }else{
                                var msg = '文件复制失败';
                            }
                            fail(msg);
                        }
                    }
                });
            }
          });
    };
    /**
     * 打开数据库
     */
    u._simpleOpenDb = function(optionId,filepath,success,fail){
        // 打开数据库
        u.db.openDatabase({
            name : u.storeArr[optionId].dbName,
            path : filepath
        }, function(ret, err) {
            if(ret.status){
                u.dbInfo[u.storeArr[optionId].dbName] = true;
                $api.setStorage('sqlite_dbInfo',u.dbInfo);
                if(typeof success == 'function'){
                     success();
                }
            } else {
                if(typeof fail == 'function'){
                    fail(err.msg);
                }
            }
        });
    };
    /*
     * 判断某个数据库是否已经打开
     * */
    u.judgeDb = function(dbName){
    };
    /**
     * 关闭数据库
     */
    u.closeDb = function(optionId,callback){
        if(!u.db){
            u.db = api.require('db');
        }
        u.db.closeDatabase({
            name : u.storeArr[optionId].dbName
        }, function(ret, err){
            if(ret.status){
                u.dbInfo[u.storeArr[optionId].dbName] = true;
                $api.setStorage('sqlite_dbInfo',u.dbInfo);
                if(typeof callback == 'function'){
                    callback();
                }
            }else{
                api.toast({msg:'关闭数据库'+dbName+'失败！'});
            }
        });
    };
    /**
     *  设置要连接的数据库和数据表
     */
    u.config = function(optionId,tbName,dbName){
        u.storeArr[optionId].tbName = tbName;
        u.storeArr[optionId].dbName = dbName;
        u.storeArr[optionId].fields = '*';
        u.storeArr[optionId].where_str = ''; // where条件语句
        u.storeArr[optionId].order_str = ''; // order by语句
        u.storeArr[optionId].limit_str = '';   // limit 子句
        u.storeArr[optionId].group_str = ''; // group by 子句
        u.storeArr[optionId].last_sql = ''; // 最终的SQL语句
        u.storeArr[optionId].distinct_str = '';
        u.storeArr[optionId].having_str = '';

        return this;
    };
    /**
     * 获取数据库对应的fs路径
     */
    u.getDbPath = function(dbName){
        return 'fs://sqlite/'+dbName + '.sqlite';
    };
    /**
     * 执行数据库操作
     */
    u._execute = function(optionId,callback,destroy,msg){
        // 打开数据库
        u._openDb(optionId,function(){
            u.db.executeSql({
                name: u.storeArr[optionId].dbName,
                sql: u.storeArr[optionId].last_sql
            }, function(ret, err){
                if(ret.status){
                    if(undefined == destroy || destroy){
                        u.destoryObj(optionId);
                    }
                    callback && callback(ret.status,'ok');
                }else{
                    if(err.msg == 'Database Not Open'){
                        // 重新打开一遍数据库
                        var filepath = u.getDbPath(u.storeArr[optionId].dbName);
                        u._simpleOpenDb(optionId,filepath,function(){
                            u.db.executeSql({
                                name: u.storeArr[optionId].dbName,
                                sql: u.storeArr[optionId].last_sql
                            }, function(ret, err){
                                if(undefined == destroy || destroy){
                                    u.destoryObj(optionId);
                                }
                                if(ret.status){
                                    callback && callback(ret.status,'ok');
                                }else{
                                    callback && callback(false,err.msg);
                                }
                            });
                        },function(){
                            if(undefined == destroy || destroy){
                                u.destoryObj(optionId);
                            }
                            api.toast({
                                msg:msg
                            });
                        });
                    }else{
                        if(undefined == destroy || destroy){
                            u.destoryObj(optionId);
                        }
                        callback && callback(false,err.msg);
                    }
                }
            });
        },function(msg){
            if(undefined == destroy || destroy){
                u.destoryObj(optionId);
            }
            api.toast({
                msg:msg
            });
        });
    };
    u._query = function(optionId,callback,destroy,msg){
        // 打开数据库
        u._openDb(optionId,function(){
            u.db.selectSql({
                name : u.storeArr[optionId].dbName,
                sql: u.storeArr[optionId].last_sql
            }, function(ret, err){
                if(ret.status){
                    if(undefined == destroy || destroy){
                        u.destoryObj(optionId);
                    }
                    callback && callback(ret.status,ret.data);
                }else{
                    if(err.msg == 'Database Not Open'){
                        // 重新打开一遍数据库
                        var filepath = u.getDbPath(u.storeArr[optionId].dbName);
                        u._simpleOpenDb(optionId,filepath,function(){
                            u.db.selectSql({
                                name: u.storeArr[optionId].dbName,
                                sql: u.storeArr[optionId].last_sql
                            }, function(ret, err){
                                if(undefined == destroy || destroy){
                                    u.destoryObj(optionId);
                                }
                                if(ret.status){
                                    callback && callback(ret.status,ret.data);
                                }else{
                                    callback && callback(false,err.msg);
                                }
                            });
                        },function(){
                            if(undefined == destroy || destroy){
                                u.destoryObj(optionId);
                            }
                            api.toast({
                                msg:msg
                            });
                        });
                    }else{
                        if(undefined == destroy || destroy){
                            u.destoryObj(optionId);
                        }
                        callback && callback(false,err.msg);
                    }
                }
            });
        },function(msg){
            if(undefined == destroy || destroy){
                u.destoryObj(optionId);
            }
            api.toast({
                msg:msg
            });
        });
    };
    /**
     * 查询
     */
    u.select = function(optionId,callback,destroy){
        u.storeArr[optionId].last_sql = 'SELECT '+u.storeArr[optionId].distinct_str+u.storeArr[optionId].fields+' FROM `'+u.storeArr[optionId].tbName+'` '+u.storeArr[optionId].where_str + u.storeArr[optionId].group_str + u.storeArr[optionId].having_str + u.storeArr[optionId].order_str + u.storeArr[optionId].limit_str;

        u._query(optionId,function(status,data){
            callback && callback(status,data);
        },destroy);
    };
    /**
     * 更新
     * @param 是否销毁对象标识，默认不传为true
     */
    u.save = function(optionId,data,callback,destroy){
        if(undefined == data || !data ){
            console.error('请传递要更新的参数');
            return false;
        }

        if (typeof(data) == 'string') {
            var update = data;
        }else if(typeof(data) == 'object'){
            if(u.isArray(data)){
                console.error('不允许为数组类型');
                return false;
            }

            var str = [],type = '';
            for (var i in data) {
                type =  typeof(data[i]);
                switch (type) {
                    case "string" :
                        str.push(i+'="'+u.quotesConvert(data[i])+'"');
                        break;
                    case "object" :
                        if(undefined == data[i].type){
                            console.error(i+'的type参数错误');
                            return false;
                        }
                        if(undefined == data[i].value){
                            console.error(i+'的value参数错误');
                            return false;
                        }
                        if(isNaN(data[i].value)){
                            console.error(i+'的value只允许为数字');
                            return false;
                        }
                        data[i].type = data[i].type.toLowerCase();
                        if(data[i].type == 'dec'){
                             str.push(i+'='+i+'-'+data[i].value);
                        }else if(data[i].type == 'inc'){
                             str.push(i+'='+i+'+'+data[i].value);
                        }else{
                            console.error('更新参数'+i+'的type内容只允许为dec或inc');
                            return false;
                        }
                        break;
                     case 'number' :
                        str.push(i+'='+data[i]);
                        break;
                     default :
                        console.error('更新参数'+i+'的内容类型只能为对象、字符串或数字');
                }
            }
            if(str.length == 0){
                console.error('更新参数为空');
                return false;
            }
            var update = str.join(',');
        }else{
            console.error('更新参数类型错误');
            return false;
        }
        u.storeArr[optionId].last_sql = 'UPDATE `'+u.storeArr[optionId].tbName+'` SET '+update+u.storeArr[optionId].where_str + u.storeArr[optionId].order_str + u.storeArr[optionId].limit_str;

        u._execute(optionId,function(status,msg){
            callback && callback(status,msg);
        },destroy);
    };
    /**
     * 添加
     * @param obj   option配置选项对象，必须传递
     * @param data 插入的数据，数组形式。
     * @param callback 程序执行结果回调函数
     */
    u.add = function(optionId,data,callback,destroy){
        // 拼接SQL
        if(!u.isArray(data) || data.length == 0){
            console.error('请传递数组或数组为空');
            return false;
        }

        var element = data.shift();

        if(u.isArray(element) && typeof(element) != 'object'){
            console.error('插入的数据类型必须是json对象');
            return false;
        }

        var fields = [];
        var values = [];
        for (var i in element) {
            fields.push(i);
            values.push(u.quotesConvert(element[i]));
        }

        var fields_str = fields.join('`,`');

        if(!fields_str){
            console.error('数据类型有误');
            return false;
        }

        var sql = ' INSERT INTO `'+u.storeArr[optionId].tbName+'`(`'+fields_str+'`) VALUES ("'+values.join('","')+'")';

        if (data.length > 0) {
            var val = [],join_str='';
            values=[];
            for (var i = 0; i < data.length;++i) {
                val = [];
                for (var item in data[i]) {
                    val.push(u.quotesConvert(data[i][item]));
                }
                join_str = val.join('","');
                if(join_str){
                    values.push('("'+join_str+'")');
                }
            }
            u.storeArr[optionId].last_sql = sql +','+values.join(',');
        } else {
            u.storeArr[optionId].last_sql = sql;
        }

        // 执行SQL
        u._execute(optionId,function(status,msg){
            callback && callback(status,msg);
        },destroy);
    };
    /**
     * 删除
     */
    u.del = function(optionId,callback,destroy){
        if(u.storeArr[optionId].where_str == ''){
            console.error('请传递where条件');
            return false;
        }

        u.storeArr[optionId].last_sql = 'DELETE FROM `'+u.storeArr[optionId].tbName+'` '+u.storeArr[optionId].where_str + u.storeArr[optionId].order_str + u.storeArr[optionId].limit_str;

        u._execute(optionId,function(status,msg){
            callback && callback(status,msg);
        },destroy);
    };
    /**
     * group 子句
     */
    u.group = function(optionId,group){
        if(group){
            u.storeArr[optionId].group_str =  ' GROUP BY '+group+' ';
        }

        return this;
    };
    /**
     * distinct
     */
    u.distinct = function(optionId,distinct){
        if(typeof(distinct) == 'boolean' && distinct){
            u.storeArr[optionId].distinct_str = ' DISTINCT ';
        }
    };
    /**
     * having子句
     */
    u.having = function(optionId,having){
        if(typeof(having) == 'string' && having) {
            u.storeArr[optionId].having_str = ' HAVING '+having+' ';
        }

        return this;
    }
    /**
     * order子句
     */
    u.order = function(optionId,order){
        if(order){
            u.storeArr[optionId].order_str = ' ORDER BY '+order;
        }

        return this;
    };
    /**
     * limit条件
     */
    u.limit = function(optionId,offset,length){
        if (length == undefined) {
            if(offset){
                u.storeArr[optionId].limit_str = (' LIMIT '+offset);
            }else{
                u.storeArr[optionId].limit_str = '';
            }
        }else if( undefined != offset){
            u.storeArr[optionId].limit_str = (' LIMIT '+offset+','+length);
        }

        return this;
    };
    /**
     * 转换双引号或单引号前加 \ 符号
     */
    u.quotesConvert = function(text,mark){
        if(typeof(text) != 'string' || !text){
            return text;
        }

        if(undefined == mark){
            mark = '"';
        }

        mark = mark.substr(0,1);
        if(mark == '\\'){
            mark == '\\\\';
        }

        if (mark == '"'){
            var wrapper = '\'';
        }else{
            var wrapper = '"';
        }
        var str = 'var tmp=text.replace(/\\'+mark+'/g,'+wrapper+mark+wrapper+');tmp.replace(/'+mark+'/g,'+wrapper+'\\\\'+mark+wrapper+')'
        var result = eval(str);
        return result;
    };
    /*
     *  where条件
     */
    u.where = function(optionId,where){
        var type = typeof(where);
        switch(type){
            case "string" :
                if(!where){
                    u.storeArr[optionId].where_str = '';
                }else{
                    u.storeArr[optionId].where_str = ' WHERE '+where;
                }
                break;
            case "object" :
                var str = "";
                var exeTimes = 0; // 执行次数，用来获取是否是json对象的第一个元素
                for (var i in where) {
                    i =  u.trim(i);
                    if(!i){
                        continue;
                    }
                    ++exeTimes;
                    if(i == ')'){
                        str += ')';
                        continue;
                    }
                    i = i.replace(/\s+/g,' ');
                    var arr = i.split(' ');
                    if(undefined != arr[0]){
                        arr[0] = arr[0].toLowerCase();
                    }
                    if(undefined != arr[1]){
                        arr[1] = arr[1].toLowerCase();
                    }

                    if(exeTimes == 1 || (arr[0] == ')' || arr[0] == '(' || arr[0] == 'and' || arr[0] == 'or' || arr[1] == 'and' || arr[1] == 'or')) {
                        if(arr[arr.length - 1] == 'like' || arr[arr.length - 1] == '<' || arr[arr.length - 1] == '>' || arr[arr.length - 1] == '=' || arr[arr.length - 1] == '>=' || arr[arr.length - 1] == '<=' || arr[arr.length - 1] == '<>' ) {
                            str += (' '+i);
                        } else {
                            str += (' '+i+'=');
                        }
                    }else{
                        if(arr[arr.length - 1] != undefined){
                            arr[arr.length - 1] = arr[arr.length - 1].toLowerCase();
                        }
                        if(arr[arr.length - 1] == 'like' || arr[arr.length - 1] == '<' || arr[arr.length - 1] == '>' || arr[arr.length - 1] == '=' || arr[arr.length - 1] == '>=' || arr[arr.length - 1] == '<=' || arr[arr.length - 1] == '<>' ) {
                            str += (' AND '+i);
                        } else {
                            str += (' AND '+i+'=');
                        }
                    }
                    if (typeof(where[i]) == 'string') {
                        where[i]  = u.quotesConvert(where[i]);
                        str += ('"'+where[i]+'"');
                    } else if (!isNaN(where[i])) {
                        str += where[i];
                    }
                }
                if(!str){
                    u.storeArr[optionId].where_str = '';
                }else{
                    u.storeArr[optionId].where_str = ' WHERE '+str;
                }
                break;
            default :
                    console.error('where条件错误');
         }

         return this;
    };
    /**
     * 指定要查询的字段
     */
    u.fields = function(optionId,fields){
        if(u.isArray(fields)){
            u.storeArr[optionId].fields = fields.join(',');
        }else if(typeof(fields) == 'string'){
            u.storeArr[optionId].fields = fields;
        }

        return this;
    };
    /**
     * SQL语句查询
     */
    u.query = function(optionId,sql,callback,destroy){
        u.storeArr[optionId].last_sql = sql;
        u._query(optionId,function(status,data){
            callback && callback(status,data);
        },destroy);
    };
    /**
     * SQL语句添加。删除、更新操作
     */
    u.exec = function(optionId,sql,callback,destroy){
        u.storeArr[optionId].last_sql = sql;
        u._execute(optionId,function(status,msg){
            callback && callback(status,msg);
        },destroy);
    };
    /**
     *  销毁对象
     */
    u.destoryObj = function(optionId){
        if(undefined != u.storeArr[optionId]){
            u.storeArr[optionId] = null;
            u.idleIds.push(optionId);
        };
    };
    /*
     * 清除数据库打开标识
     * */
    u.clearDb = function(){
        u.dbInfo = {};
        $api.setStorage('sqlite_dbInfo',{});
    };
    window.$sqlite_api = u;
})(window);
