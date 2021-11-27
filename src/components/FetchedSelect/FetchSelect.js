import { useEffect, useState } from "react";
import { serverUrl } from "../../consts"

import ReactSelect from "react-select";
import { alertIfErrorsExist } from "../../helpers/helpers";
import { useAlert } from 'react-alert'


function FetchedSelecet({ selectedOption, setSelectedOption, endpoint, mapperToOptionsFormat, ...props }) {
  const alert = useAlert()

  const [options, setOptions] = useState([])

  useEffect(() => {
    async function updateOptions() {
      try {
        const res = await fetch(`${serverUrl}/${endpoint}`);
        await alertIfErrorsExist(res, alert);
        const entities = await res.json();
        setOptions(entities.map(mapperToOptionsFormat))
        setSelectedOption(null)
      } catch (e) {
        console.log(e)
      }
    }

    updateOptions()
  }, [alert, endpoint, mapperToOptionsFormat, setSelectedOption])

  return (
    <ReactSelect
      options={options}
      value={selectedOption}
      onChange={(newOption) => setSelectedOption(newOption)}
      {...props}
    />)
}

export default FetchedSelecet