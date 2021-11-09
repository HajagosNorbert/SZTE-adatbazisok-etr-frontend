import { useState } from "react";

const db = [
    {nev: "Józsi"},
    {nev: "Panni"},
    {nev: "Bandi"},
];

const Users = function() {
    const [showStudents, setShowStudents] = useState(true);
    const [showInstructors, setShowInstructors] = useState(true);

    return (
        <>
        <input
            type="checkbox"
            checked={showStudents}
            onChange={ ()=> setShowStudents(!showStudents)}
        />
        <input
            type="checkbox"
            checked={showInstructors}
            onChange={ ()=> setShowInstructors(!showInstructors)}
        />

        <ul>
            {db.map( x => <li>{x.nev}</li>)}
        </ul>
        </>
    )
}



export default Users;
