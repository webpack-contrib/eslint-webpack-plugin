import pack from './utils/pack'

describe('query', () => {
	it('should correctly resolve file despite query path', done => {
		const compiler = pack(
			'query',
			{},
			{
				resolve: {
					alias: {
						'alias-ignore': false
					}
				}
			}
		)

		compiler.run((err, stats) => {
			expect(err).toBeNull()
			expect(stats.hasWarnings()).toBe(false)
			expect(stats.hasErrors()).toBe(false)

			done()
		})
	})
})
