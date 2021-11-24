import { useCallback, useEffect, useState } from "react";
import { serverUrl } from "../consts"
import OnOffSwitch from "./OnOffSwitch";
import styles from "./Users.module.css"

const Users = function () {
    const [users, setUsers] = useState([])
    const [showStudents, setShowStudents] = useState(true);
    const [showInstructors, setShowInstructors] = useState(true);
    const [newFirstname, setNewFirstname] = useState('');
    const [newLastname, setNewLastname] = useState('');
    const [newStartedTeachingOn, setNewStartedTeachingOn] = useState();
    const [newSemesterCount, setNewSemesterCount] = useState();
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
            vezeteknev: newLastname,
        }
        if (showInstructors)
            body.tanitast_kezdte = newStartedTeachingOn

        if (showStudents)
            body.szemeszterek = newSemesterCount

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

    async function handleCreatUserButtonClick() {
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

    const newUserButtonText = (showStudents && showInstructors) ?
        'Új PHD felvétele' :
        (showStudents) ? 'Új Hallgató felvétele' :
            'Új Oktató felvétele'
    const newUserButton = <button onClick={handleCreatUserButtonClick}>{newUserButtonText}</button>;

    return (
        <>
            <div>
                <input
                    type="checkbox"
                    checked={showStudents}
                    onChange={() => setShowStudents(!showStudents)}
                />
                Hallgatók
            </div>

            <div>
                <input
                    type="checkbox"
                    checked={showInstructors}
                    onChange={() => setShowInstructors(!showInstructors)}
                />
                Oktatók
            </div>
            Keresztnév
            <input
                value={newFirstname}
                onChange={(event) => setNewFirstname(event.target.value)}
            />
            <br />
            Vezetéknév
            <input
                value={newLastname}
                onChange={(event) => setNewLastname(event.target.value)}
            />
            <br />
            {showInstructors &&
                <div>
                    Tanítást kezdte:
                    <input
                        type="date"
                        value={newStartedTeachingOn}
                        onChange={(event) => setNewStartedTeachingOn(event.target.value)}
                    />
                </div>
            }
            {showStudents &&
                <div>
                    Hanyadik szemesztere:
                    <input
                        type="number"
                        value={newSemesterCount}
                        onChange={(event) => setNewSemesterCount(event.target.value)}
                    />
                </div>
            }
            {(showInstructors || showStudents) &&
                <div>{newUserButton}
                    <div> Módosítás
                        <OnOffSwitch checkedText="Be" notCheckedText="Ki" setIsChecked={setIsEditable} isChecked={isEditable} />
                    </div>
                    {(isEditable && showStudents) && <button onClick={() => handleNewSemesterButtonClick()}>Új tanév</button>}
                    <div className={`${styles.grid}`}>
                        {
                            users.map((user, i) => {
                                const userType = (user.hallgato_kod && user.oktato_kod) ? 'PHD' : (user.hallgato_kod) ? 'hallgató' : 'oktató'
                                const tanitast_kezdteElement = (!user.oktato_kod) ? null : <div> {user.tanitast_kezdte} óta tanít</div>;
                                const szemeszterekElement = (!user.hallgato_kod) ? null : <div> {user.szemeszterek}. szemeszter</div>;

                                //TODO amikor újrarendereljük a usereket, akkor a default value nem updatelődik, ami baj
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
                                    <div className={styles.userBox}>
                                        {(!isEditable)
                                            ? <div> {user.vezeteknev} {user.keresztnev}</div>
                                            : <> {vezeteknevInput} {keresztnevInput} </>
                                        }
                                        <div> Kod: {user.kod} </div>
                                        <div> {userType} felhasználó</div>
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
        </>
    )
}



export default Users;
