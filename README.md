# RAG Assistant

A minimal end‑to‑end Retrieval‑Augmented Generation (RAG) app.  
Upload a PDF on the client, create embeddings on the backend (MongoDB Atlas Vector Search), and ask questions that are answered with OpenAI using the most relevant chunks.

## ✨ Features

- **PDF upload & chunking** on the client (UI built with React + shadcn/ui + lucide icons).
- **Embeddings** with `@langchain/community` using the local HF model **Xenova/all-MiniLM-L6-v2**.
- **MongoDB Atlas Vector Search** for storing and retrieving chunks.
- **OpenAI chat completion** (`gpt-4.1`) to generate answers from retrieved context.
- **Rate limiting** on vector routes (4 requests / 5 minutes per IP).
- **Local persistence** for counters and chat history via `localStorage`.

---

## 🧱 Architecture

```
client/
  └─ React UI (RAGProcessor, DocumentUpload, ChatInterface, stats cards)
backend/
  ├─ Express app + routers
  ├─ Embedding pipeline (PDFLoader -> TextSplitter -> Embeddings -> MongoDB)
  └─ Search pipeline (embed query -> $vectorSearch -> compose context -> OpenAI)
```

### Data Flow

1. **Client**
   - User uploads a PDF.
   - `RAGProcessor.chunkDocument(file, 800, 200, cb)` chunks it and shows stats.
   - User asks a question → `POST {VITE_BASE_API}/vector/search` with `{ query }`.
2. **Backend**
   - `POST /api/vector/create-embedding`: multer saves the file, service creates embeddings and stores documents in MongoDB.
   - `POST /api/vector/search`: embeds the query, runs `$vectorSearch`, builds a context string, and calls OpenAI for the final answer.
3. **Client**
   - Displays the answer + maintains a lightweight chat history and counters in `localStorage`.

---

## 🧰 Tech Stack

- **Client:** React, shadcn/ui (Button, Card, Textarea, etc.), lucide-react, Vite env (`VITE_BASE_API`).
- **Backend:** Node.js, Express, Multer, CORS.
- **LangChain:** `@langchain/community` PDFLoader, text splitters, HF Transformers embeddings.
- **Vector DB:** MongoDB Atlas Vector Search (`MongoDBAtlasVectorSearch`).
- **LLM:** OpenAI Chat Completions (`gpt-4.1`).

---

## 📁 Important Code Paths (Backend)

- **Server bootstrap**

  - `createApp(config, MongoDbclient, OpenAInit)` sets up JSON, CORS, routes, and global error middleware.
  - `server()` initializes Mongo, OpenAI, then starts Express on `config.PORT`.

- **Routes**

  - `POST /api/vector/create-embedding` → file upload (`upload.single("file")`) → `embeddingController.create()`.
  - `POST /api/vector/search` → JSON `{ query }` → `embeddingController.search()`.
  - Each route is rate‑limited: **4 requests per 5 minutes**.

- **Embedding Service (`embeddingService`)**

  - Loads a PDF: `PDFLoader(filePath)`
  - Splits with `RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 200 })`
  - Embeds with `HuggingFaceTransformersEmbeddings("Xenova/all-MiniLM-L6-v2")`
  - Persists using `MongoDBAtlasVectorSearch.addDocuments(...)`

- **Search Service**
  - Embeds the query with the same HF model.
  - `$vectorSearch` pipeline returns top matches (limit 5).
  - Concatenates context and calls OpenAI (`model: "openai/gpt-4.1"`).

---

## 🔐 Environment Variables

### Client

```
VITE_BASE_API=http://localhost:4000/api
```

### Backend

```
PORT=4000
ALLOW_ORIGIN=http://localhost:5173

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ENDPOINT=https://api.openai.com/v1

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_ATLAS_DB=your_db_name
MONGODB_ATLAS_COLLECTION=your_collection_name
```

> `InitDb()` should use `MONGODB_URI` (or your chosen var) to connect and provide a `MongoClient`.

---

## ▶️ Running Locally

### 1) Backend

```bash
cd backend
npm i        # or npm i / yarn
npm run dev     # or  pnpm dev
# server starts on PORT, e.g., http://localhost:4000
```

### 2) Client

```bash
cd client
npm i
npm run dev
# app starts e.g. on http://localhost:5173
```

Ensure CORS origins align: `ALLOW_ORIGIN` should include your client URL.

---

## 📡 API Endpoints

### Create Embeddings

`POST /api/vector/create-embedding`

- **Body:** `multipart/form-data` with `file=<PDF>`
- **Rate limit:** 4 req / 5 min

**cURL**

```bash
curl -X POST http://localhost:4000/api/vector/create-embedding \
  -H "Accept: application/json" \
  -F "file=@/path/to/document.pdf"
```

**Response**

```json
{ "msg": "embeddings created successfully" }
```

or

```json
{ "msg": "vector embedding created" }
```

### Vector Search

`POST /api/vector/search`

- **Body:** `application/json`

```json
{ "query": "What does the document say about X?" }
```

**cURL**

```bash
curl -X POST http://localhost:4000/api/vector/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Summarize section 3"}'
```

**Response**

```json
{
  "data": {
    "answer": "… LLM answer based on retrieved context …",
    "sources": [
      { "pageContent": "...", "metadata": { ... } },
      ...
    ]
  },
  "msg": "vector search successful"
}
```

> The client expects `response.data.answer` in its current implementation.

---

## 🧩 Client Notes

- Displays counters/statistics from state or `localStorage`:
  - documents uploaded (`document`),
  - questions answered (`answers`),
  - chunks created (`chunk`).
- Only **one document is processed** at a time in the current UI.
- `ChatInterface` shows the latest answer and preserves a simple chat history in `localStorage`.

---

## ⚙️ Configuration & Tuning

- **Chunking:** Adjust in the client (`RAGProcessor.chunkDocument(file, 800, 200)`) and/or backend split logic for consistency.
- **Top‑K:** `$vectorSearch` currently returns `limit: 5`. Tweak `numCandidates` and `limit` for accuracy vs. cost.
- **Model Choice:** The embedding model is local (`Xenova/...`) while the generation model is OpenAI (`gpt-4.1`). You can swap or unify them as needed.
- **Rate Limiting:** Adjust `windowMs` and `limit` in `VectorEmbeddingRouter`.

---

## 🧯 Error Handling

- Centralized with `GlobalErrorMiddleware` and `GlobalErrorHandler` (custom).
- Controllers catch errors and pass enriched details to the middleware.
- On the client, `toast()` shows user‑friendly messages for processing/generation errors.

---

## 🔒 Security Considerations

- No authentication is built in; add auth middleware before exposing publicly.
- Validate mime types and file sizes for uploads (`multer` config).
- Sanitize/limit `query` input to avoid prompt abuse.
- Enforce CORS carefully for production.
- Don’t log secrets; rotate `OPENAI_API_KEY` if leaked.

---

## 🚧 Known Limitations

- Client UI processes a **single PDF** at a time.
- Embeddings are created from PDFs only (no plain text or other formats in current route).
- Simple prompt template; no citations highlighting/snippets beyond the raw source list.
- No streaming responses on the client.

---

## 📜 License

---

## 🙌 Acknowledgements

- LangChain community packages
- MongoDB Atlas Vector Search
- OpenAI API
- Xenova Transformers (ONNX/JS embeddings)
