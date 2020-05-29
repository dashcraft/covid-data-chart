const COVID_DATA_URL= "https://data.cdc.gov/resource/pp7x-dyj2.json"

export default function getPData(){
    return fetch(COVID_DATA_URL).then(res => res.json())
}