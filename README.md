# MedBrief AI - Medical Report Summarizer

An AI-powered web application that processes medical reports (PDFs and images) and generates comprehensive, patient-friendly summaries using advanced AI models.

## 🚀 Features

- **File Upload**: Support for PDF and image files (JPEG, PNG)
- **AI Summarization**: Powered by Groq API for intelligent medical report analysis
- **Multiple Formats**: Download summaries as PDF, JPG, or share via WhatsApp/Email
- **User Authentication**: Secure login/signup with Supabase
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Processing**: Live status updates during file processing

## 🛠️ Tech Stack

### Frontend
- React 19 with Vite
- Supabase for authentication
- HTML2Canvas & jsPDF for file generation
- PDF.js for PDF previews
- Modern CSS with responsive design

### Backend
- Node.js with Express
- Multer for file uploads
- PDF.js for text extraction
- Tesseract.js for OCR (image processing)
- Puppeteer for PDF generation
- Groq API for AI summarization

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Groq API key ([Get one here](https://console.groq.com/))

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd medbrief-ai
npm run install:all
```

### 2. Backend Setup
```bash
cd backend

# Option A: Copy from example file
cp env.example .env
# Then edit .env and replace 'your_groq_api_key_here' with your actual API key

# Option B: Create manually
# Create a new file called .env with this content:
# GROQ_API_KEY=your_actual_groq_api_key_here
# PORT=3001
# NODE_ENV=development

cd ..

# Option C: Use the setup script (Windows)
npm run setup:env
# Then edit backend/.env with your actual API key
```

### 3. Start Development Servers
```bash
# Run both frontend and backend simultaneously
npm run dev:full

# Or run separately:
# Terminal 1: npm run dev (frontend on :5173)
# Terminal 2: npm run backend (backend on :3001)
```

## 🔧 Configuration

### Environment Variables
**IMPORTANT**: You must create a `.env` file in the `backend/` directory with your Groq API key.

The file should contain:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
PORT=3001
NODE_ENV=development
```

**Note**: Without a valid Groq API key, the AI summarization features will not work.

### Supabase Configuration
The app is pre-configured with Supabase for authentication. Update credentials in `src/supabaseClient.js` if needed.

## 📱 Usage

1. **Upload Files**: Drag & drop or browse for medical reports
2. **Generate Summary**: Click "Generate Summary" to process files
3. **View Results**: AI-generated summaries with patient-friendly explanations
4. **Download/Share**: Export as PDF/JPG or share via WhatsApp/Email

## 🏗️ Project Structure

```
medbrief-ai/
├── src/
│   ├── Components/          # React components
│   ├── CSS/                # Component styles
│   ├── services/           # API services
│   └── supabaseClient.js   # Supabase configuration
├── backend/                # Node.js server
│   ├── index.js           # Main server file
│   ├── package.json       # Backend dependencies
│   ├── .env               # Environment variables (create this!)
│   └── env.example        # Example environment file
├── public/                 # Static assets
└── package.json           # Frontend dependencies
```

## 🔌 API Endpoints

- `POST /upload` - Upload medical files for AI processing
- Returns structured summaries with download links

## 📁 File Support

- **PDFs**: Text extraction and analysis
- **Images**: OCR processing for text recognition
- **Size Limit**: 10MB per file
- **Batch Processing**: Up to 10 files per request

## 🎨 Customization

- Modify AI prompts in `backend/index.js`
- Update styling in component CSS files
- Configure Supabase settings in `supabaseClient.js`

## 🐛 Troubleshooting

- **Backend not starting**: Check Node.js version and dependencies
- **File upload fails**: Verify file size and format
- **AI processing errors**: Check Groq API key and quota
- **CORS issues**: Ensure backend is running on port 3001
- **Missing .env file**: Create `.env` file in backend folder with your API key

## 📄 License

This project is licensed under the [MIT License](./LICENSE) © 2025 [Krishna](https://github.com/krishnasingh34).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.
