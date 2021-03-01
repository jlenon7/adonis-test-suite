import { get } from 'lodash'

export class AssertResponse {
  constructor(public response: any, public assert: any) {}

  get error(): any {
    return JSON.stringify(this.response.error)
  }

  get body(): string {
    return JSON.stringify(this.response.body)
  }

  get result(): any {
    return this.response.body
  }

  get validation(): any[] {
    return this.getData('error.validation', [])
  }

  getData(key: string, defaultValue?: any): any {
    return get(this.result, key, defaultValue)
  }

  dump(): AssertResponse {
    const body = {
      ...this.result,
      error: { ...this.result.error }
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

  assertNoException(from: string): AssertResponse {
    if (this.response.error) {
      console.error('assertNoException', this.response.error)
      throw new Error(`Expected any exception from: ${from}`)
    }

    return this
  }

  assertStatusSuccess(): AssertResponse {
    this.assertNoException('assertStatusSuccess')

    this.assertPropertyVal(
      'success',
      'status',
      'Expected data.status === success',
    )
    return this
  }

  assertStatusError(): AssertResponse {
    this.assertPropertyVal('error', 'status', 'Expected data.status === error')

    return this
  }

  assertStatus(status: number): AssertResponse {
    if (this.response.status !== status) {
      this.dump()
    }

    this.assert.equal(this.response.status, status)
    return this
  }

  assertCount(expectedQuantity: number, key: string): AssertResponse {
    const result = key ? get(this.result, key) : this.result
    this.assert.lengthOf(result, expectedQuantity)
    return this
  }

  assertPropertyExists(key: string): AssertResponse {
    this.assert.nestedProperty(this.result, key)
    return this
  }

  assertPropertyNotExists(key: string): AssertResponse {
    this.assert.notNestedProperty(this.result, key)
    return this
  }

  assertPropertyVal(
    expected: any,
    key: string,
    message?: string,
  ): AssertResponse {
    if (!this.result) {
      console.error(`Empty result in assertPropertyVal->${key}`, this.body)
    }

    this.assert.nestedPropertyVal(this.result, key, expected, message)
    return this
  }

  assertContainsAllKeys(
    expectedKeys: string[],
    key: string,
    message?: string,
  ): AssertResponse {
    if (!this.result) {
      console.error(`Empty result in assertPropertyVal->${key}`, this.body)
    }

    this.assert.containsAllKeys(this.getData(key), expectedKeys, message)
    return this
  }

  assertFailedInput(field: string): AssertResponse {
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

  assertFailedInputValidation(
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

  assertErrorCode(code: string): AssertResponse {
    this.assert.nestedPropertyVal(
      this.response.body,
      'error.code',
      code,
      this.body,
    )

    return this
  }
}
