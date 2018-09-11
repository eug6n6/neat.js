
const Evaluator = require('./src/Evaluator')
const Genome = require('./src/Genome')
const Gene = require('./src/Gene')
const Node = require('./src/Node')
const utils = require('./src/_utils')
const fs = require('fs')

const NUMBER_OF_EPOCHS = 50

const xor = () => {
	const nodeCounter = new utils.Counter()
	const geneCounter = new utils.Counter()

	const genome = new Genome()

	const input1 = new Node('input', nodeCounter.next())
	const input2 = new Node('input', nodeCounter.next())
	const output = new Node('output', nodeCounter.next())

	const gene1 = new Gene(input1.id, output.id, 0.5, true, geneCounter.next())
	const gene2 = new Gene(input2.id, output.id, 0.5, true, geneCounter.next())

	genome.addNode(input1)
	genome.addNode(input2)
	genome.addNode(output)
	genome.addGene(gene1)
	genome.addGene(gene2)

	const set = [
		[0, 0, 1],
		[0, 1, 0],
		[1, 0, 0],
		[1, 1, 1]
	]
	const data = set.map(raw => {
		/**
		 * @type {DataItem}
		 */
		const item = {
			inputs: new Map(),
			outputs: new Map()
		}
		item.inputs.set(input1.id, raw[0])
		item.inputs.set(input2.id, raw[1])
		item.outputs.set(output.id, raw[2])

		return item
	})

	const eval = new Evaluator(100, genome, geneCounter, nodeCounter)

	let theFittestGenome
	for (let i = 0; i < NUMBER_OF_EPOCHS; i++) {
		eval.evaluate(data)
		theFittestGenome = eval.fittestGenome
		console.log(`#${i}: ${eval.species.length} species, best f=${eval.highestScore.toFixed(5)} with ${eval.fittestGenome.genes.size} connections`)
	}

	fs.writeFile('result/result.html', utils.toHTML(theFittestGenome), err => err && console.error(err))

}

const iris = () => {
	fs.readFile('data/iris.txt', 'utf8', (err, str) => {

		const nodeCounter = new utils.Counter()
		const geneCounter = new utils.Counter()

		const genome = new Genome()

		const input1 = new Node('input', nodeCounter.next())
		const input2 = new Node('input', nodeCounter.next())
		const input3 = new Node('input', nodeCounter.next())
		const input4 = new Node('input', nodeCounter.next())
		const output1 = new Node('output', nodeCounter.next())
		const output2 = new Node('output', nodeCounter.next())
		const output3 = new Node('output', nodeCounter.next())

		const gene11 = new Gene(input1.id, output1.id, 0.5, true, geneCounter.next())
		const gene12 = new Gene(input2.id, output1.id, 0.5, true, geneCounter.next())
		const gene13 = new Gene(input3.id, output1.id, 0.5, true, geneCounter.next())
		const gene14 = new Gene(input4.id, output1.id, 0.5, true, geneCounter.next())
		const gene21 = new Gene(input1.id, output2.id, 0.5, true, geneCounter.next())
		const gene22 = new Gene(input2.id, output2.id, 0.5, true, geneCounter.next())
		const gene23 = new Gene(input3.id, output2.id, 0.5, true, geneCounter.next())
		const gene24 = new Gene(input4.id, output2.id, 0.5, true, geneCounter.next())
		const gene31 = new Gene(input1.id, output3.id, 0.5, true, geneCounter.next())
		const gene32 = new Gene(input2.id, output3.id, 0.5, true, geneCounter.next())
		const gene33 = new Gene(input3.id, output3.id, 0.5, true, geneCounter.next())
		const gene34 = new Gene(input4.id, output3.id, 0.5, true, geneCounter.next())


		genome.addNode(input1)
		genome.addNode(input2)
		genome.addNode(input3)
		genome.addNode(input4)
		genome.addNode(output1)
		genome.addNode(output2)
		genome.addNode(output3)
		genome.addGene(gene11)
		genome.addGene(gene12)
		genome.addGene(gene13)
		genome.addGene(gene14)
		genome.addGene(gene21)
		genome.addGene(gene22)
		genome.addGene(gene23)
		genome.addGene(gene24)
		genome.addGene(gene31)
		genome.addGene(gene32)
		genome.addGene(gene33)
		genome.addGene(gene34)

		if (err) throw err
		const set = str.split('\n').map(str => str.split(',').map(val => parseFloat(val)))
		const data = set.map(raw => {
			/**
			 * @type {DataItem}
			 */
			const item = {
				inputs: new Map(),
				outputs: new Map()
			}
			item.inputs.set(input1.id, raw[0])
			item.inputs.set(input2.id, raw[1])
			item.inputs.set(input3.id, raw[2])
			item.inputs.set(input4.id, raw[3])
			if (raw[4] === 1) {
				item.outputs.set(output1.id, 1)
				item.outputs.set(output1.id, 0)
				item.outputs.set(output1.id, 0)
			} else if (raw[4] === 2) {
				item.outputs.set(output1.id, 0)
				item.outputs.set(output1.id, 1)
				item.outputs.set(output1.id, 0)
			} else {
				item.outputs.set(output1.id, 0)
				item.outputs.set(output1.id, 0)
				item.outputs.set(output1.id, 1)
			}

			return item
		})

		const eval = new Evaluator(100, genome, geneCounter, nodeCounter)

		let theFittestGenome
		for (let i = 0; i < NUMBER_OF_EPOCHS; i++) {
			eval.evaluate(data)
			theFittestGenome = eval.fittestGenome
			console.log(`#${i}: ${eval.species.length} species, best f=${eval.highestScore.toFixed(5)} with ${eval.fittestGenome.genes.size} connections`)
		}

		fs.writeFile('result/result.html', utils.toHTML(theFittestGenome), err => err && console.error(err))

	})

}

if (process.argv.includes('--xor'))
	xor()
else if (process.argv.includes('--iris'))
	iris()
