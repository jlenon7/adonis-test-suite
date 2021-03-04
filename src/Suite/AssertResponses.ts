import { get } from 'lodash'

export class AssertResponse {
  // eslint-disable-next-line no-useless-constructor
  constructor(public response: any, public assert: any) {}

  public dump(): AssertResponse {
    const body = {
      ...this.result,
      error: { ...this.result.error },
    }

    if (body.error && body.error.stack) {
      body.error.stack = '/*...*/'
    }

    console.log('===DUMP===')
    console.log('HTTP_STATUS', this.response.status)
    console.log('BODY', JSON.stringify(body))

    if (this.result && this.result) {
      console.log('ERROR', this.result.error)
    } else if (this.error) {
      console.log('ERROR', this.error)
    }

    console.log('===\\ DUMP===')
    return this
  }

  public assertNoException(from: string): AssertResponse {
    if (this.response.error) {
      console.error('assertNoException', this.response.error)
      throw new Error(`Expected not exception from: ${from}`)
    }

    return this
  }

  public assertStatusSuccess(): AssertResponse {
    this.assertNoException('assertStatusSuccess')

    this.assertPropertyVal(
      'success',
      'status',
      'Expected data.status === success',
    )
    return this
  }

  public assertStatusError(): AssertResponse {
    this.assertPropertyVal('error', 'status', 'Expected data.status === error')

    return this
  }

  public assertStatus(status: number): AssertResponse {
    if (this.response.status !== status) {
      this.dump()
    }

    this.assert.equal(this.response.status, status)
    return this
  }

  public assertCount(expectedQuantity: number, key: string): AssertResponse {
    const result = key ? get(this.result, key) : this.result
    this.assert.lengthOf(result, expectedQuantity)
    return this
  }

  public assertPropertyExists(key: string): AssertResponse {
    this.assert.nestedProperty(this.result, key)
    return this
  }

  public assertPropertyNotExists(key: string): AssertResponse {
    this.assert.notNestedProperty(this.result, key)
    return this
  }

  public assertPropertyVal(
    expected: any,
    key: string,
    message?: string,
  ): AssertResponse {
    if (!this.result) {
      console.error(`empty result in assertPropertyVal->${key}`, this.body)
    }

    this.assert.nestedPropertyVal(this.result, key, expected, message)
    return this
  }

  public assertContainsAllKeys(
    expectedKeys: string[],
    key: string,
    message?: string,
  ): AssertResponse {
    if (!this.result) {
      console.error(`empty result in assertPropertyVal->${key}`, this.body)
    }

    this.assert.containsAllKeys(this.getData(key), expectedKeys, message)
    return this
  }

  public get validation(): any[] {
    return this.getData('error.validation', [])
  }

  public get result(): any {
    return this.response.body
  }

  public get error(): string {
    return JSON.stringify(this.response.error)
  }

  public get body(): string {
    return JSON.stringify(this.response.body)
  }

  public getData(key: string, defaultValue?: any): any {
    return get(this.result, key, defaultValue)
  }

  public assertFailedInput(field: string): AssertResponse {
    const result = this.validation.find(f => f.field === field)

    if (!result) {
      console.log({
        dump: 'expectedFailedInput',
        field,
        validations: this.validation,
      })
    }

    this.assert.exists(result, `Expect error on field: ${field}`)
    return this
  }

  public assertFailedInputValidation(
    field: string,
    rule: string,
  ): AssertResponse {
    const result = this.validation.find(
      f => f.field === field && f.validation === rule,
    )

    if (!result) {
      console.log({
        dump: 'expectedFailedInputValidation',
        field,
        rule,
        validations: this.validation,
      })
    }

    this.assert.exists(
      result,
      `Expect error on field: ${field} with rule: ${rule}`,
    )
    return this
  }

  public assertErrorCode(code: string): AssertResponse {
    this.assert.nestedPropertyVal(
      this.response.body,
      'error.code',
      code,
      this.body,
    )

    return this
  }
}