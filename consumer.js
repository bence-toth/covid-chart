const isNotProvince = ({Province}) => Province === ''

const getDateOfFirstConfirmedCase = dataPoints => (
  new Date(dataPoints[0].Date)
)

const getDateOfLastConfirmedCase = dataPoints => (
  new Date(dataPoints[dataPoints.length - 1].Date)
)

const getDailyDeaths = dataPoints => (
  dataPoints
    .map((dataPoint, dataPointIndex, dataPoints) => {
      const deathsToday = dataPoint.Deaths
      if (dataPointIndex === 0) {
        return deathsToday
      }
      const deathsYesterday = dataPoints[dataPointIndex - 1].Deaths
      // Ignore decreasing total deaths
      const correctedDeathsToday = (
        (deathsYesterday > deathsToday)
          ? deathsYesterday
          : deathsToday
      )
      return (correctedDeathsToday - deathsYesterday)
    })
)

const getMovingWeeklyAverageOfDailyDeaths = dataPoints => (
  getDailyDeaths(dataPoints)
    .map((dataPoint, dataPointIndex, dataPoints) => {
      return (
        (dataPoint
          + (dataPoints[dataPointIndex - 1] || 0)
          + (dataPoints[dataPointIndex - 2] || 0)
          + (dataPoints[dataPointIndex - 3] || 0)
          + (dataPoints[dataPointIndex - 4] || 0)
          + (dataPoints[dataPointIndex - 5] || 0)
          + (dataPoints[dataPointIndex - 6] || 0)
        ) / 7
      )
    })
)

const getCountryData = async slug => {
  const population = countries.find(({slug: slugToFind}) => slug === slugToFind).population
  const response = await fetch(`https://api.covid19api.com/dayone/country/${slug}`)
  const dataPoints = await response.json()
  const relevantDataPoints = dataPoints.filter(isNotProvince)
  const dateOfFirstConfirmedCase = getDateOfFirstConfirmedCase(relevantDataPoints)
  const dateOfLastConfirmedCase = getDateOfLastConfirmedCase(relevantDataPoints)
  const movingWeeklyAverageOfDailyDeaths = getMovingWeeklyAverageOfDailyDeaths(relevantDataPoints)
  const movingWeeklyAverageOfDailyDeathsPerMillion = movingWeeklyAverageOfDailyDeaths.map(
    deaths => deaths * 1000000 / population
  )
  return {
    dateOfFirstConfirmedCase,
    dateOfLastConfirmedCase,
    movingWeeklyAverageOfDailyDeathsPerMillion
  }
}