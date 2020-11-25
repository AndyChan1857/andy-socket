"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MiniSocket = /** @class */ (function () {
    function MiniSocket(options) {
        this.timeout = 28 * 1000; // 心跳时间
        this.lockReconnect = false; // 节流阀
        this.destroyedFlag = false; // 行为关闭配置
        this.options = options;
        this.initWebSocket();
    }
    // 初始化socket
    MiniSocket.prototype.initWebSocket = function () {
        this.minisocket = new WebSocket(this.options.url);
        this.minisocket.onopen = this.onopen.bind(this);
        this.minisocket.onmessage = this.onMessage(this.options.callback);
        this.minisocket.onclose = this.onclose.bind(this);
        this.minisocket.onerror = this.onerror.bind(this);
    };
    // 成功通知
    MiniSocket.prototype.onopen = function () {
        this.start();
    };
    // 关闭通知
    MiniSocket.prototype.onclose = function () {
        // 断开
        !this.destroyedFlag && this.reconnect();
    };
    // 错误通知
    MiniSocket.prototype.onerror = function () {
        // 断开重连
        this.reconnect();
    };
    // 消息通知
    MiniSocket.prototype.onMessage = function (callback) {
        var _this = this;
        return function (res) {
            // 重置心跳
            _this.reset();
            if (res.data === '连接成功' || res.data === 'ping') {
                return;
            }
            try {
                var data = JSON.parse(res.data);
                callback && callback(data);
            }
            catch (error) {
                callback && callback(res.data);
            }
        };
    };
    MiniSocket.prototype.close = function () {
        this.destroyedFlag = true;
        this.minisocket && this.minisocket.close();
    };
    MiniSocket.prototype.send = function (data) {
        this.minisocket.send(data);
    };
    // 开启心跳
    MiniSocket.prototype.start = function () {
        var _this = this;
        this.timeoutObj && clearTimeout(this.timeoutObj);
        this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
        this.timeoutObj = setTimeout(function () {
            // 发送一个心跳，后端收到后，返回一个心跳消息，
            if (_this.minisocket.readyState === 1) {
                // 特殊心跳字段处理
                if (_this.options.pingData) {
                    _this.minisocket.send(JSON.stringify(_this.options.pingData));
                }
                else {
                    _this.minisocket.send("ping");
                }
            }
            else {
                _this.reconnect();
            }
            _this.serverTimeoutObj = setTimeout(function () {
                // 超时关闭
                _this.minisocket.close();
            }, _this.timeout);
        });
    };
    // 重置socket
    MiniSocket.prototype.reset = function () {
        // 清除时间 重置心跳
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        // 重启心跳
        this.start();
    };
    MiniSocket.prototype.reconnect = function () {
        var _this = this;
        // 重新连接
        if (this.lockReconnect) {
            return;
        }
        this.lockReconnect = true;
        // 没连接上会一直重连，设置延迟避免请求过多
        this.timeoutnum && clearTimeout(this.timeoutnum);
        this.timeoutnum = setTimeout(function () {
            // 新连接
            _this.initWebSocket();
            _this.lockReconnect = false;
        }, 5000);
    };
    return MiniSocket;
}());
exports.default = MiniSocket;
