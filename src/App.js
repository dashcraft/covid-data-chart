import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { css } from "@emotion/core";

import getCovidData from './services/covid-data'
import getPData from './services/pneumonia-deaths'

import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import ClipLoader from "react-spinners/ClipLoader";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

function App() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [pdata, setPData] = useState([])
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData(){
    let data = await getCovidData()
    let pdata = await getPData()

    setTimeout(async () => {
      await setData(data)
      await setPData(pdata)
      await setLoading(false)
    }, 1500)
  }

  // console.log('data', data, 'loading', loading)

  function reduceData(){
    let pmnDeaths = reducePData(pdata)
    return data.reduce((arr, item) => {
      const exists = arr.findIndex(it => it.state == item.state)
      const statePnOnly = pmnDeaths.find(pn => pn.state === item.state)
      if(item.state === 'United States'){
        return arr;
      }
      if(exists !== -1){
        arr[exists].pneumonia_deaths += parseInt(item.pneumonia_deaths)|| 0
        arr[exists].pneumonia_influenza_or_covid_19_deaths += parseInt(item.pneumonia_influenza_or_covid_19_deaths)|| 0
        arr[exists].total_deaths += parseInt(item.total_deaths)|| 0
        arr[exists].covid_deaths += parseInt(item.covid_deaths)|| 0
        arr[exists].pneumonia_and_covid_deaths += parseInt(item.pneumonia_and_covid_deaths)|| 0
        if(!!statePnOnly && statePnOnly['2017-18']){
          console.log('state pn only', statePnOnly['2017-18'])
          arr[exists].past_2018 = parseInt(statePnOnly['2017-18'] )
        }
      } else {
        let initItem = {
          state: item.state,
          pneumonia_deaths: parseInt(item.pneumonia_deaths)|| 0,
          pneumonia_influenza_or_covid_19_deaths: parseInt(item.pneumonia_influenza_or_covid_19_deaths)|| 0,
          total_deaths: parseInt(item.total_deaths) || 0,
          covid_deaths: parseInt(item.covid_deaths) || 0,
          pneumonia_and_covid_deaths: parseInt(item.pneumonia_and_covid_deaths) || 0,
        }
        if(!!statePnOnly && statePnOnly['2017-18']){
          console.log('state pn only', statePnOnly['2017-18'])

          initItem.past_2018 = parseInt(statePnOnly['2017-18'])
        }

        arr.push(initItem)
      }
      return arr;
    }, [])
  }

  function reducePData(pdata){
    return pdata.reduce((arr, item) => {
      const exists = arr.findIndex(it => it.state == item.state)
      if(!item.state){
        return arr;
      }
      if(exists !== -1) {
        arr[exists][item.season] = item.deaths_from_pneumonia_and_influenza
      } else {
        let newItem = {}
        newItem.state = item.state
        newItem[`${item.season}`] = item.deaths_from_pneumonia_and_influenza
        arr.push(newItem)
      }
      return arr;
    }, [])
  }

  if(loading){
    return (
      <div className="sweet-loading">
        <ClipLoader
          css={override}
          size={150}
          color={"#123abc"}
          loading={loading}
        />
      </div>
    )
  }

  return (
    <div className="App" style={{height: '100vh', width: '100vw', display: 'flex', flex: 1, flexDirection: 'row'}}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column'}}>
      <h2 style={{ textAlign: 'center' }}> pneumonia vs covid and difference since January </h2>
      <ResponsiveContainer>
        <BarChart
          data={reduceData(data)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="state" />
          <YAxis domain={[0, 50000]}/>
          <Tooltip />
          <Legend />
          <Bar dataKey="covid_deaths" stackId="a" fill="#82ca9d" />
          <Bar dataKey="pneumonia_deaths" stackId="a" fill="#8884d8" />
          <Bar dataKey="past_2018" stackId="a" fill="#841617" />        
        </BarChart>
    </ResponsiveContainer>
    </div>
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column'}}>
      <h2 style={{ textAlign: 'center' }}> Pneumonia prior years for FULL YEAR </h2>
    <table>
      <thead>
        <th>State</th>
        <th>2018</th>
        <th>2017</th>
        <th>2016</th>
      </thead>
      <tbody>
        {reducePData(pdata).sort((a,b) => {
          if(a.state > b.state) return 1
          if(a.state < b.state) return -1
          return 0
        }).map(dat => {
          return (<tr>
          <td>{dat.state}</td>
          <td>{dat['2017-18']}</td>
          <td>{dat['2016-17']}</td>
          <td>{dat['2015-16']}</td>
        </tr>)
        })}
      </tbody>
    </table>
    </div>
    </div>
  );
}

export default App;
