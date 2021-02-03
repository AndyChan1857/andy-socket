export default class MiniSocket {
  private minisocket!: WebSocket // socket实例对象
  private timeoutObj!: number // 心跳倒计时
  private serverTimeoutObj!: any // 心跳轮询
  private timeout!: number // 心跳时间
  private lockReconnect: boolean = false // 节流阀
  private timeoutnum!: any
  private destroyedFlag: boolean = false // 行为关闭配置
  private options!: Options // 配置参数
  private initFlag: boolean = false

  constructor(options: Options) {
    this.options = options
    this.timeout = (options.time || 28) * 1000  
    this.initWebSocket()
  }

  // 初始化socket
  initWebSocket() {
    this.minisocket = new WebSocket(this.options.url)
    this.minisocket.onopen = this.onopen.bind(this)
    this.minisocket.onmessage = this.onMessage(this.options.callback)
    this.minisocket.onclose = this.onclose.bind(this)
    this.minisocket.onerror = this.onerror.bind(this)
  }

  // 成功通知
  onopen() {
    this.start()
  }

  // 关闭通知
  onclose() {
    // 断开
    !this.destroyedFlag && this.reconnect();
  }

  // 错误通知
  onerror() {
    // 断开重连
    this.reconnect();
    this.options.onError && this.options.onError()
  }

  // 消息通知
  onMessage(callback: (res: any) => (void)) {
    return (res: any) => {
      // 重置心跳
      this.reset()
      if( res.data === '连接成功'  ) {
        // 是否第一次初始化
        if( !this.initFlag ) {
          this.options.onSuccess && this.options.onSuccess(res.data)
          this.initFlag = true
        }
        return 
      }
      if( res.data === 'ping') {
        return 
      }
      try {
        let data = JSON.parse(res.data)
        callback && callback(data)
      } catch (error) {
        callback && callback(res.data)
      }
    }
  }

  close() {
    this.destroyedFlag = true
    this.minisocket && this.minisocket.close()
  }

  send(data: any) {
    this.minisocket.send(data);
  }

  // 开启心跳
  start() {
    this.timeoutObj && clearTimeout(this.timeoutObj)
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
    this.timeoutObj = setTimeout(() => {
      // 发送一个心跳，后端收到后，返回一个心跳消息，
      if (this.minisocket.readyState === 1) {
        // 特殊心跳字段处理
        if (this.options.sendData) {
          this.minisocket.send(JSON.stringify(this.options.sendData))
        } else {
          this.minisocket.send("ping");
        }
      } else {
        this.reconnect();
      }
      this.serverTimeoutObj = setTimeout(() => {
        // 超时关闭
        this.minisocket.close();
      }, this.timeout);
    })
  }

  // 重置socket
  reset() {
    // 清除时间 重置心跳
    clearTimeout(this.timeoutObj);
    clearTimeout(this.serverTimeoutObj);
    // 重启心跳
    this.start();
  }

  reconnect() {
    // 重新连接
    if (this.lockReconnect) { return }
    this.lockReconnect = true;
    // 没连接上会一直重连，设置延迟避免请求过多
    this.timeoutnum && clearTimeout(this.timeoutnum);
    this.timeoutnum = setTimeout(() => {
      this.initWebSocket();
      this.lockReconnect = false;
    }, 5000);
  }
}

interface Options {
  url: string
  callback: (res: any) => (void)
  sendData?: object | string,
  time?: number,
  onSuccess?: (res: any) => (void)
  onError?: () => (void)
}
