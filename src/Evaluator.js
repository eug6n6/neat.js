
const Genome = require('./Genome')
const Species = require('./Species')

const utils = require('./_utils')

class Evaluator {

	/**
	 * @param {Number} populationSize
	 * @param {Genome} startingGenome
	 * @param {Counter} geneCounter
	 * @param {Counter} nodeCounter
	 */
	constructor(populationSize, startingGenome, geneCounter, nodeCounter) {
		this.populationSize = populationSize

		this.geneCounter = geneCounter
		this.nodeCounter = nodeCounter

		this.MUTATION_RATE = 0.5
		this.ADD_GENE_RATE = 0.1
		this.ADD_NODE_RATE = 0.1
		this.C1 = 1
		this.C2 = 1
		this.C3 = 0.4
		this.DT = 10

		/**
		 * @type {Array<Genome>}
		 */
		this.genomes = []
		for (let i = 0; i < populationSize; i++)
			this.genomes.push(startingGenome.copy())

		/**
		 * @type {Array<Species>}
		 */
		this.species = []
		/**
		 * @type {Array<Genome>}
		 */
		// this.nextGenerationGenomes = []


	}

	/**
	 * @typedef {Object} DataItem
	 * @property {Map<Number, Number>} inputs
	 * @property {Map<Number, Number>} outputs
	 */

	/**
	 * @param {DataItem[]} data
	 */
	evaluate(data) {
		this.highestScore = -999999
		/**
		 * @type {Genome}
		 */
		this.fittestGenome = null
		const nextGenerationGenomes = []
		for (const species of this.species) species.reset()

		for (const genome of this.genomes) {
			const species = this.species.find(species =>
				Genome.compatibilityDistance(genome, species.mascot, this.C1, this.C2, this.C3) < this.DT
			)
			if (species) {
				species.genomes.push(genome)
			} else {
				const newSpecies = new Species(genome)
				this.species.push(newSpecies)
			}
		}

		this.species = this.species.filter(species => species.genomes.length)

		/**
		 * @type {Map<Genome, Number>}
		 */
		const genomesScores = new Map()
		for (const genome of this.genomes) {
			const species = this.species.find(species => species.genomes.includes(genome))
			const score = Evaluator.evaluateGenome(genome, data)
			const adjustedScore = score / species.genomes.length
			species.totalAdjustedFitness += adjustedScore
			species.genomesFitness.push({genome, fitness: adjustedScore})
			genomesScores.set(genome, adjustedScore)
			if (score > this.highestScore) {
				this.highestScore = score
				this.fittestGenome = genome
			}
		}

		for (const species of this.species) {
			const fittest = species.genomesFitness.sort((a, b) => {
				if (a.fitness > b.fitness) return -1
				else if (a.fitness < b.fitness) return 1
				else return 0
			})[0]
			nextGenerationGenomes.push(fittest.genome)
		}

		while (nextGenerationGenomes.length < this.populationSize) {
			const species = this.getRandomSpeciesBiasedAdjustedFitness()
			const parent1 = Evaluator.getRandomGenomeBiasedAdjustedFitness(species)
			const parent2 = Evaluator.getRandomGenomeBiasedAdjustedFitness(species)
			if (!parent1 || !parent2) continue
			const parents = genomesScores.get(parent1) > genomesScores.get(parent2)
				? [parent1, parent2] : [parent2, parent1]
			const child = Genome.crossover(...parents)

			if (Math.random() < this.MUTATION_RATE) child.mutation()
			if (Math.random() < this.ADD_GENE_RATE) child.addGeneMutation(this.geneCounter, 10)
			if (Math.random() < this.ADD_NODE_RATE) child.addNodeMutation(this.geneCounter, this.nodeCounter)

			nextGenerationGenomes.push(child)
		}

		this.genomes = nextGenerationGenomes
	}

	/**
	 * @return {Species}
	 */
	getRandomSpeciesBiasedAdjustedFitness() {
		let completeWeight = 0.0
		for (const species of this.species) {
			completeWeight += species.totalAdjustedFitness
		}
		const r = Math.random() * completeWeight
		let countWeight = 0.0
		for (const species of this.species) {
			countWeight += species.totalAdjustedFitness
			if (countWeight >= r) return species
		}
		return this.species[0]
	}

	/**
	 * @param {Species} species
	 * @return {Genome}
	 */
	static getRandomGenomeBiasedAdjustedFitness(species) {
		let completeWeight = 0
		for (const val of species.genomesFitness) {
			completeWeight += val.fitness
		}
		const r = Math.random() * completeWeight
		let countWeight = 0
		for (const val of species.genomesFitness) {
			countWeight += val.fitness;
			if (countWeight >= r) return val.genome
		}
	}

	/**
	 * @param {Genome} genome
	 * @param {DataItem[]} data
	 * @return {Number}
	 */
	static evaluateGenome(genome, data) {
		let errorSum = 0
		for (const {inputs, outputs} of data) {
			/**
			 * @type {Map<Number, Node>}
			 */
			const computedNodes = new Map()
			/**
			 * @type {Map<Number, Node>}
			 */
			const emptyNodes = new Map()

			for (const nodeId of genome.nodes.keys()) {
				const node  = genome.nodes.get(nodeId)
				if (node.type === 'input') {
					if (!inputs.has(nodeId)) throw 'Invalid inputs'
					node.value = inputs.get(nodeId)
					computedNodes.set(nodeId, node)
				} else {
					node.value = null
					emptyNodes.set(nodeId, node)
				}
			}

			while (emptyNodes.size) {
				/**
				 * @type {Node}
				 */
				let nodeToCompute
				/**
				 * @type {Gene[]}
				 */
				let genesToCompute
				for (const node of emptyNodes.values()) {
					const genes = Array.from(genome.genes.values()).filter(gene =>
						gene.ennabled && gene.outNode === node.id
					)
					if (genes.every(gene =>
						computedNodes.has(gene.inNode))
					) {
						nodeToCompute = node
						genesToCompute = genes
						break
					}
				}
				if (!nodeToCompute) throw 'That`s not good...'

				let value = 0
				for (const gene of genesToCompute) {
					// if (!computedNodes.get(gene.inNode).value)
					// 	console.log(computedNodes.get(gene.inNode))
					value += gene.weight * Evaluator.activate(computedNodes.get(gene.inNode).value)
				}
				nodeToCompute.value = value
				// console.log(nodeToCompute)
				emptyNodes.delete(nodeToCompute.id)
				computedNodes.set(nodeToCompute.id, nodeToCompute)
			}
			// console.log(computedNodes.get(Array.from(outputs.keys())[0]).value)

			let error = 0
			for (const outputNodeId of outputs.keys())
				error += Math.pow(outputs.get(outputNodeId) - computedNodes.get(outputNodeId).value, 2)
			error /= 2 * outputs.size

			errorSum += error
		}
		// console.log(- errorSum / data.length)
		// console.log(1 / ( errorSum / data.length ))
		return 1 - ( errorSum / data.length )
	}

	/**
	 * @param genome
	 * @param inputs
	 * @return {Node[]}
	 */
	static getGenomeOutput(genome, inputs) {
		/**
		 * @type {Map<Number, Node>}
		 */
		const computedNodes = new Map()
		/**
		 * @type {Map<Number, Node>}
		 */
		const emptyNodes = new Map()

		for (const nodeId of genome.nodes.keys()) {
			const node  = genome.nodes.get(nodeId)
			if (node.type === 'input') {
				if (!inputs.has(nodeId)) throw 'Invalid inputs'
				node.value = inputs.get(nodeId)
				computedNodes.set(nodeId, node)
			} else {
				node.value = null
				emptyNodes.set(nodeId, node)
			}
		}

		while (emptyNodes.size) {
			/**
			 * @type {Node}
			 */
			let nodeToCompute
			/**
			 * @type {Gene[]}
			 */
			let genesToCompute
			for (const node of emptyNodes.values()) {
				const genes = Array.from(genome.genes.values()).filter(gene =>
					gene.ennabled && gene.outNode === node.id
				)
				if (genes.every(gene =>
					computedNodes.has(gene.inNode))
				) {
					nodeToCompute = node
					genesToCompute = genes
					break
				}
			}
			if (!nodeToCompute) throw 'That`s not good...'

			let value = 0
			for (const gene of genesToCompute) {
				value += gene.weight * Evaluator.activate(computedNodes.get(gene.inNode).value)
			}
			nodeToCompute.value = value

			emptyNodes.delete(nodeToCompute.id)
			computedNodes.set(nodeToCompute.id, nodeToCompute)
		}
		return Array.from(computedNodes.values()).filter(node => node.type === 'output')
	}

	static activate(value) {
		return 1 / (1 + Math.exp(-value))
	}

}

module.exports = Evaluator
