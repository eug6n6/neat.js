
## NEAT

Neuroevolution of augmenting topologies algorithm implemented in JS

## Usage

Sample code creating input and output nodes, initial connections, running NEAT and saving result to HTML file:

```
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
```

## Included examples

Run:
 - `npm run xor` to run NEAT algorithm for XOR dataset
 - `npm run iris` to run NEAT algorithm for Iris dataset

## Results

While algorithm is executed, short information about each epoch is displayed:
```
#10: 7 species, best f=0.87487 with 7 connections
#11: 7 species, best f=0.87493 with 13 connections
#12: 7 species, best f=0.87493 with 13 connections
#13: 7 species, best f=0.87495 with 8 connections
#14: 8 species, best f=0.87495 with 8 connections
#15: 8 species, best f=0.87499 with 10 connections
```

Resulting Neural Network is saved in HTML file that shows its structure including all enabled connections and weights:

