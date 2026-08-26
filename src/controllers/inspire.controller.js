async function renderQuote(req, res, next) {
    try {
        // 1. Set our reliable fallbacks just in case the internet acts up
        let dynamicQuote = { 
            text: "The internet is a fragile place, but your code is strong.", 
            author: "Server Fallback" 
        };
        // A trusty fallback GIF
        let dynamicGif = "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif"; 

        // 2. CALL API #1: The Random Quote Generator
        try {
            const quoteResponse = await fetch('https://dummyjson.com/quotes/random');
            const quoteData = await quoteResponse.json();
            dynamicQuote = {
                text: quoteData.quote,
                author: quoteData.author
            };
        } catch (error) {
            console.error("⚠️ Quote API failed:", error.message);
        }

        // 3. CALL API #2: The Free GIF API (Filtering specifically for GIFs)
        try {
            const gifResponse = await fetch('https://api.thecatapi.com/v1/images/search?mime_types=gif');
            const gifData = await gifResponse.json();
            
            // The Cat API returns an array, so we grab the URL from the first object
            if (gifData && gifData.length > 0) {
                dynamicGif = gifData[0].url;
            }
        } catch (error) {
            console.error("⚠️ GIF API failed:", error.message);
        }

        // 4. Our local array for Emojis (these are lightweight enough to keep in memory)
        const funEmojis = ["✨", "🚀", "🎉", "🌟", "🎈", "🥳", "🌈", "🔥", "💖", "🦄", "🌻", "🙌"];
        const randE1 = funEmojis[Math.floor(Math.random() * funEmojis.length)];
        const randE2 = funEmojis[Math.floor(Math.random() * funEmojis.length)];
        const randE3 = funEmojis[Math.floor(Math.random() * funEmojis.length)];

        // 5. Inject EVERYTHING dynamically into the HTML
        res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Daily Inspiration ✨</title>
                <style>
                    body {
                        margin: 0;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        font-family: 'Nunito', 'Comic Sans MS', system-ui, sans-serif;
                        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a1c4fd 100%);
                        background-size: 400% 400%;
                        animation: gradientBG 10s ease infinite;
                        color: #333;
                        padding: 1rem;
                    }

                    @keyframes gradientBG {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    .quote-card {
                        background: rgba(255, 255, 255, 0.85);
                        backdrop-filter: blur(10px);
                        border-radius: 30px;
                        padding: 3rem;
                        max-width: 600px;
                        text-align: center;
                        box-shadow: 0 15px 35px rgba(255, 107, 107, 0.2);
                        border: 3px dashed #ffb8b8;
                        position: relative;
                        transform: translateY(0);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                    
                    .quote-card:hover {
                        transform: translateY(-10px);
                        box-shadow: 0 25px 45px rgba(255, 107, 107, 0.3);
                    }

                    .gif-container img {
                        width: 160px;
                        max-height: 160px;
                        object-fit: cover;
                        border-radius: 20px;
                        margin-bottom: 1.5rem;
                        box-shadow: 0 8px 15px rgba(0,0,0,0.1);
                    }

                    h1 { font-size: 2.2rem; color: #ff6b6b; margin-top: 0; margin-bottom: 1rem; }
                    .quote-text { font-size: 1.8rem; font-style: italic; font-weight: 800; color: #4a4e69; line-height: 1.4; }
                    .author { margin-top: 1.5rem; font-size: 1.3rem; color: #fca311; font-weight: 900; }

                    .emoji-float {
                        font-size: 2.5rem;
                        position: absolute;
                        animation: float 3s ease-in-out infinite;
                        z-index: 10;
                    }
                    .e1 { top: -25px; left: -25px; animation-delay: 0s; }
                    .e2 { bottom: -25px; right: -25px; animation-delay: 1s; }
                    .e3 { top: -25px; right: -25px; animation-delay: 2s; }

                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-15px) rotate(15deg); }
                    }

                    .footer-text { margin-top: 2.5rem; font-size: 0.8rem; color: #4a4e69; text-align: center; max-width: 500px; background: rgba(255, 255, 255, 0.5); padding: 10px; border-radius: 10px; }
                </style>
            </head>
            <body>
                <div class="quote-card">
                    <div class="emoji-float e1">${randE1}</div>
                    <div class="emoji-float e2">${randE2}</div>
                    <div class="emoji-float e3">${randE3}</div>

                    <div class="gif-container">
                        <!-- INJECTING THE LIVE API GIF HERE -->
                        <img src="${dynamicGif}" alt="Dynamic Random GIF">
                    </div>

                    <h1>🌟 Inspiration Unlocked! 🌟</h1>
                    
                    <div class="quote-text">
                        "${dynamicQuote.text}"
                    </div>
                    
                    <div class="author">
                        — ${dynamicQuote.author}
                    </div>
                </div>

                <div class="footer-text">
                    <strong>Privacy Notice:</strong> This demonstration logs approximate network metadata (IP address, browser headers) for educational telemetry. IP geolocation is approximate and stored for up to 30 days. <br><br>
                    ✨ Keep Building Awesome Things! ✨
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        next(error);
    }
}

module.exports = { renderQuote };