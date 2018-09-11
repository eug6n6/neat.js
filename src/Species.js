
const utils = require('./_utils')

class Species {

	/**
	 * @param {Genome} mascot
	 */
	constructor(mascot) {
		this.mascot = mascot
		/**
		 * @type {Array<Genome>}
		 */
		this.genomes = [mascot]
		/**
		 * @type {Array<{genome: Genome, fitness: Number}>}
		 */
		this.genomesFitness = []
		this.totalAdjustedFitness = 0
	}

	reset() {
		this.mascot = this.genomes[utils.randomInt(this.genomes.length)]
		this.genomes = []
		this.genomesFitness = []
		this.totalAdjustedFitness = 0
	}


}

module.exports = Species