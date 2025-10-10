import { useState, useRef, useEffect } from 'react'
import './App.css'
import {Send, MessageCircle, Bot, Paperclip} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

function App() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const [sessionToken, setSessionToken] = useState(sessionStorage.getItem('session_token') || null)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [authLoading, setAuthLoading] = useState(false)


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
            const response = await fetch('https://russie.app.n8n.cloud/webhook/e0e19d7a-c571-4cbd-928e-35875bc0a39d', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, email : sessionStorage.getItem('session_email')})
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

    const checkEmailAndSendOtp = async () => {
        if (!email.trim()) return
        setAuthLoading(true)
        try {
            const res = await fetch('https://russie.app.n8n.cloud/webhook/261d0fb7-1815-4653-890e-9bd672d0a184', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (data.success) {
                setOtpSent(true) // move to OTP input
            } else {
                alert(data.message || 'Email not registered')
            }
        } catch (err) {
            alert('Error sending OTP')
        } finally {
            setAuthLoading(false)
        }
    }

    // Verify OTP
    const verifyOtp = async () => {
        if (!otp.trim()) return
        setAuthLoading(true)
        try {
            const res = await fetch('https://russie.app.n8n.cloud/webhook/2736337a-44c8-4c00-8c1f-15a1011003d2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            })
            const data = await res.json()
            if (data.success) {
                setSessionToken(data.token)
                console.log("email:", data.email)
                sessionStorage.setItem('session_token', data.token)
                sessionStorage.setItem('session_email', data.email)
            } else {
                alert(data.message || 'Invalid OTP')
            }
        } catch (err) {
            alert('Error verifying OTP')
        } finally {
            setAuthLoading(false)
        }
    }

    const logout = () => {
        sessionStorage.removeItem('session_token')
        setSessionToken(null)
        setOtpSent(false)
        setEmail('')
        setOtp('')
    }

    if (!sessionToken) {
        return (
            <div className={'login-screen'}>
            <div className="login-container">
                <h2>Seeker Login</h2>
                {!otpSent ? (
                    <>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && checkEmailAndSendOtp()}
                            placeholder="Enter your email"
                            disabled={authLoading}
                        />

                        <button
                            onClick={checkEmailAndSendOtp}
                            disabled={authLoading || !email.trim()}
                        >
                            {authLoading ? 'Checking...' : 'Next'}
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                            placeholder="Enter OTP"
                            disabled={authLoading}
                        />
                        <button
                            onClick={verifyOtp}
                            disabled={authLoading || !otp.trim()}
                        >
                            {authLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button onClick={() => setOtpSent(false)}>Change Email</button>
                    </>
                )}
            </div>
            </div>

        )
    }
    else {
        return (
            <>

            <div className="chat-container">
                <img src="https://raw.githubusercontent.com/MysticMelo/seeker/refs/heads/master/public/Seek19.png" alt="Logo" className="logo" width={"15%"} height={"auto"}
                     draggable={false}/>
                <div className="chat-wrapper">

                    {/* Header */}
                    <div className="chat-header">
                        {/*<img src="../public/Seek19%20Logo.png" alt="Logo" className="logo"/>*/}
                        <div className="header-content">
                            <Bot size={24} className="header-icon"/>
                            <h1>Seeker</h1>
                        </div>
                        <button className={'logout-btn'} onClick={logout}>Logout</button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="empty-state">
                                <Bot size={48} className="empty-icon"/>
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
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
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
                                <div ref={messagesEndRef}/>
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
                            {/*<button*/}
                            {/*    onClick={handleAttach}*/}

                            {/*    className="send-button"*/}
                            {/*>*/}
                            {/*    <Paperclip size={20}/>*/}
                            {/*</button>*/}
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="send-button"
                            >
                                <Send size={20}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )
    }
}

export default App