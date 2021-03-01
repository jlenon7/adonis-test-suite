import { ApiClientContract } from "src/Contracts/ApiClientContract";
import { AssertResponse } from "./AssertResponses";

export class Client {
  config: any = {
    uri: '',
    jwt: null,
    user: null,
    headers: {},
  }

  constructor(private client: ApiClientContract, private assert: any) {}

  reset(): void {
    this.config.user = null
    this.config.jwt = null
    this.config.headers = {}
  }

  async request(
    method: string,
    uri: string,
    input?: any,
    headers?: any,
  ): Promise<AssertResponse> {
    const fullUri = this.config.uri + uri
    const allHeaders = Object.assign({}, this.config.headers, headers)

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const http = this.client[method](fullUri) as ApiClient

    http.send(input || {}).accept('json')

    http.send(input).accept('json')

    Object.keys(allHeaders).forEach(k => {
      http.header(k, this.config.headers[k])
    })

    if (this.config.jwt) {
      http.header('Authorization', `bearer ${this.config.jwt}`)
    } else if (this.config.user) {
      http.loginVia(this.config.user, 'jwt')
    }

    const response = await http.end()

    this.reset()
    return new AssertResponse(response, this.assert)
  }

  loginVia(user: any): Client {
    this.config.user = user

    return this
  }

  loginJwt(jwt: string): Client {
    this.config.jwt = jwt

    return this
  }

  header(key: string, value: any) {
    this.config.headers[key] = value

    return this
  }

  public async get(
    uri: string,
    input?: any,
    headers?: any,
  ): Promise<AssertResponse> {
    return this.request('get', uri, input, headers)
  }

  public async post(
    uri: string,
    input?: any,
    headers?: any,
  ): Promise<AssertResponse> {
    return this.request('post', uri, input, headers)
  }

  public async put(
    uri: string,
    input?: any,
    headers?: any,
  ): Promise<AssertResponse> {
    return this.request('put', uri, input, headers)
  }

  public async delete(
    uri: string,
    input?: any,
    headers?: any,
  ): Promise<AssertResponse> {
    return this.request('delete', uri, input, headers)
  }
}