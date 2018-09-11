
class Gene {
	/**
	 * @param {Number} inNode
	 * @param {Number} outNode
	 * @param {Number} weight
	 * @param {Boolean} enabled
	 * @param {Number} innovationNumber
	 */
	constructor(inNode, outNode, weight, enabled, innovationNumber) {
		if (typeof inNode !== 'number' || typeof outNode !== 'number') {
			console.log() // todo ...
		}
		this.inNode = inNode
		this.outNode = outNode
		this.weight = weight
		this.ennabled = enabled
		this.innovationNumber = innovationNumber
	}

	/**
	 * @return {Gene}
	 */
	copy() {
		return new Gene(this.inNode, this.outNode, this.weight, this.ennabled, this.innovationNumber)
	}

	toString() {
		return `{"source":"${this.inNode}", "target":"${this.outNode}", "caption":"${this.weight.toFixed(5) + (this.ennabled ? '' : ' (disabled)')}"}`
	}
}

module.exports = Gene
