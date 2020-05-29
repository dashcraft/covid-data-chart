const COVID_DATA_URL= "https://data.cdc.gov/resource/r8kw-7aab.json"

export default function getCovidData(){
    return fetch(COVID_DATA_URL).then(res => res.json())
}