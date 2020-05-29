import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { css } from "@emotion/core";

import getCovidData from './services/covid-data'
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

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData(){
    let data = await getCovidData()
    setTimeout(async () => {
      await setData(data)
      await setLoading(false)
    }, 1500)
  }

  // console.log('data', data, 'loading', loading)

  function reduceData(){
    return data.reduce((arr, item) => {
      const exists = arr.findIndex(it => it.state == item.state)
      if(item.state === 'United States'){
        return arr;
      }
      if(exists !== -1){
        arr[exists].pneumonia_deaths += parseInt(item.pneumonia_deaths)|| 0
        arr[exists].pneumonia_influenza_or_covid_19_deaths += parseInt(item.pneumonia_influenza_or_covid_19_deaths)|| 0
        arr[exists].total_deaths += parseInt(item.total_deaths)|| 0
        arr[exists].covid_deaths += parseInt(item.covid_deaths)|| 0
        arr[exists].pneumonia_and_covid_deaths += parseInt(item.pneumonia_and_covid_deaths)|| 0
        arr[exists].difference = parseFloat(arr[exists].pneumonia_deaths / arr[exists].covid_deaths, 2) * 100
        if(!isFinite(arr[exists].difference)){
          arr[exists].difference = arr[exists].pneumonia_deaths
        }
      } else {
        let initItem = {
          state: item.state,
          pneumonia_deaths: parseInt(item.pneumonia_deaths)|| 0,
          pneumonia_influenza_or_covid_19_deaths: parseInt(item.pneumonia_influenza_or_covid_19_deaths)|| 0,
          total_deaths: parseInt(item.total_deaths) || 0,
          covid_deaths: parseInt(item.covid_deaths) || 0,
          pneumonia_and_covid_deaths: parseInt(item.pneumonia_and_covid_deaths) || 0,
          difference: parseFloat((parseInt(item.pneumonia_deaths)|| 0 / parseInt(item.covid_deaths) || 0), 2) * 100
        }
        if(!isFinite(initItem.difference)){
          initItem.difference = arr.pneumonia_deaths
        }
        arr.push(initItem)
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

  console.log('reduced data', reduceData(data))
  return (
    <div className="App" style={{height: '100vh', width: '100vh'}}>
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
        <Bar dataKey="difference" stackId="a" fill="#841617" />        
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

export default App;
