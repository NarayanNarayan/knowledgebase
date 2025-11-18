/**
 * Shared test data for all test files
 */

export const testUsers = {
  admin: {
    userId: 'test-admin-user',
    username: 'Admin Test User',
    email: 'admin@test.com',
    phone: '+1-555-0001',
    address: '123 Admin St',
    preferences: { theme: 'dark', role: 'admin' },
    customFields: { department: 'IT', level: 'senior' },
  },
  user: {
    userId: 'test-regular-user',
    username: 'Regular Test User',
    email: 'user@test.com',
    phone: '+1-555-0002',
    address: '456 User Ave',
    preferences: { theme: 'light', notifications: true },
    customFields: { department: 'Sales' },
  },
};

export const testDocuments = [
  {
    content: `Artificial Intelligence and Machine Learning

Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding.

Machine Learning (ML) is a subset of AI that focuses on algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience, without being explicitly programmed.

Key differences:
- AI is the broader concept of machines being able to carry out tasks in a smart way
- ML is a method of data analysis that automates analytical model building
- ML uses algorithms to learn from data and make predictions or decisions

Applications of AI and ML include:
- Natural Language Processing (NLP)
- Computer Vision
- Recommendation Systems
- Autonomous Vehicles
- Healthcare Diagnostics
- Financial Trading
- Robotics`,
    metadata: {
      title: 'AI and ML Fundamentals',
      source: 'test-suite',
      category: 'artificial-intelligence',
      topic: 'basics',
      author: 'Test Suite',
    },
  },
  {
    content: `Deep Learning and Neural Networks

Deep Learning is a subset of machine learning that uses neural networks with multiple layers (hence "deep") to learn and make decisions. These networks are inspired by the structure and function of the human brain.

Neural networks consist of interconnected nodes (neurons) organized in layers:
- Input Layer: Receives the initial data
- Hidden Layers: Process the data through weighted connections
- Output Layer: Produces the final result

Key concepts:
- Forward Propagation: Data flows from input to output
- Backpropagation: Algorithm for training by adjusting weights
- Activation Functions: Determine neuron output (ReLU, Sigmoid, Tanh)
- Loss Functions: Measure prediction error

Popular architectures:
- Convolutional Neural Networks (CNNs) for image processing
- Recurrent Neural Networks (RNNs) for sequence data
- Transformers for natural language processing
- Generative Adversarial Networks (GANs) for content generation`,
    metadata: {
      title: 'Deep Learning Guide',
      source: 'test-suite',
      category: 'deep-learning',
      topic: 'neural-networks',
      author: 'Test Suite',
    },
  },
  {
    content: `Natural Language Processing (NLP)

NLP is a field of AI that focuses on the interaction between computers and human language. It enables computers to understand, interpret, and generate human language in a valuable way.

Core NLP tasks:
- Text Classification: Categorizing text into predefined classes
- Named Entity Recognition (NER): Identifying entities like names, locations, organizations
- Sentiment Analysis: Determining emotional tone of text
- Machine Translation: Converting text from one language to another
- Question Answering: Extracting answers from text
- Text Summarization: Creating concise summaries
- Language Generation: Producing human-like text

Modern NLP uses transformer models like:
- BERT (Bidirectional Encoder Representations from Transformers)
- GPT (Generative Pre-trained Transformer)
- T5 (Text-to-Text Transfer Transformer)
- BART (Bidirectional and Auto-Regressive Transformers)

Applications:
- Virtual assistants (Siri, Alexa, Google Assistant)
- Chatbots and conversational AI
- Language translation services
- Content moderation
- Automated customer support
- Text analysis and insights`,
    metadata: {
      title: 'NLP Overview',
      source: 'test-suite',
      category: 'nlp',
      topic: 'language-processing',
      author: 'Test Suite',
    },
  },
  {
    content: `Computer Vision

Computer Vision is a field of AI that trains computers to interpret and understand the visual world. Using digital images and videos, computer vision systems can identify and classify objects, detect patterns, and make decisions.

Key tasks:
- Image Classification: Identifying what's in an image
- Object Detection: Locating and classifying multiple objects
- Image Segmentation: Dividing image into segments
- Face Recognition: Identifying individuals
- Optical Character Recognition (OCR): Reading text from images
- Image Generation: Creating new images

Techniques:
- Convolutional Neural Networks (CNNs) for feature extraction
- Transfer Learning using pre-trained models
- Data Augmentation to increase dataset diversity
- Object Detection algorithms (YOLO, R-CNN)

Applications:
- Autonomous vehicles for navigation
- Medical image analysis
- Security and surveillance
- Augmented reality
- Quality control in manufacturing
- Retail and e-commerce`,
    metadata: {
      title: 'Computer Vision Guide',
      source: 'test-suite',
      category: 'computer-vision',
      topic: 'image-processing',
      author: 'Test Suite',
    },
  },
  {
    content: `Reinforcement Learning

Reinforcement Learning (RL) is a type of machine learning where an agent learns to make decisions by interacting with an environment. The agent receives rewards or penalties for its actions and learns to maximize cumulative reward.

Key components:
- Agent: The learner or decision maker
- Environment: The world the agent interacts with
- Actions: What the agent can do
- States: Current situation of the environment
- Rewards: Feedback signal for actions
- Policy: Strategy for selecting actions

Learning process:
1. Agent observes current state
2. Agent selects an action based on policy
3. Environment transitions to new state
4. Agent receives reward
5. Agent updates policy to maximize future rewards

Applications:
- Game playing (Chess, Go, video games)
- Robotics and autonomous systems
- Recommendation systems
- Resource management
- Trading algorithms
- Personalized content delivery`,
    metadata: {
      title: 'Reinforcement Learning',
      source: 'test-suite',
      category: 'reinforcement-learning',
      topic: 'rl-basics',
      author: 'Test Suite',
    },
  },
];

