import './App.css';
import io from 'socket.io-client';
import { useState } from "react";
import Main from './Main.js';

const socket = io.connect("http://localhost:3001");

function App() {
  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");
  const [flag, setFlag] = useState(false);
  const [cnt, setCnt] = useState(0);
  const [users , setUsers] = useState([]);

  const joinServer = () =>{
    if(user !== "" && room !== ""){
        socket.emit("join_room", {id: room , name: user});
        setFlag(!flag);
    }
  }

  return (
    <div className="App">
      {!flag ?
      (<div className = "Container">
        <div className='cont'>
        <h3>TypeDash</h3>
        <input type = "text" placeholder = "Username" onChange = {(e) => {setUser(e.target.value)}}></input>
        <input type = "text" placeholder = "Room Code" onChange = {(e) => {setRoom(e.target.value)}}></input>
        <button onClick = {joinServer}>Join Room</button></div>
      </div>)
      : (<Main socket = {socket} username = {user} room = {room} />)
      }
    </div>
  );
}

export default App;
