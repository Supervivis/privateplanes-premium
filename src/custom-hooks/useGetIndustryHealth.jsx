import axios from "axios";

import apiService from '../services/api.js'
import React, {useState, useEffect, useRef} from "react"

const useGetIndustryHealth = () => {
  const [health , setHealth] = useState({'health_score' : 50, 'stability_score' : 50, 'activity_score' : 50, 'future_score': 50})
  const ref = useRef(0);

  useEffect(()=>{
    if(ref.current == 0){
      ref.current += 1
      apiService.getAIIndustryHealth().then(response=>{

        if(response.data.health_score){
            setHealth(response.data)
        }
      }).catch(error=>console.log('error while loading industry health', error))
    }
  } , [ref])

  return health
};
export default useGetIndustryHealth;
