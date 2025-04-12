import logo from './logo.svg';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import './style/changchang.css'
import axios from 'axios';

function App() {
  // 추천 부동산 변수
  const [estate, setEstate] = useState({});
  // 사용자의 입력 질문
  const [question, setQuestion] = useState("");
  // 벡엔드에게 받은 응답
  const [answer, setAnswer] = useState('');
  // 메세지 저장 할 배열
  const [messages, setMessages] = useState([]);
  
  const [DF, setDF] = useState('');
  const [flag, setFlag] = useState(false);
  const [payRef, setpayRef] = useState('');
  const [dongRef, setdongRef] = useState('');


  //세션값 고정
  const [sessionId] = useState(() => {
    //localStorage => 값을 저장해줌
    const saved = localStorage.getItem('sessionId');
    if (saved) return saved;
    // 임의로 아이디 만들어서 고정
    const randomId = Math.random().toString(36).substring(7);
    localStorage.setItem('sessionId', randomId)
    return randomId;
  })


  // 스프링이랑 이을거거
  //   function tryLogin(){

  //     axios.get(
  //         'http://localhost:8085/controller/login',
  //     // get방식으로 데이터를 보낼때는 params 라는 키값으로 묶어서 보낼것
  //        { params : {id:id, 
  //         pw:pw}}
  //     )
  //     .then((res)=>{
  //         console.log(res)
  //     })
  //     // axios.post(
  //     //     'http://localhost:8084/controller/login',
  //     //     {id:id, 
  //     //     pw:pw}
  //     // )
  //     // .then((res)=>{
  //     //     console.log(res)
  //     // })
  // }
  //백에서 받아올 데이터 테스트


  //대화창창
  function SendQuestion() {
    //아마 바뀔듯??
    console.log("보낼 질문:", question);

    // 질문 저장
    const userMessage = { sender: "user", text: question };
    // ...prev는 자바 언어로 여태 썻던거 복사해서 보여주는거거
    setMessages((prev) => [...prev, userMessage]);



    // 내 질문 빽으로 보내기기
    fetch("http://localhost:3002/api/chat", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: question, sessionId: sessionId })
    }).then((res) => res.json())
      .then((data) => {
        console.log("Dialogflow 응답 :", data);
        
        setDF(data);
        if (data.parameters?.fields?.dong?.stringValue){
          console.log("dongin")
          setdongRef(data.parameters?.fields?.dong?.stringValue);
        }
        
        if (data.parameters?.fields?.pay?.stringValue){
          console.log("payin")

          setpayRef(data.parameters?.fields?.pay?.stringValue);
        }

        setAnswer(data.answer)

        
        //챗봇꺼도 저장
        const botMessage = { sender: "chang", text: data.answer };
        setMessages((prev) => [...prev, botMessage])
      }).catch((err) => console.log("에러발생", err))
    setFlag("true");
    //질문 초기화

  }


  useEffect(() => {
    console.log(flag)
    console.log(payRef)
    console.log(dongRef)

    if (flag && payRef && dongRef){
      console.log("in", question)
      axios.get(
        'http://localhost:8085/controller/test',
        // get방식으로 데이터를 보낼때는 params 라는 키값으로 묶어서 보낼것
        {
          params: {
            question: question,
            dong: dongRef,
            pay: payRef
          }
        }
      )
      .then((res) => {
        console.log("스프링응답", res.data)
      })
      // 질문보내는거 붙이기기 잘못되면 지무면됨
      
    }
    //setQuestion("");

  }, [DF])

  // 백에서 받은 데이터를 프론트에 출력 도전



  useEffect(() => {
    // 백엔드에서 정보테이블 전체를 가져오는 api 넣어둠
    fetch("http://localhost:3002/api/estate-info")
      .then((res) => res.json())
      .then((data) => {
        console.log("추천 부동산:", data);
        setEstate(data);
      }).catch((err) => console.error("에러발생", err))

  }, []);



  return (




    <div className='chat'>
      {/* 메세지 리스트 */}
      <div className="chatArea">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === 'user' ? 'userMessage' : 'botMessage'}>
            {msg.sender === 'user' ? '나: ' : '창창이: '}
            {msg.text}
          </div>
        ))}
      </div>

      {/*입력창 */}
      <div className='inputChat'>
        <input type='text'
          placeholder='할 말 입력'
          // question 이라는 변수에 질문 담아주기기
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={SendQuestion}>입력</button>
      </div>


    </div>



  );
}

export default App;
