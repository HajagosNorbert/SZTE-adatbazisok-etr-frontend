import { useCallback, useEffect, useState } from "react";
import { serverUrl } from "../../consts"
import OnOffSwitch from "../OnOffSwitch/OnOffSwitch";
import styles from "./Courses.module.css"

import ReactSelect from "react-select";

function determineUserType(hallgato_kod, oktato_kod) {
    const userType = {}
    if (hallgato_kod && oktato_kod) {
        userType.value = 3
        userType.label = 'PHD'
    } else if (hallgato_kod) {
        userType.value = 1
        userType.label = 'hallgató'
    } else {
        userType.value = 2
        userType.label = 'oktató'
    }
    return userType
}


function Courses() {
    const [users, setUsers] = useState([])
    const [showStudents, setShowStudents] = useState(true);
    const [showInstructors, setShowInstructors] = useState(true);
    const [newFirstname, setNewFirstname] = useState('');
    const [newName, setNewName] = useState('');
    const [newStartedTeachingOn, setNewStartedTeachingOn] = useState();
    const [newMaxStudents, setNewMaxStudents] = useState(30);
    const [isEditable, setIsEditable] = useState(false)

    const updateUsers = useCallback(async function () {
        if (!(showStudents || showInstructors)) {
            setIsEditable(false)
            return setUsers([])
        }
        try {
            const res = await fetch(serverUrl + '/instructorOrStudent');
            const users = await res.json();
            const filteredAndFormatedUsers = users.filter(user => {
                if (user.hallgato_kod && user.oktato_kod) return true
                if (!showStudents && user.hallgato_kod) return false
                if (!showInstructors && user.oktato_kod) return false
                return true
            }).map(user => {
                if (user.tanitast_kezdte) {
                    user.tanitast_kezdte = user.tanitast_kezdte.split('T')[0];
                }
                return user;
            })

            setUsers(filteredAndFormatedUsers)
            console.log({ filteredAndFormatedUsers })
        } catch (e) {
            console.log(e)
        }
    }, [showStudents, showInstructors]);

    useEffect(() => {
        updateUsers();
    }, [updateUsers])

    function createEndpointFromFilters() {
        return (showStudents && showInstructors) ? '/instructorOrStudent' : (showStudents) ? '/student' : '/instructor';
    }

    function createNewUserBodyFromFilters() {
        const body = {
            keresztnev: newFirstname,
            vezeteknev: newName,
        }
        if (showInstructors && newStartedTeachingOn)
            body.tanitast_kezdte = newStartedTeachingOn

        if (showStudents && newMaxStudents)
            body.szemeszterek = newMaxStudents

        return body;
    }

    async function handleNewSemesterButtonClick() {
        try {
            await fetch(serverUrl + '/student/newsemester');
            updateUsers();
        } catch (e) {
            console.log(e)
        }
    }

    async function handleCreateCourseButtonClick() {
        const postOptions = {
            method: 'POST',
            body: JSON.stringify(createNewUserBodyFromFilters()),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            await fetch(serverUrl + createEndpointFromFilters(), postOptions)
            updateUsers();
        } catch (error) {
            console.error(error);
        }
    }

    async function handleDeleteUserButtonClick(userId) {
        const delOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            await fetch(serverUrl + '/instructorOrStudent/' + userId, delOptions)
            updateUsers();
        } catch (error) {
            console.error(error);
        }
    }

    async function updateFieldsInDB(id, fields) {
        const updateOptions = {
            method: 'PATCH',
            body: JSON.stringify(fields),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            await fetch(serverUrl + '/user/' + id, updateOptions)
            updateUsers();
        } catch (error) {
            console.error(error);
        }
    }

    function onFieldUpdate(id, fields) {
        const index = users.findIndex(user => user.kod === id);
        setUsers([
            ...users.slice(0, index),
            Object.assign({}, users[index], fields),
            ...users.slice(index + 1)
        ]);
    }

    async function onUserTypeChange(id, userTypeOption) {
        const updateOptions = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            console.log(`${serverUrl}/instructorOrStudent/${id}/usertype/${userTypeOption.value}`)
            await fetch(`${serverUrl}/instructorOrStudent/${id}/usertype/${userTypeOption.value}`, updateOptions)
            console.log('IRÁN2')

            updateUsers();
        } catch (error) {
            console.error(error);
        }
    }

    const userTypeOptions = [
        { value: 1, label: 'hallgató' },
        { value: 2, label: 'oktató' },
        { value: 3, label: 'PHD' }
    ]

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
                onChange={(event) => setNewMaxStudents(event.target.value)}
            />
        </div>

    const newUserButton = <button onClick={handleCreateCourseButtonClick}>Új kurzus felvétele</button>;

    return (
        <div >
            <div>
                <div className={styles.controllWrapper}>
                    {nevInput}
                    {showStudents && maxLetszamInput}
                    {newUserButton}
                </div>
                {(showInstructors || showStudents) &&
                    <div>
                        <div className={styles.controllWrapper}>
                            <div>
                                <div > Módosítás</div>

                                <div >
                                    <OnOffSwitch checkedText="Be" notCheckedText="Ki" setIsChecked={setIsEditable} isChecked={isEditable} />
                                </div>
                            </div>
                            {(isEditable && showStudents) &&
                                <button onClick={() => handleNewSemesterButtonClick()}>Új tanév</button>
                            }
                        </div>
                        <h2>Felhasználók</h2>
                        <div className={`${styles.grid}`}>
                            {
                                users.map((user, i) => {
                                    const userType = determineUserType(user.hallgato_kod, user.oktato_kod)

                                    const tanitast_kezdteElement = (!user.oktato_kod) ? null : <div> {user.tanitast_kezdte} óta tanít</div>;
                                    const szemeszterekElement = (!user.hallgato_kod) ? null : <div> {user.szemeszterek}. szemeszter</div>;

                                    const userTypeSelect = <ReactSelect
                                        options={userTypeOptions}
                                        value={userType}
                                        onChange={(userTypeOption) => onUserTypeChange(user.kod, userTypeOption)}
                                    />
                                    const keresztnevInput = <input
                                        type="text"
                                        value={user.keresztnev}
                                        onChange={(event) => onFieldUpdate(user.kod, { keresztnev: event.target.value })}
                                        onBlur={(event) => updateFieldsInDB(user.kod, { keresztnev: event.target.value })}
                                    />
                                    const vezeteknevInput = <input
                                        type="text"
                                        value={user.vezeteknev}
                                        onChange={(event) => onFieldUpdate(user.kod, { vezeteknev: event.target.value })}
                                        onBlur={(event) => updateFieldsInDB(user.kod, { vezeteknev: event.target.value })}
                                    />

                                    return (
                                        <div key={i} className={styles.userBox}>
                                            {(!isEditable)
                                                ? <div> {user.vezeteknev} {user.keresztnev}</div>
                                                : <> {vezeteknevInput} {keresztnevInput} </>
                                            }
                                            <div> Kod: {user.kod} </div>
                                            {(!isEditable)
                                                ? <div> {userType.label} felhasználó</div>
                                                : userTypeSelect
                                            }

                                            {szemeszterekElement}
                                            {tanitast_kezdteElement}
                                            {isEditable &&
                                                <button className={styles.delete}
                                                    onClick={() => handleDeleteUserButtonClick(user.kod)}
                                                >Törlés</button>}

                                        </div>
                                    )
                                })
                            }
                        </div>

                    </div>
                }
            </div>
        </div >)
}



export default Courses;
