import React from 'react';
import cn from "classnames";
import {useState, useEffect, useContext} from 'react';
import SimpleDonut from "./simpleDonut/index";
import NoticeElement from "./noticeElement/index";
import useSendAIRequest from "./../../../custom-hooks/useSendAIRequest"
import Loading from '../../common/loading/Loading';
import {useRef} from 'react'
import {ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppContext from '../../../custom-context/appContext';
const HealthScoreCard = ({donutOneTitle, donutOnePercent, donutTwoTitle, donutTwoPercent, donutThreeTitle, donutThreePercent, donutFourTitle, donutFourPercent, alertOneType, alertOneContent, alertTwoType, alertTwoContent, alertThreeType, alertThreeContent, aiCall, additionalClasses, defaultText, displayTextArea, ai_endpoint}) => {
  const [textareaValue, setTextareaValue] = useState(`What has happened of note within the private aviation industry within the past 7 days?`)
  const { limitation, setLimitation } = useContext(AppContext);
  const [response, sendRequest, error, loading]  = useSendAIRequest({ai_endpoint}, limitation, setLimitation)
  const [chat, setChat] = useState(false)
  const refCard = useRef()
  const handleTextareaChange = (e)=>{
    setTextareaValue(e.target.value);
  }
  const [, forceUpdate] = useState();
  // forceUpdate({});

  useEffect(()=>{
    forceUpdate({});
  } , [chat])
  const notify = () => toast.error("You reached limitation!", {
    position: 'bottom-right',
    theme: 'colored',
    autoClose: 3000,
    toastId: 'alert-toast'
  });
  const color = limitation > 5 ? 'text-indigo-800' : limitation > 0 ? 'text-red-500' : 'text-stone-400';
  return(
  
  <div ref={refCard} className={`card ${additionalClasses} w-full h-min-[25em] h-min-[25em] `}  >
    <ToastContainer />
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <h3>Health Score</h3>
      <div className="change ai_beta_tag">
        AI Beta
      </div>


      {displayTextArea === undefined || displayTextArea == true ? 
        <div className="interact_button ml-auto focus:outline-none focus:ring focus:border-blue-300 transition-transform duration-300 transform hover:scale-105 " onClick={(e)=>{
          if(chat == true){
            setChat(false)
            // refCard.current.style.height = '20em'
          }else{
            // refCard.current.style.height = '25em'
            setChat(true)
          }
        }}>
          <i className="fa-solid fa-right-left"></i>
          <p>{chat == false ? "Ask" : "Scores"}</p>
          <span className={color} style={{ display: chat == false ? 'none': 'inline'}}>{limitation} left</span>
        </div>
        : <></>
      }


    </div>
    
  

    {chat == false ? 
    <div className="grid md:grid-cols-2 lg:grid-cols-4 mt-4 gap-2 items-end">
      <SimpleDonut title={donutOneTitle} percentage={donutOnePercent} />
      <SimpleDonut title={donutTwoTitle} percentage={donutTwoPercent} />
      <SimpleDonut title={donutThreeTitle} percentage={donutThreePercent} />
      <SimpleDonut title={donutFourTitle} percentage={donutFourPercent} />
    </div> : <></>}
    {chat == true ? 
    
    <div style={{position: 'relative'}}>
      <textarea 
      className="filter_input w-full my-4" 
      rows={4} 
      placeholder="Search"
      value={textareaValue}
      onChange={handleTextareaChange}
      /> 
      
      <div className="border border-solid text-indigo-800 hover:border-indigo-700 py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"style={{position: 'absolute', bottom: '10px', right : '10px'}} onClick={(e)=>{
        if(limitation > 0 ) sendRequest(textareaValue)
        else {
          console.log('ddd')
          notify()
        }
      }}>
        Submit <i className="fa-solid fa-arrow-right"></i>
      </div>
    </div>
     
     
     : <></>
     }

    {/* <NoticeElement type={alertOneType} content={alertOneContent} />
    <NoticeElement type={alertTwoType} content={alertTwoContent} />
    <NoticeElement type={alertThreeType} content={alertThreeContent} /> */}
 { chat == true ?
 <div style={{position : 'relative'}}>
  <div style={{position: 'absolute', left: '50%', top: '30%', transform: 'translate(-50%, 0%)'}}>
 {loading == true ? <><Loading /> Waiting for response</> : <></>}
 </div>
<textarea rows={6} className="focus:outline-none w-full my-4 bg-gray-100 filter_input" style="caret-color: transparent; color: transparent;" placeholder={loading ? "" : "Enter your request above and your answer will appear here"} style = {{whiteSpace: 'pre-line'}} value={response}>
   
    {
      error == '' ? (response == '' ? `Here will be your response` : response) : error 
    }
</textarea>
</div>
: <></>
}




  </div>)
};

export default HealthScoreCard;

