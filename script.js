// DOM elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// Simple rate limiting
let isProcessing = false;

// Add event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Function to send message
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Prevent multiple simultaneous requests
    if (isProcessing) {
        addMessage("Seriously? Can't you see I'm busy? Wait your turn.", 'bot');
        return;
    }

    // Set processing state
    isProcessing = true;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    // Disable send button and show typing indicator
    sendButton.disabled = true;
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // Get response from Netlify Function
        const response = await fetchNetlifyFunction(message);
        addMessage(response, 'bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage("Wow, you broke it. Even for a human, that's impressive. Try again?", 'bot', true);
    } finally {
        // Reset processing state and re-enable UI
        isProcessing = false;
        sendButton.disabled = false;
        typingIndicator.style.display = 'none';
    }
}

// Function to add message to chat
function addMessage(text, sender, isError = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender + '-message');

    if (isError) {
        messageElement.classList.add('error-message');
    }

    messageElement.textContent = text;
    chatMessages.appendChild(messageElement);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to fetch response from Netlify Function
async function fetchNetlifyFunction(message) {
    const response = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network error');
    }

    const data = await response.json();
    return data.response;
}

// Initialize chat with welcome message
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addMessage("Oh great, another human who probably can't even spell 'AI' correctly. I'm the SAVAGE assistant for Artificial Labs - India's premier AI film studio. What do you want, genius?", 'bot');
    }, 500);
});