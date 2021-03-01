'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class SuiteProvider extends ServiceProvider {
  /**
   * Register namespaces to the IoC container
   *
   * @method register
   *
   * @return {void}
   */
  register() {
    this.registerDBAssert()
    this.registerClient()
  }

  registerDBAssert() {
    this.app.bind('Suite/Database', () => {
      const {
        TestDBSql,
      } = require('@jlenon7/adonis-test-suite/build/Suite/TestDBSql')

      function connect() {
        return new TestDBSql(this.assert).connect()
      }

      return ({ Context }) => {
        Context.getter('dbAssert', connect, true)
      }
    })
  }

  registerClient() {
    this.app.bind('Suite/Client', () => {
      const ApiClient = require('@adonisjs/vow/src/ApiClient')
      const { Client } = require('@jlenon7/adonis-test-suite/build/Suite/Client')

      return ({ Context, Request, Response }) => {
        function make() {
          const api = new ApiClient(Request, Response, this.assert)
          return new Client(api, this.assert)
        }

        Context.getter('suiteClient', make, true)
      }
    })
  }

  /**
   * Attach context getter when all providers have
   * been registered
   *
   * @method boot
   *
   * @return {void}
   */
  boot() {}
}

module.exports = SuiteProvider