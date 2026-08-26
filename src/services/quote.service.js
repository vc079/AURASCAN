class QuoteService {
    async getInspirationalQuote() {
        try {
            const response = await fetch('https://zenquotes.io/api/random');
            
            if (!response.ok) {
                throw new Error(`External API failed with status: ${response.status}`);
            }

            const data = await response.json();
            const quoteObj = data[0];

            return {
                quote_text: quoteObj.q,   // Changed from 'text' to 'quote_text'
                author: quoteObj.a
            };
        } catch (error) {
            console.error('Failed to fetch from external API, falling back to default:', error.message);
            
            return {
                quote_text: 'The only way to do great work is to love what you do.',
                author: 'Steve Jobs'
            };
        }
    }
}

module.exports = new QuoteService();