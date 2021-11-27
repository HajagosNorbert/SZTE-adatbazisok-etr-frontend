import { useCallback, useEffect, useState } from "react";
import { serverUrl } from "../../consts"

import ReactSelect from "react-select";
import { alertIfErrorsExist } from "../../helpers/helpers";
import { useAlert } from 'react-alert'


function FetchedSelecet({ selectedOption, setSelectedOption, endpoint, mapperToOptionsFormat, ...props }) {
  const alert = useAlert()

  const [options, setOptions] = useState([])


  const updateOptions = useCallback(async function () {
    try {
      const res = await fetch(`${serverUrl}/${endpoint}`);
      await alertIfErrorsExist(res, alert);
      const entities = await res.json();
      setOptions(entities.map(mapperToOptionsFormat))
      setSelectedOption(options[0])
    } catch (e) {
      console.log(e)
    }
  }, [])

  useEffect(() => {
    updateOptions()
  }, [updateOptions])

  return (
    <ReactSelect
      options={options}
      value={selectedOption}
      onChange={(newOption) => setSelectedOption(newOption)}
      {...props}
    />)
}

export default FetchedSelecet