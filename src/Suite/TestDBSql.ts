import { AssertStatic } from 'japa/build/src/Assert'

type Data = { [key: string]: any }

export class TestDBSql {
  public db: any

  constructor(private assert: AssertStatic) {}

  public connect(): this {
    this.db = use('Database')

    return this
  }

  /**
   * Assert that a table in the database contains the given data.
   *
   * @param table
   * @param data
   * @param debug
   * @return Promise<boolean>
   */
  public async assertDatabaseHas(
    table: string,
    data: Data,
    debug = false,
  ): Promise<any> {
    const rows = await this.db.table(table).where(data).select('*')

    if (!rows.length || debug) {
      const exists = await this.db.table(table).select('*')

      console.info('DEBUG->assertDatabaseHas', {
        table,
        data,
        exists: this.transformData(exists),
      })
    }

    this.assert.isNotEmpty(
      rows,
      `Assert database Has ${table} Found -> ${JSON.stringify(data)}`,
    )

    return rows
  }

  private transformData(rows: any[]): any {
    const data: any[] = []

    rows.map(row => {
      const tmp: any = {}

      Object.keys(row).forEach(k => {
        if (typeof row[k] === 'object') {
          tmp[k] = JSON.stringify(row[k])
        } else {
          tmp[k] = row[k]
        }
      })

      data.push(tmp)
    })

    return data
  }

  /**
   * Assert that a table in the database does not contain the given data.
   *
   * @param table
   * @param data
   * @param debug
   * @return Promise<boolean>
   */
  public async assertDatabaseMissing(
    table: string,
    data: Data,
    debug = false,
  ): Promise<any> {
    const rows = await this.db.table(table).where(data).select('*')

    if (rows.length || debug) {
      console.info('DEBUG->assertDatabaseMissing', {
        table,
        data,
        rows: this.transformData(rows),
      })
    }

    this.assert.isEmpty(
      rows,
      `Assert database Missing ${table} Found -> ${JSON.stringify(data)}`,
    )
    return rows
  }

  /**
   * Assert that a table in the database does not contain the given data.
   *
   * @param table
   * @param data
   * @param expected
   * @param debug
   * @return Promise<boolean>
   */
  public async assertDatabaseCount(
    table: string,
    data: Data,
    expected: number,
    debug = false,
  ): Promise<any> {
    const rows = await this.db.table(table).where(data).select('*')

    if (debug) {
      console.info('assertDatabaseCount=>', table, data, expected, rows)
    }

    this.assert.lengthOf(
      rows,
      expected,
      `Assert database count ${table} expected ${expected} rows`,
    )
    return rows
  }

  /**
   * Assert that the given record has been soft deleted.
   *
   * @param table
   * @param data
   * @param debug
   * @return Promise<boolean>
   */
  public async assertDatabaseSoftDeleted(
    table: string,
    data?: Data,
    debug = false,
  ): Promise<any> {
    data = data || {}

    const rows = await this.db
      .table(table)
      .where(data)
      .whereNotNull('deleted_at')
      .select('*')

    if (debug) {
      console.info('assertDatabaseSoftDeleted=>', table, data, rows)
    }

    if (!rows.length) {
      const rowsDebug = await this.db.table(table).select('*')

      console.info('DEBUG->assertDatabaseSoftDeleted', {
        table,
        data,
        rows: this.transformData(rowsDebug),
      })
    }

    this.assert.isNotEmpty(rows, `Assert assert SoftDeleted ${table}`)
    return rows
  }
}