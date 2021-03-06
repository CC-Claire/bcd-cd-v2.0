import { fetchJsonFromUrlAsync } from '../../modules/bcd-async.js'
import { convertQuarterToDate } from '../../modules/bcd-date.js'
import { stackNest } from '../../modules/bcd-data.js'
import JSONstat from 'https://unpkg.com/jsonstat-toolkit@1.0.8/import.mjs'
import { MultiLineChart } from '../../modules/MultiLineChart.js'
import { StackedAreaChart } from '../../modules/StackedAreaChart.js'
import { activeBtn } from '../../modules/bcd-ui.js'

(async () => {
  const parseYear = d3.timeParse('%Y')
  const STATBANK_BASE_URL =
          'https://statbank.cso.ie/StatbankServices/StatbankServices.svc/jsonservice/responseinstance/'
  // CNA31: Populaton by Country of Birth, County and Year
  const TABLE_CODE = 'CNA31' // gives no of outsideState and ave household size
  const json = await fetchJsonFromUrlAsync(STATBANK_BASE_URL + TABLE_CODE)

  const dataset = JSONstat(json).Dataset(0)
  // console.log('dataset')
  // console.log(dataset)
  // console.log('dim')
  const dimensions = dataset.Dimension().map(dim => {
    return dim.label
  })
  // console.log(dimensions)

  const categoriesOfCountry = dataset.Dimension(dimensions[0]).Category().map(c => {
    return c.label
  })

  // console.log('categories of country')
  // console.log(categoriesOfCountry)

  // let STATS = ['Population (Number)']
  // = ['Total Birth', 'Great Britain', 'U.S.A.', 'Other Countries']
  //
  const bornOutsideTable = dataset.toTable(
    { type: 'arrobj' },
    (d, i) => {
      if (
      // d[DIMENSION] === 'State'||
      // (d[dimensions[0]] === categoriesOfCountry[0] ||
        (d[dimensions[0]] === categoriesOfCountry[0] ||
        d[dimensions[0]] === categoriesOfCountry[5] ||
        d[dimensions[0]] === categoriesOfCountry[8] ||
        d[dimensions[0]] === categoriesOfCountry[9]) &&
      (d.County === 'Dublin' ||
        d.County === 'State') &&
      +d.Year >= 1991) {
        d.date = parseYear(+d.Year)
        d.label = +d.Year
        d.value = +d.value / 1000
        return d
      }
    })

  // console.log(bornOutsideTable)

  const bornOutsideDublin = {
    elementId: 'chart-born-outside-dublin',
    data: bornOutsideTable.filter(d => {
      return d.County === 'Dublin'
    }),
    tracenames: categoriesOfCountry,
    tracekey: dimensions[0],
    xV: 'date',
    yV: 'value',
    tX: 'Year',
    tY: 'Population (thousands)'
  }
  //
  const bornOutsideDublinChart = new MultiLineChart(bornOutsideDublin)

  // bornOutsideDublinChart.tickNumber = 31
  bornOutsideDublinChart.drawChart()
  // bornOutsideDublinChart.addTooltip(outsideStateTT)
  bornOutsideDublinChart.addTooltip('Population (thousands) in census year ', '', 'label')
  // bornOutsideDublinChart.showSelectedLabelsX([1, 6, 11, 17, 21, 26, 31])
  //

  const bornOutsideState = {
    elementId: 'chart-born-outside-state',
    data: bornOutsideTable.filter(d => {
      return d.County === 'State'
    }),
    tracenames: categoriesOfCountry,
    tracekey: dimensions[0],
    xV: 'date',
    yV: 'value',
    tX: 'Year',
    tY: 'Population (thousands)'
  }

  const bornOutsideStateChart = new MultiLineChart(bornOutsideState)
  bornOutsideStateChart.drawChart()
  bornOutsideStateChart.addTooltip('Population (thousands) in census year ', '', 'label')

  const chart1 = 'born-outside-dublin'
  const chart2 = 'born-outside-state'

  d3.select('#chart-' + chart1).style('display', 'block')
  d3.select('#chart-' + chart2).style('display', 'none')

  d3.select('#btn-' + chart1).on('click', function () {
    activeBtn(this)
    d3.select('#chart-' + chart1).style('display', 'block')
    d3.select('#chart-' + chart2).style('display', 'none')
    // bornOutsideDublinChart.tickNumber = 31
    bornOutsideDublinChart.drawChart()
    bornOutsideDublinChart.addTooltip('Population (thousands) in census year ', '', 'label')
    // bornOutsideDublinChart.addTooltip(outsideStateTT)
    // bornOutsideDublinChart.addTooltip(STATS[0].split('(')[0], '', 'label')
    // bornOutsideDublinChart.showSelectedLabelsX([1, 6, 11, 17, 21, 26, 31])
  })

  d3.select('#btn-' + chart2).on('click', function () {
    activeBtn(this)
    d3.select('#chart-' + chart1).style('display', 'none')
    d3.select('#chart-' + chart2).style('display', 'block')
    bornOutsideStateChart.drawChart()
    bornOutsideStateChart.addTooltip('Population (thousands) in census year ', '', 'label')
  })

  window.addEventListener('resize', () => {
    // console.log('redraw outsideState')
    // bornOutsideDublinChart.tickNumber = 31
    if (document.querySelector('#chart-' + chart1).style.display !== 'none') {
      bornOutsideDublinChart.drawChart()
      bornOutsideDublinChart.addTooltip('Population (thousands) in census year ', '', 'label')
    }
    if (document.querySelector('#chart-' + chart2).style.display !== 'none') {
      bornOutsideStateChart.drawChart()
      bornOutsideStateChart.addTooltip('Population (thousands) in census year ', '', 'label')
    }
    // bornOutsideDublinChart.addTooltip(outsideStateTT)
    // bornOutsideDublinChart.addTooltip('Population (thousands) in census year ', '', 'label')
    // bornOutsideStateChart.addTooltip('Population (thousands) in census year ', '', 'label')
    // bornOutsideDublinChart.showSelectedLabelsX([1, 6, 11, 17, 21, 26, 31])
  })
})()
