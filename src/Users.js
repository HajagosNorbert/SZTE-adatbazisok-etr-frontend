import { useEffect, useState } from "react";
import { serverUrl } from "./consts"

const Users = function () {
    const [users, setUsers] = useState([])
    const [showStudents, setShowStudents] = useState(true);
    const [showInstructors, setShowInstructors] = useState(true);
    const [newFirstname, setNewFirstname] = useState('');
    const [newLastname, setNewLastname] = useState('');
    const [newStartedTeachingOn, setNewStartedTeachingOn] = useState(new Date().toISOString().split('T')[0]);
    const [newSemesterCount, setNewSemesterCount] = useState(1);

    useEffect(() => {
        async function fetchUsers() {
            if (!(showStudents || showInstructors)) {
                return setUsers([])
            }
            const endpoint = (showStudents && showInstructors) ? '/instructorOrStudent' : (showStudents) ? '/student' : '/instructor';
            try {
                const res = await fetch(serverUrl + endpoint);
                const users = await res.json();
                setUsers(users)
                console.log({ users })
            } catch (e) {
                console.log(e)
            }
        }
        fetchUsers();
    }, [showStudents, showInstructors])


    const postOptions = {
        method: 'POST',
        body: JSON.stringify({
            keresztnev: newFirstname,
            vezeteknev: newLastname,

        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const newUserButton = (showStudents && showInstructors) ?
        <button>Új Hallgató&Oktató felhsználó</button>
        : (showStudents) ? <button>Új Hallgató</button>
            : <button>Új Oktató</button>;

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
