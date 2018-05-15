const model = {
    "转账":{
        entities:[
            {name:"金额", type:[
                {"builtin.currency":function(data){
                    return `${data.resolution.value} ${data.resolution.unit} `
                }},
                {"builtin.number":function(data){
                    return data.resolution.value
                }}
            ]},
            {name:"日期", type:[
                {"builtin.datetimeV2.date":function(data){
                    return data.resolution.values[0].value
                }},
            ]},
            {name:"收款人", type:[
                {
                    "通讯.联系人姓名":function(data) {
                        return data.entity
                    }
                }
            ]},
        ]
    }
}

module.exports = model;