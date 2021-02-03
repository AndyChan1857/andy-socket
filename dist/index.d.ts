export default class MiniSocket {
    private minisocket;
    private timeoutObj;
    private serverTimeoutObj;
    private timeout;
    private lockReconnect;
    private timeoutnum;
    private destroyedFlag;
    private options;
    private initFlag;
    constructor(options: Options);
    initWebSocket(): void;
    onopen(): void;
    onclose(): void;
    onerror(): void;
    onMessage(callback: (res: any) => (void)): (res: any) => void;
    close(): void;
    send(data: any): void;
    start(): void;
    reset(): void;
    reconnect(): void;
}
interface Options {
    url: string;
    callback: (res: any) => (void);
    sendData?: object | string;
    time?: number;
    onSuccess?: (res: any) => (void);
    onError?: () => (void);
}
export {};
