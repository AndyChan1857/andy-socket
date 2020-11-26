# andy-socket
___
一个集成心跳的socket小插件

# demo
___
```js
import andySocket from 'andy-socket'
let socket = new andySocket({
  url: 'xxx',
  callback:(data) => (console.log(`接收到了服务器发送的${data}`))
  // sendData: 'xxx',
  // time: 48
})
```

# options
___
url<string, socket连接地址,无默认值,必传>

sendData<string | object, 发送心跳ping包自定义数据,默认值'ping',非必传> 
注:sendData自动处理了转JSON.strinfly

callback<function, 接收服务端数据回调方法,无默认值,必传>

time<number, 心跳包发送时长间隔,默认28秒,非必传>

# Api
___
send<同socket的send方法>
```js
  let socket = new andySocket(options)
  socket.send()
```
close<同socket的close方法>
```js
  let socket = new andySocket(options)
  socket.close()
```
