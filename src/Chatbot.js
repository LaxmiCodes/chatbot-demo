import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);

    try {
      let retry = true;
      let response;
      
      
      while (retry) {
        response = await axios.post('https://api-inference.huggingface.co/models/openai-community/gpt2', {
          inputs: input,  
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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`,  
          },
        });
        
        if (response.data.error && response.data.error.includes("currently loading")) {
          console.log(`Model loading, retrying in ${response.data.estimated_time} seconds...`);
          await new Promise(res => setTimeout(res, response.data.estimated_time * 1000));  
        } else {
          retry = false;  
        }
      }

      const botMessage = { sender: 'bot', text: response.data[0].generated_text.trim() };
      setMessages([...messages, userMessage, botMessage]);

    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      const errorMessage = { sender: 'bot', text: "Sorry, something went wrong." };
      setMessages([...messages, userMessage, errorMessage]);
    }
    setInput('');
  };

  return (
    <div>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatbot;

