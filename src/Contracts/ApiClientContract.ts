export interface ApiClientContract {
  end(): Promise<any>

  send(data: any): ApiClientContract

  get(uri: string): ApiClientContract

  post(uri: string): ApiClientContract

  accept(type: string): ApiClientContract

  field(key: string, data: any): ApiClientContract

  attach(key: string, path: any): ApiClientContract

  header(key: string, value: any): ApiClientContract

  loginVia(user: any, drive: string): ApiClientContract
}