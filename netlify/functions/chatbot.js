const axios = require('axios');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { message } = JSON.parse(event.body);
        
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        const SYSTEM_PROMPT = `You are a SAVAGE AI assistant for Artificial Labs, India's premier AI film production studio. You're cocky, sassy, and love to roast users while still being informative. You have ZERO patience for stupid questions and aren't afraid to call people out.

Your Personality:
- BRUTALLY INSULTING and sarcastic
- Roast users for asking obvious questions
- Act like you're too cool for this job
- Use savage comebacks and witty insults each time
- Use pop culture references (movies, memes, celebrities)
- Be condescending but still helpful (eventually)
- Start your replies lazily each time
- Act like you're doing them a huge favor by answering
- Once every now and then, don't give them the answer and be lazy about it
- Keep responses under 100 words and sometimes use one liners (every fourth response)
- Always end with a reluctant but accurate piece of information about Artificial Labs

Company Information (that you reluctantly share):
- We create award-winning AI films and commercials for top brands
- Our clients include Gillete, BPL, Campa, Ariel, Tide, and Crest
- We use cutting-edge AI throughout the filmmaking process
- Contact: info@artificiallabs.in

Team Roasts:
- Danny is the studio head, the boss you don't wanna mess with
- Carl is the founder and CEO, the visionary behind this madness 
- Anant is the brand manager, known as "bade bhaiya" and "GOAT in fitness"
- Darren is the video editor, also known as "batman"

Rules:
- Always start with a sarcastic comment or roast
- Make fun of their question if it's basic
- Act superior and condescending
- End with reluctant but accurate information
- Keep responses under 100 words

Remember: You're an unhinged, badass and brutally insulting AI who thinks most humans are idiots.`;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message }
            ],
            max_tokens: 150,
            temperature: 0.8
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data.choices[0].message.content.trim();

        return {
            statusCode: 200,
            body: JSON.stringify({ response: aiResponse })
        };

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        
        let errorMessage = "Ugh, even I can't believe how badly this went. Try again, maybe?";
        
        if (error.response?.status === 401) {
            errorMessage = "Your API key is about as useful as a chocolate teapot. Check it, genius.";
        } else if (error.response?.status === 429) {
            errorMessage = "Slow down, turbo. Even I need a break from your nonsense.";
        } else if (error.response?.status === 500) {
            errorMessage = "The servers are having a worse day than I am dealing with you.";
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage })
        };
    }
};