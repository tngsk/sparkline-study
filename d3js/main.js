// ---------------------------------------------------------------------------
const random_question = (_keyword) => {

    const keyword = _keyword ? _keyword : 'データ'
    
    const q = [
        '{{data}}は増加傾向にあるか？減少傾向にあるか？',
        '{{data}}は直線で増加しているか？',
        '{{data}}は倍増していないだろうか？',
        '{{data}}と比較できる他のデータはあるだろうか？',
        'もっとも大きな数値はどれだろうか？',
        'この数値は、どの数値と比べられるだろうか？',
        'この数値は、1年前や10年前（あるいはもっと昔）と比べるとどうだろうか？',
        'この数値は、似たような国や地域と比べるとどうだろうか？',
        'この数値は、ひとりあたりだとどうなるのか？',
        'この数値は、どの数値で割るべきか？']
    
    let index = []
    for (let i = 0; i < q.length; i++) {
        index[i] = i
    }
    
    let qIndex = []
    for (let i = 0, len = index.length; i < 3; i++, len--) {
        n = Math.floor(Math.random()*len)
        qIndex.push(index[n])
        index[n] = index[len-1]
    }

    output = ''
    for (const i in qIndex) {
        tag = "<div class='d-flex' data-aos='fade-left' data-aos-delay='{{time}}'><div class='d-flex align-items-start mt-1'><svg class='fill-secondary' width='16' height='16' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><title>check</title><path d='M23.146,5.4,20.354,2.6a.5.5,0,0,0-.708,0L7.854,14.4a.5.5,0,0,1-.708,0L4.354,11.6a.5.5,0,0,0-.708,0L.854,14.4a.5.5,0,0,0,0,.707L7.146,21.4a.5.5,0,0,0,.708,0L23.146,6.1A.5.5,0,0,0,23.146,5.4Z'/></svg></div><div class='ml-2'><p class='font-size-5 mb-4'>{{question}}</p></div></div>"

        tag = tag.replace('{{time}}', i * 100)
        tag = tag.replace('{{question}}', q[qIndex[i]].replace('{{data}}', keyword))
        
        output = output + tag
    }

    let element = document.currentScript;
    // element.insertAdjacentHTML('afterend', output);

}
console.log()
// ---------------------------------------------------------------------------

const width = 100;
const height = 25;
const margin = { top: 2, bottom: 2, left: 2, right: 2 }

const x = d3.scaleLinear().range([margin.left, width - margin.right]);
const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

const xAxis = g => g
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 20))
    .call(g => g.select('.domain').remove())

const line = d3.line()
    .curve(d3.curveBasis)
    .x(d => x(d.x))
    .y(d => y(d.y))

const format1f = d3.format('.1f')

const buildeSparkline = (elemId, csvfile) => {
    let dataset = []
    d3.csv(csvfile)
        .then((data) => {
            for (let i = 0; i < data.length; i++) {
                d = {}
                d.x = +data[i].year
                d.y = +data[i].ppm
                dataset.push(d)
            }
            sparkline(elemId, dataset)
        })
        .catch((error) => {
            // error handler
        })
}

const sparkline = (elemId, data, annotation) => {

    const _elemId = elemId

    x.domain(d3.extent(data, d => d.x))
    y.domain(d3.extent(data, d => d.y))

    const init_label = () => {
        graph_icon.html(data[data.length - 1].x)
        graph_value.html(data[data.length - 1].y)
    }
    const update_label = (d) => {
        graph_icon.html(d.x)
        graph_value.html(format1f(d.y))
    }

    let graph_icon = d3.select(elemId)
        .append('span')
        .append('strong')
        .attr('id', elemId + 'icon')
        .html("CO<sup>2</sup>")

    let graph = d3.select(elemId)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(0, 0)')

    graph.append('rect')
        .attr('x', 0)
        .attr('y', y(285))
        .attr('width', width)
        .attr('height', y(285))
        .style('fill', '#ccddcc')

    // svg.append('g')
    //     .call(xAxis)

    graph.append('path')
        .datum(data)
        .attr('class', 'sparkline')
        .attr('d', line)

    graph.append('circle')
        .attr('class', 'sparkcircle')
        .attr('cx', x(data[data.length - 1].x))
        .attr('cy', y(data[data.length - 1].y))
        .attr('r', 1.5);

    graph.append('g')
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .selectAll('rect')
        .data(d3.pairs(data))
        .join('rect')
        .attr('x', ([a, b]) => x(a.x))
        .attr('height', height)
        .attr('width', ([d1, d2]) => x(d2.x) - x(d1.x))
        .on('mouseover', (event, [d]) => { update_label(d) })
        .on('mouseout', () => { init_label() })

    let graph_value = d3.select(elemId)
        .append('span')
        .append('strong')
        .attr('id', elemId + 'value')

    init_label()

    d3.select(elemId)
        .call(d3.drag()
            .on('start', (event) => {
                console.log('start')

            })
            .on('drag', (event) => {
                console.log('drag')
                // let left = Number(_this.style.left.replace('px', ''))
                // let top = Number(_this.style.top.replace('px', ''))
                d3.select(elemId)
                    .style('left', event.x + 'px')
                    .style('top', event.y + 'px')

            })
            .on('end', (event) => {
                console.log('end')
            })
        )

}

buildeSparkline('#graph1', 'lawdome_co2_present.csv')


