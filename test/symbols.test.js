import { join } from 'path'

import pack from './utils/pack'

describe('symbols', () => {
	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('should return error', done => {
		const compiler = pack(
			'symbols',
			{},
			{ context: join(__dirname, 'fixtures/[symbols]') }
		)

		compiler.run((err, stats) => {
			expect(err).toBeNull()
			expect(stats.hasWarnings()).toBe(false)
			expect(stats.hasErrors()).toBe(true)
			done()
		})
	})
})
