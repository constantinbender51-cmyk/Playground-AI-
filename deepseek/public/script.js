document.addEventListener('DOMContentLoaded', function() {
    const chatHistory = document.getElementById('chatHistory');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const clearButton = document.getElementById('clearButton');
    const modelSelect = document.getElementById('modelSelect');
    const status = document.getElementById('status');
    
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key (but allow Shift+Enter for new line)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Clear chat history
    clearButton.addEventListener('click', function() {
        // Keep only the first welcome message
        while (chatHistory.children.length > 1) {
            chatHistory.removeChild(chatHistory.lastChild);
        }
        addMessage('ai', 'Chat history cleared. How can I help you?');
    });
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage('user', message);
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show thinking indicator
        setStatus('thinking', 'DeepSeek is thinking...');
        
        // Call the API
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                model: modelSelect.value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            setStatus('idle', '');
            addMessage('ai', data.response);
        })
        .catch(error => {
            console.error('Error:', error);
            setStatus('error', 'Error: ' + error.message);
            addMessage('ai', 'Sorry, I encountered an error: ' + error.message);
        });
    }
    
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const senderDiv = document.createElement('div');
        senderDiv.className = 'message-sender';
        senderDiv.textContent = sender === 'user' ? 'You' : 'DeepSeek';
        
        const textP = document.createElement('p');
        textP.textContent = text;
        
        messageContent.appendChild(senderDiv);
        messageContent.appendChild(textP);
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        
        avatarDiv.appendChild(icon);
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(avatarDiv);
        
        chatHistory.appendChild(messageDiv);
        
        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    function setStatus(state, message) {
        status.textContent = message;
        status.className = 'status';
        
        if (state === 'thinking') {
            status.classList.add('thinking');
        } else if (state === 'error') {
            status.style.color = '#ef4444';
        }
    }
});
