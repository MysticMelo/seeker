import { useState, useRef, useEffect } from 'react'
import './App.css'
import {Send, MessageCircle, Bot, Paperclip} from 'lucide-react'

function App() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        // Add user message
        const userMessage = { id: Date.now(), text: input, sender: 'user' }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('https://russie.app.n8n.cloud/webhook/c54e604b-e5a0-43c3-85c2-bfc011a3cf93', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            })

            const data = await response.json()
            const botMessage = {
                id: Date.now() + 1,
                text: data.output || 'No response',
                sender: 'bot'
            }
            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Error connecting to chat. Please try again.',
                sender: 'bot'
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleAttach = () => {
        console.log("Attaching files");
    }

    return (
        <div className="chat-container">
            <img src="../public/Seek19.png" alt="Logo" className="logo" width={"15%"} height={"auto"} draggable={false} />
            <div className="chat-wrapper">

                {/* Header */}
                <div className="chat-header">
                    {/*<img src="../public/Seek19%20Logo.png" alt="Logo" className="logo"/>*/}
                    <div className="header-content">
                        <Bot size={24} className="header-icon" />
                        <h1>Seeker</h1>
                    </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <Bot size={48} className="empty-icon" />
                            <p>Start a conversation</p>
                        </div>
                    ) : (
                        <>
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`message-row ${msg.sender}`}
                                >
                                    <div className={`message ${msg.sender}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="message-row bot">
                                    <div className="message bot loading">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="chat-input-section">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            disabled={loading}
                            className="input-field"
                        />
                        <button
                            onClick={handleAttach}

                            className="send-button"
                        >
                            <Paperclip size={20} />
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="send-button"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App