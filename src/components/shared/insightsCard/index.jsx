import React from 'react';
import {useState} from 'react'
import api from '../../../services/api';
import Readable from 'stream'
import axios from 'axios'
import useSendAIRequest from '../../../custom-hooks/useSendAIRequest'
import Loading from '../../common/loading/Loading';

const InsightsCard = ({additionalClasses, ai_endpoint, defaultText}) => {
  const [textareaValue, setTextareaValue] = useState(defaultText)
  const [requests, setRequests] = useState(0) 
  const [fetching, setFetching] = useState(false)

  const [response, sendRequest, error, loading] = useSendAIRequest({ai_endpoint}) 
const handleTextareaChange = (e)=>{
    setTextareaValue(e.target.value);
  }
  
  return(
  <div className={`card ${additionalClasses}`} style={{width: '100%'}}>
    <div className="flex items-center gap-4">
      <h3>AI Insights</h3>
      <div className="change ai_beta_tag">
        Beta
      </div>


    </div>
   
    <div style={{position: 'relative'}}>
    
    <textarea 
    className="filter_input w-full my-4" 
    rows={4} 
    placeholder="Search"
    value={textareaValue}
    onChange={handleTextareaChange}
     />
    <div className="border border-solid border-600 text-indigo-800 hover:border-indigo-700 py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"style={{position: 'absolute', bottom: '10px', right : '10px'}} onClick={(e)=>{
        sendRequest(textareaValue)
      }}>
        Submit <i className="fa-solid fa-arrow-right"></i>
      </div>

    </div>

    <div style={{position : 'relative'}}>
    <div style={{position: 'absolute', left: '50%', top: '30%', transform: 'translate(-50%, 0%)'}}>
        {loading == true ? <><Loading /> Waiting for response</> : <></>}
     </div>
    <textarea rows={6} className="focus:outline-none w-full my-4 bg-gray-100 filter_input" placeholder={loading?'':"AI assistant's response..."} style = {{whiteSpace: 'pre-line'}} value={response}>
    {
      error == '' ? (response == '' ? `Here will be your response` : response) : error 
    }
    </textarea>
    </div>
  </div>)
};

export default InsightsCard;

