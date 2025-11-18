"""
Integration example for v1 (Python backend)
Shows how to use the Knowledge Base API from Python

Prerequisites:
1. Start Docker services: npm run docker:up (or docker-compose up -d)
2. Start the API server: npm start
3. Install Python dependencies: pip install requests
4. Ensure your .env file has API keys configured

Docker services required:
- PostgreSQL with pgvector (port 5432)
- Neo4j (ports 7474, 7687)
"""

import requests
import json

class KnowledgeBaseClient:
    def __init__(self, base_url='http://localhost:3000/api'):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def health_check(self):
        """Check if the knowledge base is running"""
        response = self.session.get(f'{self.base_url}/health')
        return response.json()
    
    def create_chat(self, chat_type, user_id=None, metadata=None):
        """Create a new chat session"""
        data = {
            'chatType': chat_type,
            'userId': user_id,
            'metadata': metadata or {}
        }
        response = self.session.post(f'{self.base_url}/chat/create', json=data)
        return response.json()
    
    def query(self, chat_id, prompt, data=None, options=None):
        """Send a query to the knowledge base"""
        payload = {
            'chatId': chat_id,
            'prompt': prompt,
            'data': data,
            'options': options or {}
        }
        response = self.session.post(f'{self.base_url}/query', json=payload)
        return response.json()
    
    def query_direct(self, prompt, data=None, options=None):
        """Send a direct query without chat context"""
        payload = {
            'prompt': prompt,
            'data': data,
            'options': options or {}
        }
        response = self.session.post(f'{self.base_url}/query/direct', json=payload)
        return response.json()
    
    def ingest_document(self, content, metadata=None):
        """Ingest a document into the knowledge base"""
        data = {
            'content': content,
            'metadata': metadata or {}
        }
        response = self.session.post(f'{self.base_url}/ingest', json=data)
        return response.json()
    
    def update_user_profile(self, user_id, profile_data):
        """Update user profile"""
        data = {'userId': user_id, **profile_data}
        response = self.session.post(f'{self.base_url}/profile', json=data)
        return response.json()
    
    def get_user_profile(self, user_id):
        """Get user profile"""
        response = self.session.get(f'{self.base_url}/profile/{user_id}')
        return response.json()
    
    def get_chat_history(self, chat_id, limit=50, offset=0):
        """Get chat history"""
        response = self.session.get(
            f'{self.base_url}/chat/{chat_id}/history',
            params={'limit': limit, 'offset': offset}
        )
        return response.json()


def main():
    # Initialize client
    kb = KnowledgeBaseClient()
    
    # 1. Health check
    print("1. Checking health...")
    health = kb.health_check()
    print(f"   Status: {health['status']}\n")
    
    # 2. Create user profile
    print("2. Creating user profile...")
    profile = kb.update_user_profile('webai_user', {
        'username': 'WebAI User',
        'email': 'user@webai.com',
        'preferences': {
            'model': 'gemini-pro',
            'theme': 'dark'
        }
    })
    print(f"   Profile created: {profile['success']}\n")
    
    # 3. Create admin chat
    print("3. Creating admin chat...")
    chat = kb.create_chat('admin', 'webai_user', {
        'source': 'v1-backend',
        'description': 'WebAI v1 admin session'
    })
    chat_id = chat['chat']['chat_id']
    print(f"   Chat ID: {chat_id}\n")
    
    # 4. Ingest webpage data
    print("4. Ingesting webpage summary...")
    doc_result = kb.ingest_document(
        "WebAI is a browser extension that provides AI-powered webpage analysis. "
        "It features summarization, similarity search, and form analysis capabilities.",
        {
            'title': 'WebAI Extension Overview',
            'source': 'v1-backend',
            'type': 'webpage_summary'
        }
    )
    print(f"   Document ingested: {doc_result['success']}\n")
    
    # 5. Query with RAG
    print("5. Querying with RAG...")
    result = kb.query(
        chat_id,
        "What is WebAI and what can it do?",
        options={
            'model': 'gemini-pro',
            'useRAG': True
        }
    )
    print(f"   Response: {result['response']}\n")
    
    # 6. Process data from webpage
    print("6. Processing webpage data...")
    webpage_data = {
        'url': 'https://example.com',
        'title': 'Example Page',
        'forms': [
            {'id': 'form1', 'fields': ['name', 'email']},
            {'id': 'form2', 'fields': ['address', 'phone']}
        ]
    }
    
    data_result = kb.query(
        chat_id,
        "How many forms are on this page and what fields do they have?",
        data=webpage_data,
        options={'processData': True}
    )
    print(f"   Response: {data_result['response']}\n")
    
    # 7. Get chat history
    print("7. Getting chat history...")
    history = kb.get_chat_history(chat_id, limit=10)
    print(f"   Messages in history: {len(history['history'])}\n")
    
    print("✅ Integration example completed successfully!")


if __name__ == '__main__':
    main()

