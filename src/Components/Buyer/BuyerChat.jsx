import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';

function BuyerChat() {
    const location = useLocation();
    const navigate = useNavigate();
    const { farmer, crop } = location.state || {};
    
    const [messages, setMessages] = useState([
        { id: 1, sender: 'farmer', text: `Hello! About your order for ${crop?.cropName || 'the crop'}...`, time: '10:30 AM' },
        { id: 2, sender: 'buyer', text: 'Hi there! Yes, I wanted to ask about delivery', time: '10:32 AM' },
        { id: 3, sender: 'farmer', text: 'I can deliver tomorrow. Is that okay?', time: '10:33 AM' }
    ]);
    
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;
        
        const newMsg = {
            id: messages.length + 1,
            sender: 'buyer',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages([...messages, newMsg]);
        setNewMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="mr-4 text-gray-600 hover:text-gray-800"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Chat with {farmer?.name || 'Farmer'}
                    </h1>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-4xl mx-auto">
                    {/* Chat Header */}
                    <div className="bg-green-600 text-white p-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                            <FontAwesomeIcon icon={faUser} className="text-green-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold">{farmer?.name || 'Farmer'}</h2>
                            <p className="text-xs opacity-80">{crop?.cropName ? `About: ${crop.cropName}` : 'About your order'}</p>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="p-4 h-96 overflow-y-auto bg-gray-50">
                        {messages.map((message) => (
                            <div 
                                key={message.id} 
                                className={`mb-4 flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${message.sender === 'buyer' 
                                        ? 'bg-green-500 text-white rounded-br-none' 
                                        : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                                >
                                    <p>{message.text}</p>
                                    <p className={`text-xs mt-1 ${message.sender === 'buyer' ? 'text-green-100' : 'text-gray-500'}`}>
                                        {message.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-full"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BuyerChat;