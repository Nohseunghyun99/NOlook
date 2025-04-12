const express = require("express"); 
// express 는 백엔드 서버를 쉽게 만들 수 있는 Node.js용 도구구
// express가 우리 코드에 쓸 수 있게 불러오는 코드
const cors = require("cors");
// 백,프론트를 연결해주는 코드
const mysql = require("mysql2");
// MySQL이랑 데이터 베이스랑 연결하는 도구

// 다이얼로그플로우 불러오기기
//const dialogflow = require('@google-cloud/dialogflow')
// 세션값 넣어서 하기{안돼면 밑에꺼 지우고 위에 주석풀어}
const {SessionsClient} = require('@google-cloud/dialogflow')
// 보내는 식별자 구분하는거
const uuid = require('uuid')



// 백엔드 서버를 3002번으로 설정해 두었음
const app = express();
const port = 3002;

// cors 이어주기
app.use(cors());

// json 데이터 파싱 허용(프론트에서 입력된 값을 읽을 수 있게 해주는것것)
app.use(express.json());


// MySQL 연결
const conn_sql= mysql.createConnection({
    host : "project-db-cgi.smhrd.com",
    port: 3307,
    user:"kame",
    password:"3927",
    database:"kame"
});
// 연결성공 (확인차 콘솔에 찍어본거)
// conn_sql.connect((err=> {
//     if(err){
//         console.log("연결실패",err);
//     }else{
//     console.log("db연결성공")}
// }))

// 백엔드 서버도 연결됨됨
app.listen(port,()=>{
    console.log(`${port} 연결 성공`)
})

// 부동산 정보"테이블에서 전체 데이터를 가져오는 api
app.get("/api/estate-info", (req, res)=>{
    const sql = "SELECT * FROM TB_REAL_ESTATE";
    //에러뜨는지 확인하는것
    conn_sql.query(sql, (err,result)=>{
        if(err){
            console.error("쿼리오류뜸", err)
            res.status(500).send("서버 맛탱시감")
        }else{
            res.json(result);
        }
    })

})

// 여기부터는 오류 다시 확인 해봐야하고 다시 질문해봐야함
app.post("/api/chat",async(req, res)=> {

    const {message, sessionId} = req.body;
    //밑에 친구가 세 새션을 만든다고 하네??
   // const sessionId = uuid.v4();
   //원래는 이거였는데 dialogflow를 주석처리하고 새로만들어서 고침
   // const sessionClient = new dialogflow.SessionsClient({
    const sessionClient = new SessionsClient({
        keyFilename: './f--tvdm-99cfc39455c5.json'
    });
    const sessionPath = sessionClient.projectAgentSessionPath('f--tvdm', sessionId);

    const request = {
        session: sessionPath,
        queryInput:{
            text: {
                text:message,
                languageCode: 'ko',
            },
        },

    };
    try{
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    res.json({answer: result.fulfillmentText,
        parameters: result.parameters // 파라미터 값도 가져오기
    });
    }catch (error) {
        console.error("Dialogflow 호출 오류:", error);
        res.status(500).json({ error: "Dialogflow 호출 실패" });
    }
}); 