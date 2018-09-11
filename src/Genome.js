
const utils = require('./_utils')

const Gene = require('./Gene')
const Node = require('./Node')

class Genome {

	constructor() {
		this.PROBABILITY_PERTURBING = 0.9

		/**
		 * @type {Map<Number, Gene>}
		 */
		this.genes = new Map()
		/**
		 * @type {Map<Number, Node>}
		 */
		this.nodes = new Map()
	}

	copy() {
		const genome = new Genome()
		genome.genes = new Map(this.genes)
		genome.nodes = new Map(this.nodes)
		return genome
	}

	/**
	 * @param {Gene} gene
	 */
	addGene(gene) {
		this.genes.set(gene.innovationNumber, gene)
	}

	/**
	 * @param {Node} node
	 */
	addNode(node) {
		this.nodes.set(node.id, node)
	}

	mutation() {
		for (const gene of this.genes.values()) {
			if (Math.random() < this.PROBABILITY_PERTURBING) {
				gene.weight = gene.weight * (-2 + 4 * Math.random())
			} else {
				gene.weight = -2 + 4 * Math.random()
			}
		}
	}

	/**
	 * @param {Counter} counter
	 * @param {Number} maxAttempts
	 */
	addGeneMutation(counter, maxAttempts) {

		/**
		 * @param {Node} node1
		 * @param {Node} node2
		 */
		const isLoopedConnection = (node1, node2) => {
			const allConnections = Array.from(this.genes.values())
			const usedNodes = [node2.id]
			let currentNodes = [node2.id]
			while (true) {
				const cons = allConnections.filter(con => currentNodes.includes(con.inNode))
				if (!cons.length) return false
				const outNodes = cons.map(con => con.outNode)
				if (outNodes.includes(node1.id)) return true
				usedNodes.push(...outNodes)
				currentNodes = outNodes
			}
		}

		let tries = 0
		while (tries < maxAttempts) {
			tries++
			const node1 = Array.from(this.nodes.values())[utils.randomInt(this.nodes.size)]
			const node2 = Array.from(this.nodes.values())[utils.randomInt(this.nodes.size)]
			if (node1.id === node2.id) continue

			let nodes = []
			let genePossible = true
			if (node1.type === 'input' && node1.type === 'input'
				|| node1.type === 'output' && node1.type === 'output') {
				genePossible = false
			} else if (node1.type === 'hidden' && node2.type === 'input'
				|| node1.type === 'output' && node2.type === 'hidden'
				|| node1.type === 'output' && node2.type === 'input') nodes = [node2, node1]
			else {
				if (isLoopedConnection(node1, node2))
					// console.log('possible loop connection')
					nodes = [node2, node1]
				else nodes = [node1, node2]
			}

			const geneExists = Array.from(this.genes.values()).some(c =>
				c.inNode === node1.id && c.outNode === node2.id
				|| c.inNode === node2.id && c.outNode === node1.id
			)
			if (geneExists || !genePossible) continue

			const newGene = new Gene(nodes[0].id, nodes[1].id, Math.random() * 2, true, counter.next())
			this.addGene(newGene)
			return
		}
	}

	/**
	 * @param {Counter} geneCounter
	 * @param {Counter} nodeCounter
	 */
	addNodeMutation(geneCounter, nodeCounter) {
		const gene = Array.from(this.genes.values())[utils.randomInt(this.genes.size)]
		const inNode = gene.inNode
		const outNode = gene.outNode

		gene.ennabled = false

		const newNode = new Node('hidden', nodeCounter.next())
		const inToNew = new Gene(inNode, newNode.id, 1, true, geneCounter.next())
		const newToOut = new Gene(newNode.id, outNode, gene.weight, true, geneCounter.next())

		this.addNode(newNode)
		this.addGene(inToNew)
		this.addGene(newToOut)
	}

	/**
	 * @param {Genome} parent1 more fit
	 * @param {Genome} parent2 less fit
	 * @return {Genome}
	 */
	static crossover(parent1, parent2) {
		const child = new Genome()
		child.nodes = new Map(parent1.nodes)
		for (const gene of parent1.genes.values()) {
			if (parent2.genes.has(gene.innovationNumber)) { // parents have same gene
				const childGene = Math.random() > 0.5
					? gene.copy()
					: parent2.genes.get(gene.innovationNumber).copy()
				child.addGene(childGene)
			} else {
				const childGene = gene.copy()
				child.addGene(childGene)
			}
		}
		return child
	}

	/**
	 * @param {Genome} genome1
	 * @param {Genome} genome2
	 * @param {Number} c1
	 * @param {Number} c2
	 * @param {Number} c3
	 * @return {number}
	 */
	static compatibilityDistance(genome1, genome2, c1, c2, c3) {
		const excessGenes = Genome.countExcessGenes(genome1, genome2)
		const disjointGenes = Genome.countDisjointGenes(genome1, genome2)
		const avgWeightDiff = Genome.averageWeightDiff(genome1, genome2)

		return excessGenes * c1 + disjointGenes * c2 + avgWeightDiff * c3
	}

	/**
	 * @param {Genome} genome1
	 * @param {Genome} genome2
	 */
	static averageWeightDiff(genome1, genome2) {
		const matchingGenes = Array.from(genome1.genes.keys()).filter(k => genome2.genes.has(k))
		let weightDifference = 0
		for (const geneId of matchingGenes)
			weightDifference += Math.abs(genome1.genes.get(geneId).weight - genome2.genes.get(geneId).weight)
		return weightDifference / matchingGenes.length
	}

	/**
	 * @param {Genome} genome1
	 * @param {Genome} genome2
	 * @return {Number}
	 */
	static countMatchingGenes(genome1, genome2) {
		return Array.from(genome1.nodes.keys()).filter(k => genome2.nodes.has(k)).length
			+ Array.from(genome1.genes.keys()).filter(k => genome2.nodes.has(k)).length
	}

	/**
	 * @param {Genome} genome1
	 * @param {Genome} genome2
	 * @return {Number}
	 */
	static countDisjointGenes(genome1, genome2) {
		let disjointGenes = 0

		let highestInnovation1 = Math.max(...Array.from(genome1.nodes.keys()))
		let highestInnovation2 = Math.max(...Array.from(genome2.nodes.keys()))
		for (let i = 0; i <= Math.max(highestInnovation1, highestInnovation2); i++) {
			if (genome1.nodes.has(i) && !genome2.nodes.has(i) && i < highestInnovation2
				|| !genome1.nodes.has(i) && genome2.nodes.has(i) && i < highestInnovation1)
				disjointGenes++
		}

		highestInnovation1 = Math.max(...Array.from(genome1.genes.keys()))
		highestInnovation2 = Math.max(...Array.from(genome2.genes.keys()))
		for (let i = 0; i <= Math.max(highestInnovation1, highestInnovation2); i++) {
			if (genome1.genes.has(i) && !genome2.genes.has(i) && i < highestInnovation2
				|| !genome1.genes.has(i) && genome2.genes.has(i) && i < highestInnovation1)
				disjointGenes++
		}

		return disjointGenes
	}

	/**
	 * @param {Genome} genome1
	 * @param {Genome} genome2
	 * @return {Number}
	 */
	static countExcessGenes(genome1, genome2) {
		let excessGenes = 0

		let highestInnovation1 = Math.max(...Array.from(genome1.nodes.keys()))
		let highestInnovation2 = Math.max(...Array.from(genome2.nodes.keys()))
		for (let i = 0; i <= Math.max(highestInnovation1, highestInnovation2); i++) {
			if (genome1.nodes.has(i) && !genome2.nodes.has(i) && i > highestInnovation2
				|| !genome1.nodes.has(i) && genome2.nodes.has(i) && i > highestInnovation1)
				excessGenes++
		}

		highestInnovation1 = Math.max(...Array.from(genome1.genes.keys()))
		highestInnovation2 = Math.max(...Array.from(genome2.genes.keys()))
		for (let i = 0; i <= Math.max(highestInnovation1, highestInnovation2); i++) {
			if (genome1.genes.has(i) && !genome2.genes.has(i) && i > highestInnovation2
				|| !genome1.genes.has(i) && genome2.genes.has(i) && i > highestInnovation1)
				excessGenes++
		}

		return excessGenes
	}

}


module.exports = Genome