const yaml = require("yaml");
const moment = require("moment")
const fs = require("fs");
const speedtest = require("./speedtest")
const config_path = "./config.yaml"
const geoip = require("geoip-lite")
const dns = require("dns");
const Clash = require("./ClashApi");
var proxies = []
//数组去重的方法
function unique(arr) {
    let result = {};
    let finalResult = [];
    for (let i = 0; i < arr.length; i++) {
        result[arr[i].server] = arr[i];
    }
    for (item in result) {
        finalResult.push(result[item]);
    }
    return finalResult;
}
async function lookup(server) {
    return new Promise((resolve, reject) => {
        dns.lookup(server, function (err, address) {
            resolve({ err, address })
        })
    })
}
module.exports = async (config) => {
    const sub_list = config.$config.SubList
    for (const sub of sub_list) {
        if (sub.enabled) {
            try {
                const sub_content = fs.readFileSync(`./temp/${sub.id}.yaml`, "utf8").replace(/!<str>/g, '')
                const yaml_sub = yaml.parse(sub_content)
                proxies = proxies.concat(yaml_sub.proxies)
            } catch (error) {
                console.log(`合并订阅${sub.id}失败`, error);
            }
        }
    }
    console.log(`节点合并完成，共${proxies.length}个`);
    proxies = unique(proxies)
    console.log(`节点去重完成，共${proxies.length}个`);


    var yaml_config = {
        proxies:[],
        "proxy-groups": [ {
            name: "所有节点",
            type: "select",
            proxies: []
        }]
    }
    proxies.forEach((proxie, index) => {
        proxie.name = index
        yaml_config.proxies.push(proxie)
        yaml_config["proxy-groups"][0].proxies.push(index)
    });
   
    console.log(`共${yaml_config.proxies.length}个节点，写入文件:./temp/nodes.yaml`);
    fs.writeFileSync(`./temp/nodes.yaml`, yaml.stringify(yaml_config))
    
     const res=await  Clash.setConfigs("/home/runner/work/clashpool/clashpool/temp/nodes.yaml")
     const p=await Clash.getProxies()
     console.log(p.data);

}

// const emoji = {
//     'US': '🇺🇸', 'HK': '🇭🇰', 'SG': '🇸🇬',
//     'JP': '🇯🇵', 'TW': '🇹🇼', 'CA': '🇨🇦',
//     'GB': '🇬🇧', 'CN': '🇨🇳', 'NL': '🇳🇱',
//     'TH': '🇹🇭', 'BE': '🇧🇪', 'IN': '🇮🇳',
//     'IT': '🇮🇹', 'PE': '🇵🇪', 'RO': '🇷🇴',
//     'AU': '🇦🇺', 'DE': '🇩🇪', 'RU': '🇷🇺',
//     'KR': '🇰🇷', 'DK': '🇩🇰', 'PT': '🇵🇹',
//     'FR': '🇫🇷', 'CY': '🇨🇾', 'ES': '🇪🇸',
//     'NL': '🇳🇱', 'VN': '🇻🇳', 'FL': '🇫🇮',
//     'CH': '🇨🇭', 'BG': '🇧🇬', 'ZA': '🇿🇦',
//     'RELAY': '',
//     'NOWHERE': '',
// }
// for (const proxie of proxies) {
//     //重命名
//     const { err, address } = await lookup(proxie.server)
//     if (!err) {
//         // console.log(proxie.server,address);
//         const lookup = geoip.lookup(address)
//         if (lookup != null) {
//             let name_emoji;
//             if (emoji[lookup.country]) {
//                 name_emoji = emoji[lookup.country]
//             } else {
//                 name_emoji = emoji["NOWHERE"]
//             }
//             if (NameMap[`${name_emoji}${lookup.country}`] == undefined) {
//                 NameMap[`${name_emoji}${lookup.country}`] = 0
//             } else {
//                 NameMap[`${name_emoji}${lookup.country}`] += 1
//             }
//             proxie.name = `${name_emoji}${lookup.country}|${NameMap[`${name_emoji}${lookup.country}`]}`
//             proxy_list.push(proxie)
//             proxygroups.proxies.push(proxie.name)
//         }
//     }

// }