# 🎮 Study Game - Interactive Exam Practice App

A beautiful, gamified study application built with React that transforms your PDF study materials into interactive practice exams. Features smart question generation, lenient grading with fuzzy matching, and an engaging user experience.

![Study Game](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 📚 **PDF Upload & Processing** - Upload your study materials and let the app extract the content
- 📷 **OCR Support** - ✨ NEW! Works with handwritten notes and scanned PDFs using Tesseract.js OCR
- 🤖 **Smart Question Generation** - Automatically generates multiple question types:
  - Fill-in-the-blank
  - Multiple choice
  - True/False
  - Short answer
- 🎮 **Gamification** - Points, streaks, and progress tracking to keep you motivated
- ✨ **Forgiving Grading** - Uses fuzzy matching to ignore minor spelling mistakes
- 💾 **Local Storage** - All your exams and progress saved in your browser
- 🎨 **Beautiful UI/UX** - Modern design with smooth animations and transitions
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/JustThatRandomCoder/study-app.git
cd study-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🌐 Deploy to GitHub Pages

1. Make sure your `package.json` has the correct `homepage` field:

```json
"homepage": "https://JustThatRandomCoder.github.io/study-app"
```

2. Install gh-pages (if not already installed):

```bash
npm install --save-dev gh-pages
```

3. Deploy:

```bash
npm run deploy
```

Your app will be live at `https://JustThatRandomCoder.github.io/study-app`

## 🎯 How to Use

### Creating an Exam

1. Click **"Create New Exam"** on the home page
2. Upload a PDF file containing your study material
3. Configure the exam (name and number of questions)
4. Wait while the app generates questions
5. Your exam is ready!

### Taking an Exam

1. Click **"Take an Exam"** on the home page
2. Select from your created exams
3. Answer questions one by one
4. Get immediate feedback with points and streaks
5. View your results and performance stats

## 🏗️ Project Structure

```
study-app/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── CreateExam.js
│   │   └── TakeExam.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── HomePage.css
│   │   ├── CreateExam.css
│   │   └── TakeExam.css
│   ├── utils/
│   │   ├── pdfProcessor.js
│   │   ├── questionGenerator.js
│   │   └── storage.js
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🛠️ Technologies Used

- **React 18** - UI framework
- **React Router** - Navigation and routing
- **PDF.js** - PDF text extraction
- **Tesseract.js** - OCR for handwritten/scanned PDFs
- **Local Storage API** - Data persistence
- **CSS3** - Styling with animations and gradients
- **GitHub Pages** - Hosting

## 🎨 Features in Detail

### Question Generation

The app uses intelligent pattern matching and NLP techniques to generate various question types:

- Identifies key terms and concepts
- Creates contextual questions
- Generates plausible distractors for multiple choice
- Maintains question quality and relevance

### Fuzzy Matching

The grading system is forgiving and smart:

- Uses Levenshtein distance algorithm
- Ignores capitalization and punctuation
- Accepts answers with minor spelling errors
- Configurable similarity threshold (default: 75%)

### Gamification

Stay motivated with engaging features:

- **Points System** - Earn points for correct answers
- **Streak Counter** - Track consecutive correct answers
- **Progress Tracking** - See your improvement over time
- **Statistics** - Total exams, accuracy, and best streaks

## 🔒 Privacy

All data is stored locally in your browser. No data is sent to any server. Your study materials and progress remain completely private.

## 🐛 Troubleshooting

### PDF Upload Issues

- **Text-based PDFs:** Extract instantly
- **Scanned/Handwritten PDFs:** Automatically detected and processed with OCR (takes 1-2 minutes per page)
- File size should be under 10MB
- For best OCR results, ensure scans are clear and well-lit

### Questions Not Generated

- The PDF needs sufficient text content (at least 100 characters)
- Try adjusting the number of questions
- Complex formatting in PDFs may affect extraction
- For scanned documents, make sure the handwriting is legible

### OCR Performance

- OCR processing is slower than regular text extraction (1-2 minutes per page)
- For faster results, use text-based PDFs when possible
- Better scan quality = better OCR results

## 📝 License

MIT License - feel free to use this project for your own learning!

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🌟 Acknowledgments

- PDF.js library for PDF processing
- React team for the amazing framework
- Inspiration from various educational apps

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ for students everywhere
