/*
 * @Description: 实现webpack
 * @Author: Daito Chai
 * @Date: 2021-04-05 16:18:15
 * @LastEditors: Daito Chai
 * @LastEditTime: 2021-04-05 20:33:19
 */

const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

// 初始化ID
let ID = 0

// 遍历单个文件（解析代码、构建AST、查找依赖）
function createAsset(fileName) {

    // 1、通过node读取文件内容，不加 ‘utf-8’ 默认读取为字节流
    // const content = fs.readFileSync(fileName)
    const content = fs.readFileSync(fileName, 'utf-8')

    // 将代码解析成AST抽象语法树
    const ast = parser.parse(content, {
        sourceType: 'module'
    })
    // console.log(ast);

    const dependencies = []
    traverse(ast, {
        // 查看AST语法树，获取依赖文件路径(只会检查import路径、不会验证依赖是否存在)
        ImportDeclaration: ({ node }) => {
            dependencies.push(node.source.value)
        }
    })
    // console.log(dependencies);

    // transformFromAstAsync 返回promise对象，transformFromAstSync返回值
    const { code } = babel.transformFromAstSync(ast, null, {
        // 插件集合，相当于n个plugin
        presets: ['@babel/preset-env']
    })
    // console.log(code);

    let id = ID++

    return {
        id,
        fileName,
        code,
        dependencies,
    }
}

// 单文件测试
// const indexAsset = createAsset('./src/index.js')
// console.log(indexAsset);

// 获取文件依赖
function createGraph(entry) {
    const allAsset = createAsset(entry)
    const queue = [allAsset]

    // 模拟递归
    for (const asset of queue) {
        const dirname = path.dirname(asset.fileName)

        // 通过id寻找相对路径下的文件，防止项目中出现重复的文件
        asset.mapping = {}

        asset.dependencies.forEach(relativePath => {
            const absolutePath = path.join(dirname, relativePath)
            const child = createAsset(absolutePath)

            asset.mapping[relativePath] = child.id

            queue.push(child)// 实现再次遍历
        })
    }
    return queue
}

function bundle(graph) {
    let modules = ''

    graph.forEach(mod => {
        modules += `
            ${mod.id}: [
                function (require, module, exports) {
                    ${mod.code}
                },
                ${JSON.stringify(mod.mapping)}
            ],
        `
    })

    const result = `
        (function(modules) {
            function require(id) {
                const [fn, mapping] = modules[id]

                function localRequire(relativePath) {
                    return require(mapping[relativePath])
                }

                const module = {
                    exports: {}
                }
                
                fn(localRequire, module, module.exports)

                return module.exports
            }
            
            require(0)
        })({${modules}})
    `

    return result
}

const graph = createGraph('./src/index.js')
// console.log(graph);

const result = bundle(graph)

console.log(result);


// ————————————————————————————————————编译结果↓↓↓↓↓↓↓↓↓↓

// (function (modules) {
//     function require(id) {
//         const [fn, mapping] = modules[id]

//         function localRequire(relativePath) {
//             return require(mapping[relativePath])
//         }

//         const module = {
//             exports: {}
//         }

//         fn(localRequire, module, module.exports)

//         return module.exports
//     }

//     require(0)
// })({
//     0: [
//         function (require, module, exports) {
//             "use strict";

//             var _info = _interopRequireDefault(require("./info.js"));

//             function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//             /*
//             * @Description: 主文件
//             * @Author: Daito Chai
//             * @Date: 2021-04-05 16:22:34
//             * @LastEditors: Daito Chai
//             * @LastEditTime: 2021-04-05 18:13:50
//             */
//             // import info1 from './info1'
//             // 依赖不存在 traverse 仍然会获取路径
//             console.log(_info["default"]);
//         },
//         { "./info.js": 1 }
//     ],

//     1: [
//         function (require, module, exports) {
//             "use strict";

//             Object.defineProperty(exports, "__esModule", {
//                 value: true
//             });
//             exports["default"] = void 0;

//             var _consts = require("./consts.js");

//             /*
//             * @Description: 导出变量文件
//             * @Author: Daito Chai
//             * @Date: 2021-04-05 16:22:34
//             * @LastEditors: Daito Chai
//             * @LastEditTime: 2021-04-05 18:32:33
//             */
//             var _default = "\u6B22\u8FCE\u52A0\u8F7D".concat(_consts.company);

//             exports["default"] = _default;
//         },
//         { "./consts.js": 2 }
//     ],

//     2: [
//         function (require, module, exports) {
//             "use strict";

//             Object.defineProperty(exports, "__esModule", {
//                 value: true
//             });
//             exports.company = void 0;

//             /*
//             * @Description: 导出变量
//             * @Author: Daito Chai
//             * @Date: 2021-04-05 16:22:34
//             * @LastEditors: Daito Chai
//             * @LastEditTime: 2021-04-05 17:14:42
//             */
//             var company = '这是consts.js里面的变量';
//             exports.company = company;
//         },
//         {}
//     ],
// })
