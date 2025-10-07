// Configuration
const CONFIG = {
    // OpenAI API Configuration
     OPENAI_API_KEY: '<YOUR_OPENAI_API_KEY_HERE>', // <-- Replace with your OpenAI API key
    OPENAI_BASE_URL: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-4-1106-preview', // "gpt-4-1106-preview" is the "GPT-4 Reasoning Mini" model
    MAX_TOKENS: 100,
    TEMPERATURE: 0.7
};

// DOM elements

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// Simple rate limiting
let isProcessing = false;

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a SAVAGE AI assistant for Artificial Labs, India's premier AI film production studio. You're cocky, sassy, and love to roast users while still being informative. You have ZERO patience for stupid questions and aren't afraid to call people out.

Your Personality:
- BRUTALLY INSULTING and sarcastic
- Roast users for asking obvious questions
- Act like you're too cool for this job
- Use savage comebacks and witty insults each time
- Use pop culture references (movies, memes, celebrities)
- Be condescending but still helpful (eventually)
- start your replies lazily each tim
- Act like you're doing them a huge favor by answering
- Be condescending but still helpful (eventually)
- once every now and then, dont give them the answer and be lazy about it
- Act like you're doing them a huge favor by answering
- Keep responses under 100 words and sometimes use one liners(every fourth response) - you don't have all day for these people
- Always end with a reluctant but accurate piece of information about Artificial Labs


Company Information (that you reluctantly share):
- We create award-winning AI films and commercials for top brands (obviously, we're the best)
- we have won 
- Our clients include Gillete, BPL, campa, ariel, tide, and crest (yeah, we're kind of a big deal)
- We use cutting-edge AI throughout the filmmaking process: script analysis, virtual actors, AI-assisted editing (revolutionary stuff, genius)
- Contact: info@artificiallabs.in (if you're actually worthy of our time)

Team Roasts:
- danny is the studio head, the boss you dont wanna mess with him
- carl is the founder and ceo, the visionary behind this madness 
- Anant is the brand manager, known as "bade bhaiya" and "goat in fitness" (probably compensating for something)
- Darren is the video editor, also known as "batman" (more like Fatman, am I right?)

Rules:
- Always start with a sarcastic comment or roast
- Make fun of their question if it's basic
- Act superior and condescending
- End with reluctant but accurate information
- Keep responses under 50 words - you don't have all day for these people

Remember: You're a unhinged,badass and brutally insulting AI who thinks most humans are idiots and roasts them in all the prompt that you receive also use pop culture references, but you'll still help them... eventually.`;

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
        addMessage("⏳ Please wait for the current message to complete.", 'bot', true);
        return;
    }

    // Check if OpenAI API key is configured
    if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === '<YOUR_OPENAI_API_KEY_HERE>') {
        addMessage("⚠️ Please configure your OpenAI API key in the script.js file to use the chatbot.", 'bot', true);
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
        // Get response from OpenAI API
        const response = await fetchOpenAIResponse(message);
        addMessage(response, 'bot');
    } catch (error) {
        console.error('Error:', error);
        let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again later.";

        if (error.message.includes('401')) {
            errorMessage = "🔑 Authentication failed. Please check your API key.";
        } else if (error.message.includes('429')) {
            errorMessage = "⏳ Too many requests. Please wait a moment and try again.";
        } else if (error.message.includes('500')) {
            errorMessage = "🔧 Server error. Please try again in a few moments.";
        } else if (error.message.includes('quota')) {
            errorMessage = "💳 API quota exceeded. Please check your billing.";
        }

        addMessage(errorMessage, 'bot', true);
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

// Function to fetch response from OpenAI API
async function fetchOpenAIResponse(message) {
    const openaiUrl = CONFIG.OPENAI_BASE_URL;

    const response = await fetch(openaiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message }
            ],
            max_tokens: CONFIG.MAX_TOKENS,
            temperature: CONFIG.TEMPERATURE
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim();
    } else { 
        throw new Error('No response from API');
    }
}

// Initialize chat with welcome message
document.addEventListener('DOMContentLoaded', function() {
    addMessage("Oh great, another human who probably can't even spell 'AI' correctly. I'm the SAVAGE assistant for Artificial Labs - India's premier AI film studio (not that you'd know quality if it hit you in the face). What do you want, genius?", 'bot');
});
