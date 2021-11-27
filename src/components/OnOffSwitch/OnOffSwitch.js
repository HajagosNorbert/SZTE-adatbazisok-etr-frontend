import styles from "./OnOffSwitch.module.css";

function OnOffSwitch({ isChecked, setIsChecked, checkedText, notCheckedText }) {

  return (
    <div id="toggle-btn">
      <input
        type="checkbox"

        id={styles.checkboxInput}
        onChange={() => setIsChecked(!isChecked)}
      />
      <label htmlFor={styles.checkboxInput} className={styles.roundSliderContainer}>
        <div>{checkedText}</div>
        <div>{notCheckedText}</div>
        <div className={styles.roundSlider}></div>
      </label>
    </div>
  )
}

export default OnOffSwitch