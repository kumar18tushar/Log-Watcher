import './App.css';
import { useEffect, useState } from 'react';
const axios = require('axios');

function App() {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const makeApiCall = async () => {

      const config = {
        method: 'get',
        url: 'http://localhost:4000',
      };
      
      axios(config)
      .then(function (response) {
        const logsReceived = response.data.logs;
        const maxRecoreded = (logs.length > 0) ? logs[logs.length-1].server_timestamp: null;
        const difference = logsReceived.filter(log => log.server_timestamp>maxRecoreded);

        if(difference.length > 0) {
          setLogs([...logs, ...difference]);
        } else setLogs([...logs]);
      })
      .catch(function (error) {
        console.log(error);
      });
    }

    const timer = setTimeout(() => {
      makeApiCall();
    }, 3000);

    return () => clearTimeout(timer);
  }, [logs]);

  return (
    <>
      <div className="mainContainer">
        <div className="logsContainer">
          {Array.from(logs).map(curr => (<div className="logs">{curr.line}</div>))}    
        </div>
      </div>
    </>    
  );
}

export default App;
