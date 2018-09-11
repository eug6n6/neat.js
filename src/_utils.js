
exports.randomInt = max => Math.floor(Math.random() * max)

class Counter {
	constructor() {
		this.i = 0
	}
	next() {
		return this.i++
	}
}

exports.Counter = Counter

/**
 * @param {Genome} genome
 * @param {Boolean} printDisabled
 */
exports.toHTML = (genome, printDisabled = false) => {
	const genes = genesMap => {
		let arr = Array.from(genesMap.values())
		if (!printDisabled) arr = arr.filter(gene => gene.ennabled)
		return arr.map(gene => gene.toString())
	}
	return `
<html>
<head>
<link rel="stylesheet" type="text/css" href="graph/alchemy.min.css">
</head>
<body>
 <div id="alchemy" class="alchemy"></div>
<script type="text/javascript" src="graph/scripts/vendor.js"></script>
<script type="text/javascript" src="graph/alchemy.min.js"></script>

<script type="text/javascript">
	
 const some_data = {
	"nodes": [${ Array.from(genome.nodes.values()).map(node => node.toString())}],
	"edges": [${genes(genome.genes)}]
  };

alchemy.begin({
	"dataSource": some_data,
	"nodeTypes": {"type": ["input", "output", "hidden"]},
 	"nodeStyle": {
        "input": {
            color: "green",
        },
        "hidden":{
            color: "blue",
        },
        "output": {
            color: "red"
        }
    },
})
</script>
</body>
</html>
`
}