import { convertQuarterToDate } from '../../modules/bcd-date.js'
import { coerceWideTable } from '../../modules/bcd-data.js'
import { MultiLineChart } from '../../modules/MultiLineChart.js'
let publicTransportChart
const publicTransportURL = '../data/Economy/data_gov_economic_monitor/indicator-.8.-public-transport.csv'

Promise.all([
  d3.csv(publicTransportURL)
])
  .then(data => {
    try {
      const publicTransportData = data[0]
      const publicTransportColumns = publicTransportData.columns.slice(1)
      if (document.getElementById('chart-public-transport-trips')) {
        const busEireannData = getData(publicTransportColumns[1])
        const dublinBusData = getData(publicTransportColumns[2])
        const irishRailData = getData(publicTransportColumns[3])
        const luasData = getData(publicTransportColumns[4])

        const longData = busEireannData.concat(dublinBusData).concat(irishRailData).concat(luasData)

        const publicTransportOptions = {
          elementId: 'chart-public-transport-trips',
          data: longData,
          tracekey: 'variable', // key whose value will name the traces (group by)
          xV: 'date',
          yV: 'value',
          tX: 'Quarter',
          tY: 'Trips (millions)'
        }
        publicTransportChart = new MultiLineChart(publicTransportOptions)

        function getData (key) {
          const longArray = publicTransportData.map(d => {
            // the date is re-formatted  "'Q'Q YY" -> "YYYY'Q'Q"
            const yearQuarter = '20' + d.Quarter.toString().split(' ')[1] + d.Quarter.toString().split(' ')[0]
            const obj = {
              label: d.Quarter,
              value: parseFloat(d[key].replace(/,/g, '')) / 1000000,
              variable: key,
              date: convertQuarterToDate(yearQuarter)
            }
            return obj
          }).filter(d => {
            return !Number.isNaN(d.value)
          })
          return longArray
        }

        function redraw () {
          publicTransportChart.drawChart()
          publicTransportChart.addTooltip('Tonnage, ', 'thousands', 'label')
        }

        redraw()

        window.addEventListener('resize', () => {
          redraw()
        })
      }
    } catch (e) {
      console.log(e)
    }
  })
