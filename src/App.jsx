import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import {Send, MessageCircle, Bot, Paperclip, User, MoveUp} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Chart colors matching the app theme
const CHART_COLORS = ['#00b5a4', '#00998a', '#ff7300', '#ffa940', '#6b7280', '#9ca3af'];

const ChartDisplay = React.memo(function ChartDisplay({ chartConfig }) {
    // Handle error state
    if (chartConfig?.error) {
        return (
            <div className="chart-error">
                <p>Unable to generate chart: {chartConfig.error}</p>
            </div>
        );
    }

    // Validate chart config
    if (!chartConfig || !chartConfig.data || !Array.isArray(chartConfig.data) || chartConfig.data.length === 0) {
        return null;
    }

    const { type, title, xKey, yKeys, yLabels, data } = chartConfig;

    // Default to yKeys if yLabels not provided
    const labels = yLabels || yKeys;

    return (
        <div className="chart-container">
            {title && <h3 className="chart-title">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                {type === 'bar' ? (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                            dataKey={xKey} 
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(2, 14, 28, 0.95)', 
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#f3f4f6'
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ color: '#f3f4f6', fontSize: '12px' }}
                        />
                        {yKeys.map((key, index) => (
                            <Bar 
                                key={key}
                                dataKey={key} 
                                name={labels[index] || key}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                        ))}
                    </BarChart>
                ) : (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                            dataKey={xKey} 
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(2, 14, 28, 0.95)', 
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#f3f4f6'
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ color: '#f3f4f6', fontSize: '12px' }}
                        />
                        {yKeys.map((key, index) => (
                            <Line 
                                key={key}
                                type="monotone"
                                dataKey={key} 
                                name={labels[index] || key}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                strokeWidth={2}
                                dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
});

const TypingIndicator = React.memo(function TypingIndicator() {
    return (
        <div className="message-row message-row-bot">
            <div className="message-avatar avatar-bot">
                <Bot style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div className="message-bubble message-bubble-bot">
                <div className="typing-dots">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                </div>
            </div>
        </div>
    );
});

const Message = React.memo(function Message({ msg }) {
    return (
        <div className={`message-row ${msg.sender === 'user' ? 'message-row-user' : 'message-row-bot'}`}>
            {msg.sender === 'bot' && <BotAvatar />}

            <div className={`message-bubble ${msg.sender === 'user' ? 'message-bubble-user' : 'message-bubble-bot'}`}>
                {msg.sender === 'user' ? (
                    <p>{msg.text}</p>
                ) : (
                    <>
                        {msg.chart && <ChartDisplay chartConfig={msg.chart} />}
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        >
                            {msg.text}
                        </ReactMarkdown>
                    </>
                )}
            </div>

            {msg.sender === 'user' && <UserAvatar />}
        </div>
    );
});
const BotAvatar = React.memo(function BotAvatar() {
    return (
        <div className="message-avatar avatar-bot">
            <Bot style={{ width: '20px', height: '20px', color: 'white' }} />
        </div>
    );
});
const UserAvatar = React.memo(function UserAvatar() {
    return (
        <div className="message-avatar avatar-user">
            <User style={{ width: '20px', height: '20px', color: 'white' }} />
        </div>
    );
});
const MessagesList = React.memo(function MessagesList({ messages, loading, endRef }) {
    return (
        <div className="messages-container">
            {messages.map(msg => (
                <Message key={msg.id} msg={msg} />
            ))}

            {loading && <TypingIndicator />}
            <div ref={endRef} />
        </div>
    );
});

function App() {
    const [chatEndpoint, setChatEndpoint] = useState(sessionStorage.getItem('session_chat_endpoint') || '')
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const [sessionToken, setSessionToken] = useState(sessionStorage.getItem('session_token') || null)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [authLoading, setAuthLoading] = useState(false)
    const pollRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // const scrollToBottom = () => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    // }
    const prevMessageCountRef = useRef(0);

    useEffect(() => {
        const prevCount = prevMessageCountRef.current;
        const currentCount = messages.length;

        // Only scroll when a NEW message is added
        if (currentCount > prevCount) {
            messagesEndRef.current?.scrollIntoView();
        }

        prevMessageCountRef.current = currentCount;
    }, [messages.length]);

    const handleSend = async () => {
        if (!input.trim()) return

        // Add user message
        const userMessage = { id: Date.now(), text: input, sender: 'user' }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        // Add placeholder bot message with stage info
        const botMessageId = Date.now() + 1
        const placeholderMessage = {
            id: botMessageId,
            text: 'Thinking…',
            sender: 'bot',
            stage: 'understanding'
        }
        setMessages(prev => [...prev, placeholderMessage])

        try {
            // Step 1: Start the job
            const startResponse = await fetch(chatEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    email: sessionStorage.getItem('session_email')
                })
            })

            const { jobId } = await startResponse.json()

            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }


            // Step 2: Poll for status
            pollRef.current = setInterval(async () => {
                try {
                    const statusResponse = await fetch(
                        `${chatEndpoint.replace('chat-start', 'chat-status')}?jobId=${jobId}`
                    );

                    const statusData = await statusResponse.json();

                    // Update progress
                    if (statusData.message) {
                        setMessages(prev =>
                            prev.map(msg =>
                                msg.id === botMessageId
                                    ? { ...msg, text: statusData.message }
                                    : msg
                            )
                        );
                    }

                    // ✅ STOP polling when done
                    if (statusData.status === 'done') {
                        clearInterval(pollRef.current);
                        pollRef.current = null;

                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                            timeoutRef.current = null;
                        }

                        setMessages(prev =>
                            prev.map(msg =>
                                msg.id === botMessageId
                                    ? { 
                                        ...msg, 
                                        text: statusData.final || 'No response',
                                        chart: statusData.chart || null
                                    }
                                    : msg
                            )
                        );

                        setLoading(false);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3000);


            // Safety timeout after 5 minutes
            timeoutRef.current = setTimeout(() => {
                if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
                setLoading(false);
            }, 300000);


        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Error connecting to chat. Please try again.',
                sender: 'bot'
            }
            setMessages(prev => [...prev, errorMessage])
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
            const res = await fetch('https://russie.app.n8n.cloud/webhook/6ff64cc3-e694-4ee8-9c8e-71d7f3270f21', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }).toLowerCase()
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
            const res = await fetch('https://russie.app.n8n.cloud/webhook/e5f558c3-4f20-4ff5-9d17-69d431ac0ebf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            })
            const data = await res.json()
            if (data.success) {
                setSessionToken(data.token)
                setChatEndpoint(data.chat_endpoint)

                sessionStorage.setItem('session_token', data.token)
                sessionStorage.setItem('session_email', data.email.toLowerCase())
                sessionStorage.setItem('session_chat_endpoint', data.chat_endpoint)
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
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        sessionStorage.removeItem('session_token')
        sessionStorage.removeItem('session_chat_endpoint')
        setSessionToken(null)
        setOtpSent(false)
        setChatEndpoint('')
        setEmail('')
        setOtp('')
        setMessages(([]))
    }



    function preprocessBotOutput(text) {
        return text.replace(/```html([\s\S]*?)```/g, (_, html) => html.trim());
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

                <div className="chat-main-container">
                    {/* Header */}
                    <header className="chat-header-sticky">
                        <div className="chat-header-content">
                            <div className="chat-header-left">
                                <img
                                    src="https://raw.githubusercontent.com/MysticMelo/seeker/refs/heads/master/public/Seek19.png"
                                    alt="Seeker Logo"
                                    className="chat-logo"
                                    draggable={false}
                                />
                                <h1 className="chat-title">Seeker</h1>
                            </div>
                            <button className="logout-button" onClick={logout}>
                                Logout
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="chat-main-content">
                        <div className="chat-content-wrapper">
                            {messages.length === 0 ? (
                                <div className="empty-state-container">
                                    <div className="empty-state-logo-wrapper">
                                        <div className="empty-state-logo-glow"></div>
                                        <img
                                            src="https://raw.githubusercontent.com/MysticMelo/seeker/refs/heads/master/public/Seek19.png"
                                            alt="Seeker"
                                            className="empty-state-logo"
                                            draggable={false}
                                        />
                                    </div>
                                    <h2 className="empty-state-title">
                                        What can I help you with?
                                    </h2>
                                    {/*<p className="empty-state-subtitle">*/}
                                    {/*    Ask me anything or try one of these prompts*/}
                                    {/*</p>*/}

                                    {/* Suggested Prompts */}
                                    {/*<div className="suggested-prompts-grid">*/}
                                    {/*    {suggestedPrompts.map((prompt, idx) => (*/}
                                    {/*        <button*/}
                                    {/*            key={idx}*/}
                                    {/*            onClick={() => setInput(prompt)}*/}
                                    {/*            className="prompt-button"*/}
                                    {/*        >*/}
                                    {/*            <Sparkles className="prompt-icon" />*/}
                                    {/*            <span className="prompt-text">{prompt}</span>*/}
                                    {/*        </button>*/}
                                    {/*    ))}*/}
                                    {/*</div>*/}
                                </div>
                            ) : (
                                <MessagesList messages={messages} loading={loading} endRef={messagesEndRef} />

                        )}
                        </div>
                    </main>

                    {/* Floating Input */}
                    <div className="floating-input-container">
                        <div className="floating-input-wrapper">
                            <div className="input-glow-wrapper">
                                <div className="input-glow"></div>
                                <div className="input-box">
                <textarea
                    value={input}
                    onChange={e => {
                        setInput(e.target.value);

                        const el = e.target;

                        // Reset height
                        el.style.height = "auto";

                        // Apply natural height
                        const newHeight = el.scrollHeight;

                        // If within limit → grow without scroll
                        if (newHeight <= 200) {
                            el.style.height = newHeight + "px";
                            el.style.overflowY = "hidden";
                        }
                        else {
                            // Cap height and enable scroll
                            el.style.height = "200px";
                            el.style.overflowY = "auto";
                        }
                    }}
                    onKeyPress={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Ask Seeker anything..."
                    disabled={loading}
                    rows={1}
                    className="chat-textarea"
                />
                                    <button
                                        onClick={handleSend}
                                        disabled={loading || !input.trim()}
                                        className="send-button"
                                    >
                                        <MoveUp style={{ width: '20px', height: '20px', color: 'black' }} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default App