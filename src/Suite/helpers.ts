export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export async function deleteTables(table: string | string[]): Promise<any[]> {
  const tables = typeof table === 'string' ? [table] : table

  const Database = use('Database')

  const promises = tables.map(table => Database.table(table).delete())

  return Promise.all(promises)
}