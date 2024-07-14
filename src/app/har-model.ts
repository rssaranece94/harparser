export interface HarFileResponse {
  log: Log;
}

export interface Log {
  version: string;
  creator: Creator;
  pages: Page[];
  entries: Entry[];
}

export interface Entry {
  _initiator: Initiator;
  _priority?: string;
  _resourceType: string;
  cache: Cache;
  connection?: string;
  pageref?: string;
  request: Request;
  response: Response;
  serverIPAddress: string;
  startedDateTime: string;
  time: number;
  timings: Timings;
  _fromCache?: string;
  _webSocketMessages?: WebSocketMessage[];
}

export interface WebSocketMessage {
  type: string;
  time: number;
  opcode: number;
  data: string;
}

export interface Timings {
  blocked: number;
  dns: number;
  ssl: number;
  connect: number;
  send: number;
  wait: number;
  receive: number;
  _blocked_queueing: number;
}

export interface Response {
  status: number;
  statusText: string;
  httpVersion: string;
  headers: Header[];
  cookies: any[];
  content: Content;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
  _transferSize: number;
  _error?: any;
}

export interface Content {
  size: number;
  mimeType: string;
  compression?: number;
  text?: string;
  encoding?: string;
}

export interface Request {
  method: string;
  url: string;
  httpVersion: string;
  headers: Header[];
  queryString: Header[];
  cookies: Cooky[];
  headersSize: number;
  bodySize: number;
  postData: PostData;
}

export interface PostData {
  mimeType: string;
  text: string;
}
export interface Cooky {
  name: string;
  value: string;
  path: string;
  domain: string;
  expires: string;
  httpOnly: boolean;
  secure: boolean;
}

export interface Header {
  name: string;
  value: string;
}

export interface Cache {}

export interface Initiator {
  type: string;
  url?: string;
  lineNumber?: number;
  stack?: Stack;
}

export interface Stack {
  callFrames: CallFrame[];
  parent?: Parent;
}

export interface Parent {
  description: string;
  callFrames: CallFrame[];
}

export interface CallFrame {
  functionName: string;
  scriptId: string;
  url: string;
  lineNumber: number;
  columnNumber: number;
}

export interface Page {
  startedDateTime: string;
  id: string;
  title: string;
  pageTimings: PageTimings;
}

export interface PageTimings {
  onContentLoad: number;
  onLoad: number;
}

export interface Creator {
  name: string;
  version: string;
}
