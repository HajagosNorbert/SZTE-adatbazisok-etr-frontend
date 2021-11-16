import { useCallback, useEffect, useState } from "react";
import { serverUrl } from "./consts"

const Users = function () {
    const [users, setUsers] = useState([])
    const [showStudents, setShowStudents] = useState(true);
    const [showInstructors, setShowInstructors] = useState(true);
    const [newFirstname, setNewFirstname] = useState('');
    const [newLastname, setNewLastname] = useState('');
    const [newStartedTeachingOn, setNewStartedTeachingOn] = useState(new Date().toISOString().split('T')[0]);
    const [newSemesterCount, setNewSemesterCount] = useState(1);

    const fetchUsers = useCallback(async function () {
        if (!(showStudents || showInstructors)) {
            return setUsers([])
        }
        try {
            const res = await fetch(serverUrl + '/instructorOrStudent');
            const users = await res.json();
            const filteredUsers = users.filter(user => {
                if (user.hallgato_kod && user.oktato_kod) return true
                if (!showStudents && user.hallgato_kod) return false
                if (!showInstructors && user.oktato_kod) return false
                return true
            })
            setUsers(filteredUsers)
            console.log({ filteredUsers })
        } catch (e) {
            console.log(e)
        }
    }, [showStudents, showInstructors]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers])

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
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    }


    const newUserButtonText = (showStudents && showInstructors) ?
        'Új Hallgató&Oktató felhsználó' :
        (showStudents) ? 'Új Hallgató' :
            'Új Oktató'
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
            {(showInstructors || showStudents) && newUserButton}
            <ul>
                {
                    users.map((user, i) => {
                        const userType = (user.hallgato_kod && user.oktato_kod) ? 'hallgató és oktató' : (user.hallgato_kod) ? 'hallgató' : 'oktató'
                        return (
                            <li key={i}> Kod: {user.kod} , {user.vezeteknev} {user.keresztnev} , {userType}</li>
                        )
                    })
                }
            </ul>
        </>
    )
}



export default Users;
