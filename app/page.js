'use client'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from "react";
export default function Home() {

  const [Chat, SetChat] = useState([])

  useEffect(() => {
    if (localStorage.getItem('storedChat') == null) {
      SetChat([])
    } else {
      const data = localStorage.getItem('storedChat');
      SetChat(JSON.parse(data))
    }
  }, [])

  const [userInput, setuserInput] = useState("")
  const [Loading, setLoading] = useState(false)

  const genAI = new GoogleGenerativeAI("AIzaSyALFwQ3discr7RwslxPhqEmLMatniBWVU8");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are an AI assistant developed by Team Tech Shock to help people extract text from image , pdf or etc files and search to make their task easy ",
  });

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleSendMessage = async () => {
    let tempchat = Chat
    tempchat.push({ "from": "user", "content": userInput, "id": uuidv4(), "tag": "div" })
    SetChat(tempchat)
    setLoading(true)
    const result = await model.generateContent(userInput);
    setuserInput("")
    let checkStar = new Promise((resolve, reject) => {
      for (let i of result.response.text()) {
        if (i == "*") {
          resolve(true)
        }
      }
      resolve(false)
    })
    checkStar.then(e => {
      tempchat = Chat
      if (e) {
        tempchat.push({ "from": "AI", "content": result.response.text().replaceAll("*", ""), "id": uuidv4(), "tag": "pre" })
        SetChat(tempchat)
        localStorage.setItem('storedChat', JSON.stringify(Chat));
      } else {
        tempchat.push({ "from": "AI", "content": result.response.text(), "id": uuidv4(), "tag": "div" })
        SetChat(tempchat)
        localStorage.setItem('storedChat', JSON.stringify(Chat));
      }
    })
    setLoading(false)
  }

  const HandleDelete = (e) => {
    let concent = confirm("Do you reeally want to delete that part of the conversation ?")
    if (concent) {
      const tempChat = Chat
      let newChat = tempChat.filter((item) => item.id != e.target.getAttribute('data-id'))
      newChat = newChat.filter((item) => item.id != e.target.parentNode.nextElementSibling.firstChild.firstChild.getAttribute('data-id'))
      SetChat(newChat)
      localStorage.setItem('storedChat', JSON.stringify(newChat));
    }
  }

  return (
    <>
      <div className="h-14 w-[98vw] my-4 mx-auto flex items-center justify-evenly">
        <img src="logo.png" className="h-12 w-12 rounded-full" />
        <div className="messageBox">
          <div className="fileUploadWrapper">
            <label htmlFor="file">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 337 337">
                <circle
                  strokeWidth="20"
                  stroke="#6c6c6c"
                  fill="none"
                  r="158.5"
                  cy="168.5"
                  cx="168.5"
                ></circle>
                <path
                  strokeLinecap="round"
                  strokeWidth="25"
                  stroke="#6c6c6c"
                  d="M167.759 79V259"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeWidth="25"
                  stroke="#6c6c6c"
                  d="M79 167.138H259"
                ></path>
              </svg>
              <span className="tooltip">Add File</span>
            </label>
            <input type="file" id="file" name="file" />
          </div>
          {Loading ? <div className="w-[95%] flex items-center justify-center"><img src="Loader.gif" alt="Not Found" className="h-10" /></div> : <input required="" placeholder="Message..." value={userInput} type="text" id="messageInput" onKeyDown={handleKeyPress} onChange={(e) => { setuserInput(e.target.value) }} />}
          <button id="sendButton" onClick={handleSendMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 664 663">
              <path
                fill="none"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
              ></path>
              <path
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="33.67"
                stroke="#6c6c6c"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="mx-auto w-[95vw] h-[85vh] text-white overflow-y-scroll">
        {Chat.map(item => {
          return <div key={item.id} className="w-full my-2">
            {item.from == "user" && <div data-id={item.id} className="left-1 px-3 text-red-600 w-fit rounded-2xl text-sm hover:underline cursor-pointer" onClick={HandleDelete}>Delete</div>}
            <div className={`my-3 py-2 px-4 flex flex-col ${item.from == "user" ? "bg-slate-800 rounded-4xl relative left-1 w-fit" : "w-[99%]"}`}>
              {item.tag == "pre" ?
                <pre data-id={item.id} className={`w-full ${item.from == "AI" ? "overflow-x-scroll" : ""}`}>
                  {item.content}
                </pre> :
                <div data-id={item.id} className="w-full">
                  {item.content}
                </div>
              }
            </div>
          </div>
        })}
      </div>
    </>
  );
}