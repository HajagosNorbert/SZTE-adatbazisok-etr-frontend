import { useState } from "react";
import { serverUrl } from "../../consts"
import OnOffSwitch from "../OnOffSwitch/OnOffSwitch";
import styles from "./Courses.module.css"
import { useAlert } from 'react-alert'
import mockdb from "../../mockdb";
import { alertIfErrorsExist } from "../../helpers/helpers";
import FetchedSelecet from "../FetchedSelect/FetchSelect";

const buildingToBuildingOption = building => ({ value: building.kod, label: `${building.kod} | ${building.nev}` })
const classroomToClassroomOption = classroom => ({ value: classroom.kod, label: `${classroom.kod}, ${classroom.epulet_kod}` })
const instructorToInstructorOption = instructor => ({ value: instructor.kod, label: `${instructor.vezeteknev} ${instructor.keresztnev} - ${instructor.kod}` })



function Courses() {
    const [courses, setCourses] = useState(mockdb)
    const [newName, setNewName] = useState('');
    const [newMaxStudents, setNewMaxStudents] = useState('');
    const [isEditable, setIsEditable] = useState(false)


    const [selectedBuildingOption, setSelectedBuildingOption] = useState(null)
    const [selectedClassroomOption, setSelectedClassroomOption] = useState(null)
    const [selectedInstructorOption, setSelectedInstructorOption] = useState(null)

    const alert = useAlert()

    function createNewCourseBody() {
        return {
            nev: newName,
            max_letszam: newMaxStudents || undefined,
            oktato_kod: selectedInstructorOption?.value,
            epulet_kod: selectedBuildingOption?.value,
            terem_kod: selectedClassroomOption?.value
        }
    }

    async function handleCreateCourseButtonClick() {
        const postOptions = {
            method: 'POST',
            body: JSON.stringify(createNewCourseBody()),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            console.log({ selectedClassroomOption })
            console.log({ selectedBuildingOption })
            console.table({ newCourseBody: createNewCourseBody() })
            const res = await fetch(serverUrl + '/course', postOptions)
            await alertIfErrorsExist(res, alert);
        } catch (error) {
            console.error(error);
        }
    }

    const nevInput =
        <div>
            Kurzus neve:
            <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
            />
        </div>
    const maxLetszamInput =
        <div>
            Max létszám:
            <input
                type="number"
                value={newMaxStudents}
                placeholder={30}
                onChange={(event) => setNewMaxStudents(event.target.value)}
            />
        </div>

    const instructorSelect = <FetchedSelecet
        selectedOption={selectedInstructorOption}
        setSelectedOption={setSelectedInstructorOption}
        endpoint='instructor'
        mapperToOptionsFormat={instructorToInstructorOption}
        placeholder='Oktató'
    />

    const buildingSelect = <FetchedSelecet
        selectedOption={selectedBuildingOption}
        setSelectedOption={setSelectedBuildingOption}
        endpoint='building'
        mapperToOptionsFormat={buildingToBuildingOption}
        placeholder='Épület'
    />

    const classroomSelect = <FetchedSelecet
        selectedOption={selectedClassroomOption}
        setSelectedOption={setSelectedClassroomOption}
        endpoint={`classroom/${selectedBuildingOption?.value}`}
        mapperToOptionsFormat={classroomToClassroomOption}
        placeholder='Terem'
    />

    const newCourseButton =
        <button onClick={handleCreateCourseButtonClick}>
            Új kurzus felvétele
        </button>

    return (
        <div >
            <div>
                <div className={styles.controllWrapper}>
                    <h4>Új kurzus</h4>
                    {nevInput}
                    {maxLetszamInput}
                    {instructorSelect}
                    {buildingSelect}
                    {selectedBuildingOption && classroomSelect}
                    {newCourseButton}
                </div>

                <div>
                    <div className={styles.controllWrapper}>
                        <div > Módosítás</div>
                        <div >
                            <OnOffSwitch checkedText="Be" notCheckedText="Ki" setIsChecked={setIsEditable} isChecked={isEditable} />
                        </div>
                    </div>
                    <h2>Kurzusok</h2>
                    <div className={`${styles.grid}`}>
                        {
                            courses.map((course, i) => {
                                return (
                                    <div key={i}>{course.nev}</div>
                                )
                            })
                        }
                    </div>

                </div>

            </div>
        </div >)
}



export default Courses;
