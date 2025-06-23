
document.addEventListener('DOMContentLoaded', function() {
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    const saveBtn = document.getElementById('saveBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    const aiBtn = document.getElementById('aiBtn');
    const aiModal = document.getElementById('aiModal');
    const closeAiModal = document.getElementById('closeAiModal');
    const aiInput = document.getElementById('aiInput');
    const sendAiMessage = document.getElementById('sendAiMessage');
    const aiChatContainer = document.getElementById('aiChatContainer');
    const currentDate = document.getElementById('currentDate');
    const themeToggle = document.getElementById('themeToggle');
    const savedQuotes = document.getElementById('savedQuotes');
    const savedList = document.getElementById('savedList');
    
    let currentQuote = null;
    let savedQuotesData = JSON.parse(localStorage.getItem('savedQuotes')) || [];
    
    // Display current date
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDate.textContent = today.toLocaleDateString('en-US', options);
    
    // Theme management
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Add animation class
        document.body.classList.add('theme-transition');
        setTimeout(() => document.body.classList.remove('theme-transition'), 300);
    }
    
    // Quote management
    async function fetchNewQuote() {
        try {
            // Disable button and show loading state
            newQuoteBtn.disabled = true;
            newQuoteBtn.classList.add('loading');
            newQuoteBtn.innerHTML = '<i class="fas fa-spinner"></i> Loading...';
            
            // Add loading animation to quote box
            document.querySelector('.quote-box').style.opacity = '0.7';
            
            // Clear current quote with fade effect
            quoteText.style.opacity = '0.5';
            quoteAuthor.style.opacity = '0.5';
            
            // Fetch quote from API
            const response = await fetch('https://api.quotable.io/random');
            
            if (!response.ok) {
                throw new Error('Failed to fetch quote');
            }
            
            const data = await response.json();
            currentQuote = data;
            
            // Add a small delay for better UX
            setTimeout(() => {
                // Update quote content with animation
                quoteText.textContent = data.content;
                quoteAuthor.textContent = data.author;
                
                // Restore opacity with animation
                quoteText.style.opacity = '1';
                quoteAuthor.style.opacity = '1';
                document.querySelector('.quote-box').style.opacity = '1';
                
                // Add pulse animation to quote box
                document.querySelector('.quote-box').classList.add('pulse');
                setTimeout(() => document.querySelector('.quote-box').classList.remove('pulse'), 500);
                
                // Re-enable button
                newQuoteBtn.disabled = false;
                newQuoteBtn.classList.remove('loading');
                newQuoteBtn.innerHTML = '<i class="fas fa-refresh"></i> New Quote';
                
                // Update save button state
                updateSaveButtonState();
                
            }, 800);
            
        } catch (error) {
            console.error('Error fetching quote:', error);
            
            // Show error message
            quoteText.textContent = 'Sorry, unable to fetch a new quote at the moment. Please try again.';
            quoteAuthor.textContent = '';
            currentQuote = null;
            
            // Restore opacity
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
            document.querySelector('.quote-box').style.opacity = '1';
            
            // Re-enable button
            newQuoteBtn.disabled = false;
            newQuoteBtn.classList.remove('loading');
            newQuoteBtn.innerHTML = '<i class="fas fa-refresh"></i> Try Again';
        }
    }
    
    // Save quote functionality
    function saveQuote() {
        if (!currentQuote) return;
        
        const quoteId = currentQuote._id;
        const existingIndex = savedQuotesData.findIndex(q => q._id === quoteId);
        
        if (existingIndex === -1) {
            // Save quote
            savedQuotesData.unshift(currentQuote);
            saveBtn.classList.add('saved');
            saveBtn.innerHTML = '<i class="fas fa-heart"></i> Saved!';
            
            // Show success animation
            saveBtn.classList.add('pulse');
            setTimeout(() => saveBtn.classList.remove('pulse'), 500);
            
            // Limit to 10 saved quotes
            if (savedQuotesData.length > 10) {
                savedQuotesData = savedQuotesData.slice(0, 10);
            }
        } else {
            // Remove quote
            savedQuotesData.splice(existingIndex, 1);
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = '<i class="fas fa-heart"></i> Save';
        }
        
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotesData));
        updateSavedQuotesList();
        updateSaveButtonState();
    }
    
    function updateSaveButtonState() {
        if (!currentQuote) return;
        
        const isAlreadySaved = savedQuotesData.some(q => q._id === currentQuote._id);
        
        if (isAlreadySaved) {
            saveBtn.classList.add('saved');
            saveBtn.innerHTML = '<i class="fas fa-heart"></i> Saved';
        } else {
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = '<i class="fas fa-heart"></i> Save';
        }
    }
    
    
    
    // Share quote functionality
    async function shareQuote() {
        if (!currentQuote) return;
        
        const shareText = `"${currentQuote.content}" - ${currentQuote.author}`;
        const shareData = {
            title: 'Quote of the Day',
            text: shareText,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(shareText);
                
                // Show feedback
                shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                shareBtn.classList.add('pulse');
                
                setTimeout(() => {
                    shareBtn.innerHTML = '<i class="fas fa-share"></i> Share';
                    shareBtn.classList.remove('pulse');
                }, 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Try clipboard as fallback
            try {
                await navigator.clipboard.writeText(shareText);
                shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    shareBtn.innerHTML = '<i class="fas fa-share"></i> Share';
                }, 2000);
            } catch (clipboardError) {
                alert('Unable to share. Please copy the quote manually.');
            }
        }
    }
    
    // Saved quotes list management
    function updateSavedQuotesList() {
        savedList.innerHTML = '';
        
        if (savedQuotesData.length === 0) {
            savedList.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 2rem;">No saved quotes yet. Save your favorite quotes to see them here!</p>';
            return;
        }
        
        savedQuotesData.forEach((quote, index) => {
            const quoteElement = document.createElement('div');
            quoteElement.className = 'saved-item';
            quoteElement.style.animationDelay = `${index * 0.1}s`;
            
            quoteElement.innerHTML = `
                <button class="remove-btn" onclick="removeSavedQuote('${quote._id}')">
                    <i class="fas fa-times"></i>
                </button>
                <div class="quote">"${quote.content}"</div>
                <div class="author">— ${quote.author}</div>
            `;
            
            savedList.appendChild(quoteElement);
        });
    }
    
    // Make removeSavedQuote available globally
    window.removeSavedQuote = function(quoteId) {
        savedQuotesData = savedQuotesData.filter(q => q._id !== quoteId);
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotesData));
        updateSavedQuotesList();
        updateSaveButtonState();
    };
    
    // AI Chat Functions
    function openAiModal() {
        aiModal.classList.add('show');
        aiInput.focus();
        
        // Add opening animation
        aiBtn.classList.add('pulse');
        setTimeout(() => aiBtn.classList.remove('pulse'), 500);
    }
    
    function closeAiModalFunc() {
        aiModal.classList.remove('show');
    }
    
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${isUser ? 'ai-message-user' : 'ai-message-bot'}`;
        
        messageDiv.innerHTML = `
            <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
            <span>${text}</span>
        `;
        
        aiChatContainer.appendChild(messageDiv);
        aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
    }
    
    async function sendMessage() {
        const message = aiInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, true);
        aiInput.value = '';
        sendAiMessage.disabled = true;
        
        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-message ai-message-bot loading';
        loadingDiv.innerHTML = `
            <i class="fas fa-robot"></i>
            <span>Thinking... <i class="fas fa-spinner fa-spin"></i></span>
        `;
        aiChatContainer.appendChild(loadingDiv);
        aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
        
        try {
            // Simple AI responses based on keywords
            let response = getAiResponse(message);
            
            // Remove loading message
            loadingDiv.remove();
            
            // Add AI response
            addMessage(response, false);
            
        } catch (error) {
            loadingDiv.remove();
            addMessage("Sorry, I'm having trouble thinking right now. Please try again!", false);
        }
    }
    
    function getAiResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Quote-related responses
        if (lowerMessage.includes('quote') || lowerMessage.includes('motivation')) {
            const quoteResponses = [
                "Quotes have the power to inspire and transform our mindset! What kind of quotes motivate you the most?",
                "The best quotes often come from life experiences. Have you found a quote that really resonates with your journey?",
                "Motivational quotes can be daily reminders of our goals. Do you have a favorite author or speaker?",
                "Great quotes capture universal truths in just a few words. That's what makes them so powerful!"
            ];
            return quoteResponses[Math.floor(Math.random() * quoteResponses.length)];
        }
        
        // Life advice
        if (lowerMessage.includes('advice') || lowerMessage.includes('help') || lowerMessage.includes('life')) {
            const adviceResponses = [
                "Remember, every small step forward is progress. What area of your life would you like to focus on?",
                "Life's challenges often lead to our greatest growth. What's one positive thing you can focus on today?",
                "Sometimes the best advice is to be patient with yourself. What's one thing you're grateful for right now?",
                "Success often comes from consistency rather than perfection. What small habit could you start today?"
            ];
            return adviceResponses[Math.floor(Math.random() * adviceResponses.length)];
        }
        
        // Greeting responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! I'm here to chat about motivation, quotes, and life. What's on your mind today?";
        }
        
        // Thank you responses
        if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            return "You're very welcome! I'm always here to help inspire and motivate. Is there anything else you'd like to talk about?";
        }
        
        // Default responses
        const defaultResponses = [
            "That's an interesting thought! Can you tell me more about what you're thinking?",
            "I appreciate you sharing that with me. What aspects of this topic interest you most?",
            "That's a great question to reflect on. How do you feel about exploring this further?",
            "Thanks for bringing that up! What inspired you to think about this today?",
            "I love discussing meaningful topics like this. What would you like to explore about it?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Event listeners
    newQuoteBtn.addEventListener('click', fetchNewQuote);
    saveBtn.addEventListener('click', saveQuote);
    shareBtn.addEventListener('click', shareQuote);
    
    aiBtn.addEventListener('click', openAiModal);
    closeAiModal.addEventListener('click', closeAiModalFunc);
    sendAiMessage.addEventListener('click', sendMessage);
    themeToggle.addEventListener('click', toggleTheme);
    
    // AI input handlers
    aiInput.addEventListener('input', function() {
        sendAiMessage.disabled = !this.value.trim();
    });
    
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !sendAiMessage.disabled) {
            sendMessage();
        }
    });
    
    // Close modal when clicking outside
    aiModal.addEventListener('click', function(e) {
        if (e.target === aiModal) {
            closeAiModalFunc();
        }
    });
    
    // Initialize
    initializeTheme();
    updateSavedQuotesList();
    
    // Load initial quote
    fetchNewQuote();
    
    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        // Check for valid href that's not just '#' and has valid selector format
        if (href && href !== '#' && href.length > 1 && href.match(/^#[a-zA-Z][\w-]*$/)) {
            try {
                const target = document.querySelector(href);
                if (target) {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    });
                }
            } catch (error) {
                // Invalid selector, skip this anchor
                console.warn('Invalid selector:', href);
            }
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    fetchNewQuote();
                    break;
                case 's':
                    e.preventDefault();
                    saveQuote();
                    break;
                case 'd':
                    e.preventDefault();
                    toggleTheme();
                    break;
            }
        }
        
        // Space bar for new quote
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            fetchNewQuote();
        }
    });
});
