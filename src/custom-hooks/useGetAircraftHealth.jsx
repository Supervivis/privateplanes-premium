import axios from "axios";

import apiService from '../services/api.js'
import React, {useState, useEffect, useRef} from "react"

const useGetAircraftHealth = ({serialNumber}) => {
  const [health , setHealth] = useState({'health_score':50, 'transaction_score':50,'hours_score':50, 'accident_score' : 50})
  const ref = useRef(0);

  useEffect(()=>{
    console.log("trigger " + serialNumber)
    if(ref.current == 0 && serialNumber && serialNumber != ""){
     ref.current += 1
      apiService.getAIAircraftHealth(`serial_number=${serialNumber}`).then(response=>{
        if(response.data.health_score !== undefined){
            setHealth(response.data)
        }
      }).catch(error=>console.log('error while loading industry health', error))
    }
  } , [ref, serialNumber])

  return health
};
export default useGetAircraftHealth;
