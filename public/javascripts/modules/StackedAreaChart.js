import { Chart } from './Chart.js'

class StackedAreaChart extends Chart {
  constructor (obj) {
    super(obj)

    this.drawChart()
  }

  drawChart () {
    const c = this

    super.init()
    super.addAxis()
    super.getKeys()
    // // c.processData();
    c.stackData()
    super.drawTooltip()
    c.createScales()
    super.drawGridLines()
    c.drawArea()
    c.drawLegend()
    super.drawFocusLine()
  }

  updateChart (obj) {
    const c = this

    if (obj) {
      c.d = obj.d || c.d
      c.k = obj.k || c.k
      c.ks = obj.ks || c.ks
      c.tX = obj.tX || c.tX
      c.tY = obj.tY || c.tY
      c.xV = obj.xV || c.xV
      c.yV = obj.yV || c.yV
      c.cS = obj.c || c.cS
      c.ySF = obj.ySF || c.ySF
    }

    c.stackData()
    c.createScales()
    c.drawArea()
    c.drawLegend()
  }

  stackData () {
    const c = this
    const data = c.d
    // keys,
    // groupData,
    const stack = d3.stack()

    // keys = c.ks;

    // d3 stack function
    c.stack = stack.keys(c.ks)
    c.dStacked = (c.stack(c.d))

    // groupData = d3.nest()
    //     .key(d => { return d[c.xV] })
    //     .rollup((d, i) => {
    //         const d2 = {
    //             [c.xV]: d[0][c.xV]
    //         };
    //         d.forEach(d => {
    //             d2[d.type] = d[c.yV];
    //         });
    //     return d2;
    //     })
    //     .entries(data)
    //     .map(d => { return d[c.yV]; });

    // c.stackD = stack.keys(keys)(groupData);
    // c.keys = keys.reverse();
    // c.gData = groupData;
  }

  createScales () {
    const c = this
    let yAxisCall
    let xAxisCall
    let x
    let y

    yAxisCall = d3.axisLeft()
    xAxisCall = d3.axisBottom()
    x = c.getElement('.titleX').text(c.tX)
    y = c.getElement('.titleY').text(c.tY)

    // set scales
    c.x = d3.scaleTime().range([0, c.w])
    c.y = d3.scaleLinear().range([c.h, 0])

    // get the the combined max value for the y scale
    const maxVal = d3.max(c.d, d => {
      const vals = d3.keys(d).map(key => {
        return key === c.xV || typeof d[key] === 'string' ? 0 : d[key]
        // return key !== c.xV ? d[key] : 0;
      })
      // console.log('Vals: ' + vals)
      return d3.sum(vals)
    })

    // Update scales
    c.x.domain(d3.extent(c.d, (d) => {
      return (d[c.xV])
    }))

    c.y.domain([0, maxVal])//* 1.2])

    // Update X axis
    c.tickNumber ? xAxisCall.scale(c.x).ticks(c.tickNumber) : xAxisCall.scale(c.x)
    c.xAxis.transition(c.t()).call(xAxisCall)

    // Update Y axis
    c.ySF ? yAxisCall.scale(c.y).tickFormat(c.formatValue(c.ySF)) : yAxisCall.scale(c.y)
    c.yAxis.transition(c.t()).call(yAxisCall)
  }

  drawArea () {
    const c = this

    c.arealine = d3.line()
      .defined(function (d) {
        return !isNaN(d[1])
      })
      // .curve(c.area.curve())
      .x(d => {
        return c.x(d.data[c.xV])
      })
      .y(d => {
        return c.y(d[1])
      })

    // d3 area function
    c.area = d3.area()
      .defined(function (d) {
        return !isNaN(d[1])
      })
      .x(function (d) {
        return c.x(d.data[c.xV])
      })
      .y0(function (d) {
        return c.y(d[0])
      })
      .y1(function (d) {
        return c.y(d[1])
      })

    d3.select(c.e).select('.focus').remove()
    d3.select(c.e).select('.focus_overlay').remove()
    c.g.selectAll('.region')
      .transition(c.t())
      .style('opacity', 0)
      .remove() // cheap fix for now

    // select all regions and join data with old
    c.regions = c.g.selectAll('.area')
      .data(c.dStacked, d => {
        return d
      })
      .enter()
      .append('g')
      .attr('class', 'region')

    // remove old data not working
    // c.regions
    //     .exit()
    //     .transition(c.t())
    //     .style("opacity", 0)
    //     .remove();

    c.regions
      .append('path')
      .attr('class', 'area')
      .attr('d', c.area)
      .style('fill-opacity', 0.75)
      .style('fill', (d) => {
        // console.log("\n\nc.colour(d.key) " + d.key);
        return c.colour(d.key)
      })

    c.regions
      .append('path')
      .attr('class', 'area-line')
      .attr('d', c.arealine)
      .style('stroke', (d) => {
        return c.colour(d.key)
      })

    // Update
    c.g.selectAll('.area')
      .data(c.dStacked)
      .transition(c.t())
      .attr('d', c.area)
      .style('fill-opacity', 0.55)
      .style('fill', (d) => {
        return c.colour(d.key)
      })

    c.g.selectAll('.area-line')
      .data(c.dStacked)
      .transition(c.t())
      .attr('d', c.arealine)
  }

  // replacing old legend method with new inline labels
  drawLegend () {
    // chart (c) object, value (v), colour (z), line height(lH)
    const c = this
    const g = c.g
    const v = c.value
    const z = c.colour
    const lH = 10

    // data values for last readable value
    const lines = c.dStacked.map(d => {
      const obj = {}
      const vs = d.filter(idFilter)
      const s = vs.length - 1
      // sF = d.data.length -1;
      obj.key = d.key
      // obj.last = vs[s][v];

      obj.x = c.x(vs[s].data[c.xV])
      // obj.y = sF === s ? c.y(vs[s][v]) : c.y(vs[s][v]) - 15;
      obj.y = c.y(vs[s][1])
      return obj
    })

    //     const circles = c.d.map(d => {
    //         let obj = {},
    //             vs = d.filter(idFilter),
    //             s = vs.length -1;
    //             // sF = d.data.length -1;
    //             obj.key = d.key;
    //             // obj.last = vs[s][v];
    //             obj.x = c.x(vs[s].data[c.xV]);
    //             // obj.y = sF === s ? c.y(vs[s][v]) : c.y(vs[s][v]) - 15;
    //             obj.y = c.y(vs[s][1]);
    //         return obj;

    // });
    // Define a custom force to stop labels going outside the svg
    const forceClamp = (min, max) => {
      let nodes
      const force = () => {
        nodes.forEach(n => {
          if (n.y > max) n.y = max
          if (n.y < min) n.y = min
        })
      }
      force.initialize = (_) => nodes = _
      return force
    }

    // Set up the force simulation
    const force = d3.forceSimulation()
      .nodes(lines)
      .force('collide', d3.forceCollide(lH / 2))
      // .force("y", d3.forceY(d => d.y).strength(4))
      .force('x', d3.forceX(d => d.x).strength(4))
      .force('clamp', forceClamp(0, c.h - 4))
      .stop()

    // Execute the simulation
    for (let i = 0; i < 300; i++) force.tick()

    // Add labels
    const legendNames = g.selectAll('.label-legend').data(lines, d => d.y)
    // console.log(legendNames)
    legendNames.exit().remove()

    // const legendCircles = g.selectAll(".legend-circles").data(circles, d => d.y);
    //       legendCircles.exit().remove();

    const legendGroup = legendNames.enter().append('g')
      .attr('class', 'label-legend')
      .attr('transform', d => 'translate(' + d.x + ', ' + d.y + ')')

    // const legendGC = legendCircles.enter().append("g")
    //         .attr("class", "legend-circles")
    //         .attr("transform", d => "translate(" + d.x + ", " + d.y + ")");

    legendGroup.append('text')
      .attr('class', 'legendText')
      .attr('id', d => d.key)
      .attr('dy', '.01em')
      .text(d => d.key)
      .call(c.textWrap, 110, 10)
      .attr('fill', d => z(d.key))
      .attr('alignment-baseline', 'middle')
      .attr('dx', '.5em')
      .attr('x', 6)

    // legendGroup.append("line")
    //     .attr("class", "clegend-line")
    //     .attr("x1", 2)
    //     .attr("x2", 12)
    //     .attr("stroke", d => z(d.key))
    //     .attr("stroke-width","10px");

    legendGroup.append('circle')
      .attr('class', 'l-circle')
      .attr('cx', '0') // was 6
      .attr('r', '4')
      .attr('fill', d => z(d.key))

    // check if number
    function isNum (d) {
      return !isNaN(d)
    }

    // filter out the NaN
    function idFilter (d) {
      return !!isNum(d[1])
    }

    function bouncer (arr) {
      return arr.filter(x => {})
    }
  }

  addLegend () {
    const c = this

    // create legend group
    var legend = c.g.append('g')
      .attr('transform', 'translate(0,0)')

    // create legend array, this needs to come from the data.
    c.legendArray = []

    c.ks.forEach((d) => {
      const obj = {}
      obj.label = d
      obj.colour = c.colour(d)
      c.legendArray.push(obj)
    })
    c.legendArray.reverse()

    // get data and enter onto the legend group
    const legends = legend.selectAll('.legend')
      .data(c.legendArray)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => { return 'translate(0,' + i * 40 + ')' })
      .attr('id', (d, i) => 'legend-item' + i)
      .style('font', '12px sans-serif')

    // add legend boxes
    legends.append('rect')
      .attr('class', 'legendRect')
      .attr('x', c.w + 10)
      .attr('width', 25)
      .attr('height', 25)
      .attr('fill', d => { return d.colour })
      .attr('fill-opacity', 0.75)

    legends.append('text')
      .attr('class', 'legendText')
    // .attr("x", c.w + 40)
      .attr('y', 12)
      .attr('dy', '.025em')
      .attr('text-anchor', 'start')
      .text(d => { return d.label })
      .call(c.textWrap, 110, c.w + 34)
  }

  drawFocus () {
    const c = this
    const g = c.g

    c.focus = g.append('g')
      .attr('class', 'focus')
      .style('display', 'none')
      .style('visibility', 'hidden')

    c.drawFocusLine()

    c.drawFocusOverlay()
  }

  // drawFocusLine () {
  //   // console.log('draw focus line')
  //   let c = this,
  //     g = c.g
  //
  //   c.focus = g.append('g')
  //     .attr('class', 'focus')
  //
  //   c.focus.append('line')
  //     .attr('class', 'focus_line')
  //     .attr('y1', 0)
  //     .attr('y2', c.h)
  //
  //   c.focus.append('g')
  //     .attr('class', 'focus_circles')
  //
  //   c.ks.forEach((d, i) => {
  //     c.drawFocusCircles(d, i)
  //   })
  // }

  // drawFocusLine () {
  //   // console.log('draw focu s line')
  //   let c = this,
  //     focus = c.focus
  //   console.log('focus sa')
  //   console.log(focus)
  //   // Focus line
  //   focus.append('line')
  //     .attr('class', 'focus_line')
  //     .attr('y1', 0)
  //     .attr('y2', c.h)
  //
  //   c.drawFocusCircles()
  // }

  drawFocusCircles () {
    const c = this
    const focus = c.focus
    // keys = c.getKeys(),

    const focusCircles = focus.append('g')
      .attr('class', 'focus_circles')

    // attach group append circle and text for each region
    c.ks.forEach((d, i) => {
      focusCircles.append('g')
        .attr('class', 'tooltip_' + i)
        .append('circle')
        .attr('r', 0)
        .transition(c.t)
        .attr('r', 5)
        .attr('fill', c.colour(d))
        .attr('stroke', c.colour(d))
    })
  }

  addTooltip (title, format, dateField, prefix, postfix) {
    const c = this

    d3.select(c.e).select('.focus').remove()
    d3.select(c.e).select('.focus_overlay').remove()

    c.ttTitle = title || c.ttTitle
    c.valueFormat = format || c.valueFormat
    c.xVField = dateField || c.xVField
    // c.arrowChange = arrowChange;
    c.ttWidth = 305
    c.prefix = prefix || ' '
    c.postfix = postfix || ' '
    c.valueFormat = c.formatValue(c.valueFormat)
    // super.drawFocusLine()

    c.drawFocus()
  }

  drawFocusOverlay () {
    const c = this
    const g = c.g
    const focus = c.focus
    const overlay = g.append('rect')

    overlay.attr('class', 'focus_overlay')
      .attr('width', c.w)
      .attr('height', c.h)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .style('visibility', 'hidden')

    if (c.sscreens) {
      mousemove()
      overlay
        .on('touchmove', mousemove, {
          passive: true
        })
        .on('mousemove', mousemove, {
          passive: true
        })
    } else {
      overlay
        .on('mouseover', (d) => {
          focus.style('display', null)
        }, {
          passive: true
        })
        .on('mouseout', () => {
          focus.style('display', 'none')
          c.newToolTip.style('visibility', 'hidden')
        })
        .on('mousemove', mousemove, {
          passive: true
        })
    }

    function mousemove () {
      // console.log('mousemove')
      focus.style('visibility', 'visible')
      c.newToolTip.style('visibility', 'visible')
      c.newToolTip.style('display', 'block')

      const mouse = this ? d3.mouse(this) : c.w
      // console.log('sa mouse')
      // console.log(mouse)
      const ttTextHeights = 0
      const x0 = c.x.invert(mouse[0] || mouse)
      const i = c.bisectDate(c.d, x0, 1)
      const d0 = c.d[i - 1]
      const d1 = c.d[i]
      let d
      let dPrev
      const keys = c.ks.map(d => {
        return d
      }).reverse()

      d1 !== undefined ? d = x0 - d0[c.xV] > d1[c.xV] - x0 ? d1 : d0 : false
      d1 !== undefined ? dPrev = x0 - d0[c.xV] > d1[c.xV] - x0 ? c.d[i - 1] : c.d[i - 2] : false

      keys.forEach((reg, idx) => {
        const dvalue = c.dStacked[idx]
        const key = reg
        const id = '#bcd-tt' + idx
        const div = c.newToolTip.select(id)
        const p = div.select('.bcd-text')
        const dd0 = dvalue[i - 1]
        const dd1 = dvalue[i]
        let dd
        const unText = 'N/A'
        const difference = dPrev ? (d[key] - dPrev[key]) / dPrev[key] : 0
        let indicatorColour
        const indicator = difference > 0 ? ' ▲' : difference < 0 ? ' ▼' : ''
        const rate = isNaN(difference) ? unText : d3.format('.1%')(difference)

        if (c.arrowChange === true) {
          indicatorColour = difference < 0 ? '#20c997' : difference > 0 ? '#da1e4d' : '#f8f8f8'
        } else {
          indicatorColour = difference > 0 ? '#20c997' : difference < 0 ? '#da1e4d' : '#f8f8f8'
        }

        if (d !== undefined) {
          const dot = '.tooltip_' + idx
          const tooltip = focus.select(dot)

          c.updatePosition(c.x(d[c.xV]), -300)

          dd1 !== undefined ? dd = x0 - dd0.data[c.xV] > dd1.data[c.xV] - x0 ? dd1 : dd0 : false

          div.style('opacity', 1)
          div.select('.bcd-dot').style('background-color', c.colour(key))
          p.select('.bcd-text-title').text(key)
          p.select('.bcd-text-value').text(isNaN(d[key]) ? 'N/A' : d[key])
          p.select('.bcd-text-rate').text(rate)
          p.select('.bcd-text-indicator').text(' ' + indicator).style('color', indicatorColour)

          c.newToolTipTitle.text(c.ttTitle + ' ' + (d[c.xVField]))

          tooltip.attr('transform', 'translate(' + c.x(d[c.xV]) + ',' + c.y(dd[1] ? dd[1] : 0) + ')')
          focus.select('.focus_line').attr('transform', 'translate(' + c.x((d[c.xV])) + ', 0)')
        }
      })
    }
  }

  updatePosition (xPosition, yPosition) {
    // console.log('update')
    const c = this
    const g = c.g
    // get the x and y values - y is static
    const [tooltipX, tooltipY] = c.getTooltipPosition([xPosition, yPosition])
    // move the tooltip
    g.select('.bcd-tooltip').attr('transform', 'translate(' + tooltipX + ', ' + tooltipY + ')')
    c.newToolTip.style('left', tooltipX + 'px').style('top', tooltipY + 'px')
  }

  getTooltipPosition ([mouseX, mouseY]) {
    const c = this
    let ttX
    const ttY = mouseY
    const cSize = c.w - c.ttWidth

    // show right - 60 is the margin large screens
    if (mouseX < cSize) {
      ttX = mouseX + 105
    } else {
      // show left - 60 is the margin large screens
      ttX = (mouseX + 90) - c.ttWidth
    }
    return [ttX, ttY]
  }

  getElement (name) {
    const c = this
    const s = d3.select(c.e)
    const e = s.selectAll(name)
    return e
  }

  textWrap (text, width, xpos = 0, limit = 2) {
    text.each(function () {
      let words,
        word,
        line,
        lineNumber,
        lineHeight,
        y,
        dy,
        tspan

      text = d3.select(this)

      words = text.text().split(/\s+/).reverse()
      line = []
      lineNumber = 0
      lineHeight = 1
      y = text.attr('y')
      dy = parseFloat(text.attr('dy'))
      tspan = text
        .text(null)
        .append('tspan')
        .attr('x', xpos)
        .attr('y', y)
        .attr('dy', dy + 'em')

      while ((word = words.pop())) {
        line.push(word)
        tspan.text(line.join(' '))

        if (tspan.node() && tspan.node().getComputedTextLength() > width) {
          line.pop()
          tspan.text(line.join(' '))

          if (lineNumber < limit - 1) {
            line = [word]
            tspan = text.append('tspan')
              .attr('x', xpos)
              .attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy + 'em')
              .text(word)
            // if we need two lines for the text, move them both up to center them
            text.classed('move-up', true)
          } else {
            line.push('...')
            tspan.text(line.join(' '))
            break
          }
        }
      }
    })
  }

  formatValue (format) {
    // formats thousands, Millions, Euros and Percentage
    switch (format) {
      case 'millions':
        return d3.format('.2s')
        break

      case 'euros':
        return 'undefined'
        break

      case 'thousands':
        return d3.format(',')
        break

      case 'percentage':
        return d3.format('.2%')
        break

      default:
        return 'undefined'
    }
  }

  formatQuarter (date, i) {
    const newDate = new Date()
    newDate.setMonth(date.getMonth() + 1)
    const year = (date.getFullYear())
    const q = Math.ceil((newDate.getMonth()) / 3)
    return year + ' Q' + q
  }

  slicer (arr, sliceBy) {
    if (sliceBy < 1 || !arr) return () => []

    return (p) => {
      const base = p * sliceBy
      const size = arr.length

      let slicedArray = p < 0 || base >= arr.length ? [] : arr.slice(base, base + sliceBy)

      if (slicedArray.length < (sliceBy / 2)) return slicedArray = arr.slice(size - sliceBy)

      return slicedArray
    }
  }

  pagination (data, selector, sliceBy, pageNumber, label) {
    const c = this

    const slices = c.slicer(data, sliceBy)
    const times = pageNumber
    const startSet = slices(times - 1)
    const updateObj = {
      d: startSet
    }

    //  let newStart = [];
    //  startSet.length < sliceBy ? newStart = data.slice(50 - sliceBy) : newStart = startSet;

    d3.selectAll(selector + ' .pagination-holder').remove()

    const moreButtons = d3.select(selector)
      .append('div')
      .attr('class', 'pagination-holder text-center pb-2')

    c.updateChart(updateObj)
    c.addTooltip()

    for (let i = 0; i < times; i++) {
      // let wg = slices(i)
      // wg.length < sliceBy ? wg = data.slice(50 - sliceBy) : wg;

      const wg = slices(i)
      const sliceNumber = sliceBy - 1
      let secondText
      let textString

      if (typeof wg[sliceNumber] !== 'undefined') {
        secondText = wg[sliceNumber]
      } else {
        const lastEl = wg.length - 1
        secondText = wg[lastEl]
      }

      if (wg[0][label] === secondText[label]) {
        textString = wg[0][label]
      } else {
        textString = wg[0][label] + ' - ' + secondText[label]
      }

      moreButtons.append('button')
        .attr('type', 'button')
        .attr('class', i === times - 1 ? 'btn btn-page mx-1 active' : 'btn btn-page')
        .style('border-right', i === times - 1 ? 'none' : '1px Solid #838586')
        // .text(label + " " + (1+(i*sliceBy)) +" - "+ ((i+1)*sliceBy)) // pass this to the function
        .text(textString)
        .on('click', function () {
          if (!$(this).hasClass('active')) {
            $(this).siblings().removeClass('active')
            $(this).addClass('active')
            c.updateChart({
              d: wg
            })
            c.addTooltip()
          }
        })
    }
  }
}

export { StackedAreaChart }
