import { join } from 'path'

import { readFileSync, removeSync } from 'fs-extra'
import { CLIEngine } from 'eslint'
import webpack from 'webpack'

import conf from './utils/conf'

describe('formatter write', () => {
	it('should write results to relative file with a custom formatter', done => {
		const formatter = CLIEngine.getFormatter('checkstyle')
		const outputFilename = 'outputReport-relative.txt'
		const config = conf('error', {
			formatter,
			outputReport: {
				formatter,
				filePath: outputFilename
			}
		})

		const outputFilepath = join(config.output.path, outputFilename)
		removeSync(outputFilepath)

		const compiler = webpack(config)
		compiler.run((err, stats) => {
			const contents = readFileSync(outputFilepath, 'utf8')

			expect(err).toBeNull()
			expect(stats.hasWarnings()).toBe(false)
			expect(stats.hasErrors()).toBe(true)
			expect(stats.compilation.errors[0].message).toBe(contents)
			done()
		})
	})

	it('should write results to absolute file with a same formatter', done => {
		const outputFilename = 'outputReport-absolute.txt'
		const outputFilepath = join(__dirname, 'output', outputFilename)
		const config = conf('error', {
			outputReport: {
				filePath: outputFilepath
			}
		})

		removeSync(outputFilepath)

		const compiler = webpack(config)
		compiler.run((err, stats) => {
			const contents = readFileSync(outputFilepath, 'utf8')

			expect(err).toBeNull()
			expect(stats.hasWarnings()).toBe(false)
			expect(stats.hasErrors()).toBe(true)
			expect(stats.compilation.errors[0].message).toBe(contents)
			done()
		})
	})
})
