class Node {

	/**
	 * @param {'input'|'hidden'|'output'} type
	 * @param {Number} id
	 */
	constructor(type, id) {
		this.type = type
		this.id = id
		/**
		 * @type {Number}
		 */
		this.value = null
	}

	/**
	 * @return {Node}
	 */
	copy() {
		return new Node(this.type, this.id)
	}

	toString() {
		return `{"id":${this.id}, "type":"${this.type}"}`
	}
}

module.exports = Node