import pack from './utils/pack'

describe('formatter official', () => {
	it('should use official formatter', done => {
		const compiler = pack('error', { formatter: 'table' })

		compiler.run((err, stats) => {
			expect(err).toBeNull()
			expect(stats.hasWarnings()).toBe(false)
			expect(stats.hasErrors()).toBe(true)
			expect(stats.compilation.errors[0].message).toBeTruthy()
			done()
		})
	})
})
