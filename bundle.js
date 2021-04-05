/*
 * @Description: 打包编译结果
 * @Author: Daito Chai
 * @Date: 2021-04-05 20:31:25
 * @LastEditors: Daito Chai
 * @LastEditTime: 2021-04-05 21:10:38
 */

(function (modules) {
    console.log(modules)
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
})({
    0: [
        function (require, module, exports) {
            "use strict";

            var _info = _interopRequireDefault(require("./info.js"));

            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

            /*
            * @Description: 主文件
            * @Author: Daito Chai
            * @Date: 2021-04-05 16:22:34
            * @LastEditors: Daito Chai
            * @LastEditTime: 2021-04-05 18:13:50
            */
            // import info1 from './info1'
            // 依赖不存在 traverse 仍然会获取路径
            console.log(_info["default"]);
        },
        { "./info.js": 1 }
    ],

    1: [
        function (require, module, exports) {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports["default"] = void 0;

            var _consts = require("./consts.js");

            /*
            * @Description: 导出变量文件
            * @Author: Daito Chai
            * @Date: 2021-04-05 16:22:34
            * @LastEditors: Daito Chai
            * @LastEditTime: 2021-04-05 18:32:33
            */
            var _default = "\u6B22\u8FCE\u52A0\u8F7D".concat(_consts.company);

            exports["default"] = _default;
        },
        { "./consts.js": 2 }
    ],

    2: [
        function (require, module, exports) {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.company = void 0;

            /*
            * @Description: 导出变量
            * @Author: Daito Chai
            * @Date: 2021-04-05 16:22:34
            * @LastEditors: Daito Chai
            * @LastEditTime: 2021-04-05 17:14:42
            */
            var company = '这是consts.js里面的变量';
            exports.company = company;
        },
        {}
    ],
})
