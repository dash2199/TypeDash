import React from 'react'
import { useState , useEffect} from "react";
import './App.css';
import randomWords from 'random-words';

const N = 300;
const DURATION = 65;
const START_IN = 5;
let f = 0;

const Main = ({socket , username , room}) => {
    const [users , setUsers] = useState([]);
    const [count , setCount] = useState(0);
    const [words , setWords] = useState([]);
    const [countdown , setCountdown] = useState(DURATION);
    const [countdown2 , setCountdown2] = useState(START_IN);
    const [flag , setFlag] = useState(0);
    const [flag2 , setFlag2] = useState(0);
    const [ready , setReady] = useState(0);
    const [curInput , setInput] = useState("");
    const [curIdx , setIdx] = useState(0);
    const [charIdx , setCharIdx] = useState(-1);
    const [curChar , setChar] = useState("");
    const [correct , setCorrect] = useState(0);
    const [wrong , setWrong] = useState(0);
    const [res , setRes] = useState([]);
    const [clicked , setClicked] = useState(0);
    const [change , setChange] = useState(1);

    const gen = () => {
        return new Array(N).fill(null).map(() => randomWords());
    }

    if(change){
        socket.emit("words", {words: gen() , id: room});
        setChange(0);
    }

    useEffect(() => {
        socket.on("get_cnt" , (data) => {
            setCount(data);
        })

        console.log("enter");
    
        socket.on("words" , (data) => {
            setWords(data);
        })

        socket.on("new_users", (data) =>{
            setUsers(data);
        })
        
        socket.on("start_info" , (data) =>{
            setReady(data.c);
            setFlag(data.flag);
        })

        socket.on("timer" , (data) => {
            setCountdown((data) => data - 1);
        })
        
        socket.on("timer" , (data) => {
            setCountdown2((data) => data - 1);
        })

        socket.on("result" , (data) =>{
            setRes(data);
        })

        socket.on("rest" , (data) =>{
            setFlag(data);
        })
    } ,[]);
    
    

    const start = (cur_time) => {
        let interval = setInterval(() => {
            if(f === 1){
                clearInterval(interval);
            }else{
                socket.emit("timer" , {id: room , time: cur_time});
            }
        } , 1000);
    }

    const handleStart = () => {
        console.log(ready);
        setClicked(1);
        socket.emit("start_info" , {flag : (ready === count - 1 ? 1 : 0) , c : ready + 1 , id : room});
        if(ready === count - 1){
            start(START_IN);
        }
    }

    const handleKeyDown = ({keyCode , key}) => {
        if(keyCode === 32){
            check();
            setInput("");
            setIdx(curIdx + 1);
            setCharIdx(-1);
            setChar(key);
        }else if(keyCode === 8){
            setCharIdx(charIdx - 1);
            setChar("");
        }
        else{
            setCharIdx(charIdx + 1);
            setChar(key);
        }
    }

    const check = () => {
        const st = words[curIdx];
        const same = st === curInput.trim();
        console.log("same ? :", {same});
        if(same){
            setCorrect(correct + 1);
        }else{
            setWrong(wrong + 1);
        }
    }

    const getClass = (wrdIdx , chIdx , cch) => {
        if(curIdx === wrdIdx && chIdx === charIdx && cch){
            if(cch === curChar){
                return 'char-color-correct';
            }else{
                return 'char-color-wrong';
            }
        }else if(wrdIdx === curIdx && chIdx >= words[curIdx].length){
            return 'char-color-wrong';
        }
        else{
            return "";
        }
    }

    const handleRestart = () =>{
        setChange(1);
        setCountdown(DURATION);
        setCountdown2(START_IN);
        setReady(0);
        setCorrect(0);
        setWrong(0);
        setIdx(0);
        setInput("");
        setCharIdx(-1);
        setRes([]);
        setClicked(0);
        socket.emit("rest" , {id : room , fl : 0});
        f = 0;
    }

    if(countdown === 0){
        if(f === 0){
            console.log("HERE" , DURATION);
            socket.emit("result", {correct: correct , wrong : wrong , id: room , user: username});
        }
        f = 1;
        start(DURATION);
    }

    const cmp = (a , b) =>{
        if(a !== null && b != null){
            return b.correct - a.correct;
        }
    }

    var tmp = res.slice(0);
    tmp.sort(cmp);

    console.log("flag : ", flag);
    return (
        <>
        <div className='header'><h1>TypeDash</h1></div>
        <div className = "main-container">
            <div className= "left-col">
                <div className= "top">
                    <div className='list'>
                        <div className='right-header'>
                            <h2 className='head'>Users ({count})</h2>
                            <h2 className='head2'>Room Code : {room}</h2>
                        </div>
                        
                        <table className='table'>
                            {users.map((name , idx) => (
                                <tr key = {idx}><li>{name}</li></tr>
                            ))}
                        </table>
                        
                    </div>
                </div>
                <div className= "bot">
                    <h2 className='head'>Chat</h2>
                </div>
            </div>
            
            <div className= "right-col">
                {countdown2 > 0 ? <span></span> 
                :
                    <div className= "timer">
                        <h2>{countdown}</h2>
                    </div>
                }
                {countdown === 0 ? 
                <div className='results'> 
                    <div className='wpm'>Words per minute : {correct}</div>
                    {/* <div className='acc'>Accuracy : {Math.round(correct/(correct + wrong)) * 100} %</div> */}
                    
                    <div className='standings'>
                    <table className='res-table'> 
                        <tr className = 'rows'>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>WPM</th>
                            {/* <th>Accuracy</th> */}
                        </tr>
                        {tmp.map((it , idx) =>(
                            (it === null ? 0 : 
                            <tr key = {idx} className = 'rows'>
                                <td>{idx + 1}</td>
                                <td>{it.user}</td>
                                <td>{it.correct}</td>
                                {/* <td>{Math.round(it.correct/(it.correct + it.wrong)) * 100} %</td> */}
                            </tr>
                            )
                        ))}
                    </table>
                    </div>
                    <div className='restart'><button className='restart-btn' onClick = {handleRestart}>Restart</button></div>
                </div>
                : !flag ? 
                    <div className='container2'>
                        <h2 className='headr'>{ready} / {count} Ready!</h2>
                        <div className = "start-cont">
                                <button className = {clicked ? "rdy-btn2" : "rdy-btn"} onClick={handleStart} disabled = {clicked}>Ready</button>
                        </div>
                    </div>      
                    :
                        countdown2 > 0 ? <div className='match-cnt'>Match Starting in {countdown2}...</div> 
                        :
                        <>
                            <div className='wordsplace'>
                                <div className='content'>
                                    <div className='content2'>
                                        {words.map((val , idx) => (
                                            <span key = {idx}>
                                                <span>
                                                {val.split("").map((ch , idx2)=> (
                                                    <span className={getClass(idx , idx2 , ch)}>{ch}</span>
                                                ))}
                                                </span>
                                                <span> </span>
                                            </span>
                                            
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className='text-area'>
                                <input type = "text" className='input' onKeyDown={handleKeyDown} value = {curInput} onChange = {(e) => setInput(e.target.value)} autoFocus></input>
                            </div>
                        </>
                    }
                
            </div>
        </div>
    </>
    )
}

export default Main