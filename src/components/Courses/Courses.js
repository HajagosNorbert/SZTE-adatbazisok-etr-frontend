import { useCallback, useEffect, useState } from "react";
import { serverUrl } from "../../consts"
import OnOffSwitch from "../OnOffSwitch/OnOffSwitch";
import styles from "./Courses.module.css"
import { useAlert } from 'react-alert'
import { alertIfErrorsExist } from "../../helpers/helpers";
import FetchedSelecetForInstructors from "../FetchedSelect/FetchSelectForInstructors";
import FetchedSelecet from "../FetchedSelect/FetchSelect";

const buildingToBuildingOption = building => ({ value: building.kod, label: `${building.kod} | ${building.nev}` })
const classroomToClassroomOption = classroom => ({ value: classroom.kod, label: `${classroom.kod}, ${classroom.epulet_kod}` })
const instructorToInstructorOption = instructor => ({ value: instructor.kod, label: `${instructor.vezeteknev} ${instructor.keresztnev} - ${instructor.kod}` })



function Courses() {
    const [courses, setCourses] = useState([])
    const [newName, setNewName] = useState('');
    const [newMaxStudents, setNewMaxStudents] = useState('');
    const [isEditable, setIsEditable] = useState(false)
    const [mostExperiencedInstructor, setMostExperiencedInstructor] = useState(false)

    const [selectedBuildingOption, setSelectedBuildingOption] = useState(null)
    const [selectedClassroomOption, setSelectedClassroomOption] = useState(null)
    const [selectedInstructorOption, setSelectedInstructorOption] = useState(null)

    const alert = useAlert()


    const updateCourses = useCallback(async function () {
        const endpoint = mostExperiencedInstructor ? '/course/mostexperienced' : '/course'
        try {
            const res = await fetch(serverUrl + endpoint);
            await alertIfErrorsExist(res, alert);
            const rawCourses = await res.json();

            const coursesWithInstructorOptions = await Promise.all(
                rawCourses.map(async (course) => {
                    if (!course.oktato_kod) {
                        course.instructorOption = null
                        return course
                    }
                    const res = await fetch(serverUrl + '/instructor/' + course.oktato_kod)
                    const instructor = await res.json()
                    console.log({ instructor })
                    course.instructorOption = {
                        value: instructor.oktato_kod,
                        label: `${instructor.vezeteknev} ${instructor.keresztnev}`
                    }
                    return course
                })
            )

            // const coursesWithStudents = await Promise.all(
            //     coursesWithInstructor.map(async (course) => {
            //         const res = await fetch(serverUrl + '/instructor/' + course.oktato_kod)
            //         const { oktato_kod, ...instructor } = await res.json()
            //         delete course.oktato_kod
            //         course.oktato = instructor
            //         return course
            //     })
            // )



            console.log({ coursesWithInstructorOptions })

            setCourses(coursesWithInstructorOptions)
        } catch (e) {
            console.log(e)
        }
    }, [alert, setCourses, mostExperiencedInstructor])

    useEffect(() => {
        updateCourses();
    }, [updateCourses])



    function createNewCourseBody() {
        return {
            nev: newName,
            max_letszam: newMaxStudents || undefined,
            oktato_kod: selectedInstructorOption?.value,
            epulet_kod: selectedBuildingOption?.value,
            terem_kod: selectedClassroomOption?.value
        }
    }

    async function handleDeleteCourseButtonClick(id) {
        const delOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            const res = await fetch(serverUrl + '/course/' + id, delOptions)
            await alertIfErrorsExist(res, alert);
            updateCourses();
        } catch (error) {
            console.error(error);
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
            console.table({ newCourseBody: createNewCourseBody() })
            const res = await fetch(serverUrl + '/course', postOptions)
            await alertIfErrorsExist(res, alert);
            updateCourses()
        } catch (error) {
            console.error(error);
        }
    }

    function onFieldUpdate(id, fields) {
        const index = courses.findIndex(course => course.kod === id);
        setCourses([
            ...courses.slice(0, index),
            Object.assign({}, courses[index], fields),
            ...courses.slice(index + 1)
        ]);
    }
    //TODO: a nemtriviális lekérdezés mutatkozzon meg a weboldalon

    const updateFieldsInDB = useCallback(async function (id, fields) {
        const updateOptions = {
            method: 'PATCH',
            body: JSON.stringify(fields),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            const res = await fetch(serverUrl + '/course/' + id, updateOptions)
            await alertIfErrorsExist(res, alert);
            updateCourses();
        } catch (error) {
            console.error(error);
        }
    }, [updateCourses, alert])

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
            <div className={styles.controllWrapper} >
                <p className={styles.inline}>
                    Mutasd csak a legtapasztaltabb előadó kurzusait:
                </p>
                <div className={styles.inline}>
                    <input
                        type="checkbox"
                        checked={mostExperiencedInstructor}
                        onChange={() => setMostExperiencedInstructor(!mostExperiencedInstructor)}
                    />
                </div>
            </div>
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

                            const nevInput = <input
                                type="text"
                                value={course.nev}
                                onChange={(event) => onFieldUpdate(course.kod, { nev: event.target.value })}
                                onBlur={(event) => updateFieldsInDB(course.kod, { nev: event.target.value })}
                            />

                            const oktatoSelect = <FetchedSelecetForInstructors
                                selectedOption={course.instructorOption}
                                afterOptionSelect1={updateCourses}
                                afterOptionSelect2={updateFieldsInDB}
                                endpoint={`instructor`}
                                kod={course.kod}
                                mapperToOptionsFormat={instructorToInstructorOption}
                                placeholder='Oktató'
                            />

                            return (
                                <div key={i} className={styles.userBox} >
                                    {(!isEditable)
                                        ? <>
                                            <div> {course.nev}</div>
                                            <div>Oktató: {course?.instructorOption?.label ?? 'Nincs'}</div>
                                            <div>Hallgatók száma:  {course.letszam}</div>
                                        </>
                                        : <>
                                            <div>{nevInput}</div>
                                            <div>{oktatoSelect}</div>
                                            <div>Hallgatók száma:  {course.letszam}</div>
                                        </>
                                    }
                                    {isEditable &&
                                        <button className={styles.delete}
                                            onClick={() => handleDeleteCourseButtonClick(course.kod)}
                                        >Törlés</button>}


                                </div>
                            )
                        })
                    }
                </div>

            </div>

        </div >)
}



export default Courses;
