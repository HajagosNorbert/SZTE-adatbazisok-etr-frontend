import { useEffect, useState } from "react";
import { serverUrl } from "../../consts"

import ReactSelect from "react-select";
import { alertIfErrorsExist } from "../../helpers/helpers";
import { useAlert } from 'react-alert'


function FetchedSelecet({ selectedOption, afterOptionSelect1, afterOptionSelect2, endpoint, mapperToOptionsFormat, kod, ...props }) {
  const alert = useAlert()

  const [options, setOptions] = useState([])

  useEffect(() => {
    async function updateOptions() {
      try {
        const res = await fetch(`${serverUrl}/${endpoint}`);
        await alertIfErrorsExist(res, alert);
        const entities = await res.json();
        const newOptions = entities.map(mapperToOptionsFormat)
        setOptions(newOptions)
      } catch (e) {
        console.log(e)
      }
    }

    updateOptions()
  }, [alert, endpoint, mapperToOptionsFormat])

  return (
    <ReactSelect
      options={options}
      value={selectedOption}
      onChange={async (newOption) => {
        afterOptionSelect1()
        console.log({ newOption })
        afterOptionSelect2(kod, { oktato_kod: newOption.value })
      }}
      {...props}
    />)
}

export default FetchedSelecet