# ResearchHub AI

ResearchHub AI is a full-stack, AI-powered research paper management platform designed to help users discover, organize, and interact with academic literature using semantic search and large language models.

Built with React, TypeScript, FastAPI, PostgreSQL, and Groq’s Llama 3.3 70B model.

---

## Features

- **Intelligent Paper Discovery**  
  Search research papers from arXiv with structured metadata (title, authors, abstract, publication date).

- **Workspace-Based Organization**  
  Create dedicated workspaces to manage research papers by project or topic.

- **AI Research Assistant**  
  Context-aware chatbot powered by Groq Llama 3.3 70B for summaries, explanations, and research insights.

- **Semantic Vector Search**  
  Embedding-based similarity search using sentence-transformers (all-MiniLM-L6-v2).

- **Secure Authentication**  
  JWT-based authentication with bcrypt password hashing and protected API routes.

- **Modular Full-Stack Architecture**  
  Clean separation between frontend and backend for scalability and maintainability.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Axios

### Backend
- FastAPI
- SQLAlchemy ORM
- Pydantic
- Uvicorn

### AI & NLP
- Groq Llama 3.3 70B
- sentence-transformers (all-MiniLM-L6-v2)

### Database
- PostgreSQL (Production)
- SQLite (Development)

### Security
- JWT Authentication
- bcrypt Password Hashing

---

## Project Structure

```
ResearchHub-AI/
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── .env.example
│
├── frontend/
│   ├── src/
│   ├── package.json
│
├── README.md
└── .gitignore
```

---

## Setup Instructions

### Backend Setup

1. Create and activate virtual environment:

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

2. Configure environment variables:

```bash
copy .env.example .env
```

Edit `.env` and add:

- `GROQ_API_KEY` – Get from https://console.groq.com  
- `SECRET_KEY` – Generate using:
  ```
  openssl rand -hex 32
  ```
- `DATABASE_URL` – Example:
  ```
  postgresql://user:password@localhost/researchhub
  ```
  Or use SQLite:
  ```
  sqlite:///./researchhub.db
  ```

3. Start backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend runs at:
http://127.0.0.1:8000

---

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start development server:

```bash
npm start
```

Frontend runs at:
http://localhost:3000

---

## Usage Workflow

1. **Register / Login** – Authenticate securely using JWT.
2. **Create Workspace** – Organize research by projects.
3. **Search Papers** – Fetch academic papers from arXiv.
4. **Import Papers** – Save selected papers to workspace.
5. **Interact with AI** – Ask contextual questions and receive AI-generated responses.

---

## API Endpoints

### Authentication
- `POST /auth/register` – Register new user
- `POST /auth/login` – Authenticate user and receive JWT

### Papers
- `GET /papers/search` – Search research papers
- `POST /papers/import` – Import paper into workspace

### Workspaces
- `GET /workspaces` – Retrieve user workspaces
- `POST /workspaces` – Create new workspace

### AI Assistant
- `POST /chat` – Send query to AI research assistant

---

## System Requirements

### Software
- Python 3.10+
- Node.js 18+
- PostgreSQL (optional for production)
- Modern browser (Chrome / Edge)

### Hardware
- Minimum 8GB RAM recommended
- Internet connection required for AI model access

---

## Conclusion

ResearchHub AI demonstrates the integration of full-stack web development, secure authentication, semantic vector search, and large language models into a unified research productivity platform. The system highlights real-world application of AI in academic workflow automation.
