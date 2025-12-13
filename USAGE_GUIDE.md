# 📖 Usage Guide - Study Game App

## Getting Started

Welcome to Study Game! This guide will help you make the most of your study sessions.

## Creating Your First Exam

### Step 1: Prepare Your PDF

- Make sure your PDF contains readable text (not scanned images)
- Organize your content with clear sentences and paragraphs
- Include definitions, facts, and explanatory content
- Keep file size under 10MB

### Step 2: Upload and Configure

1. Click "Create New Exam" on the home page
2. Upload your PDF file
3. Give your exam a memorable name (e.g., "Biology Chapter 5")
4. Choose the number of questions (5-20)
5. Click "Create Exam"

### Step 3: Wait for Processing

The app will:

- Extract text from your PDF
- Identify key concepts and terms
- Generate various question types
- Save the exam locally

## Taking an Exam

### Starting an Exam

1. Click "Take an Exam" on the home page
2. Select from your created exams
3. Click "Start Exam"

### Question Types You'll Encounter

#### 1. Fill-in-the-Blank

- A sentence with a missing word
- Type the correct word
- Minor spelling mistakes are forgiven!

**Example:**

> The **\_** is the powerhouse of the cell.
> **Answer:** mitochondria (or mitochondrion)

#### 2. Multiple Choice

- Choose the correct answer from 4 options
- Only one correct answer
- 10 points per correct answer

**Example:**

> Photosynthesis occurs in the **\_**.
>
> - A) Nucleus
> - B) Mitochondria
> - **C) Chloroplast** ✓
> - D) Ribosome

#### 3. True/False

- Decide if the statement is true or false
- Quick and simple
- 5 points per correct answer

**Example:**

> Water is composed of hydrogen and oxygen.
> **Answer:** True ✓

#### 4. Short Answer

- Type a short answer (word or phrase)
- Based on definitions or concepts
- 20 points per correct answer

**Example:**

> What is photosynthesis?
> **Answer:** The process by which plants convert light energy into chemical energy

## Gamification Features

### Points System

- **Fill-in-the-blank:** 15 points
- **Multiple Choice:** 10 points
- **True/False:** 5 points
- **Short Answer:** 20 points

### Streak Counter 🔥

- Increases with each consecutive correct answer
- Resets when you answer incorrectly or skip
- Displayed in real-time during the exam

### Progress Tracking

- See how many questions you've completed
- Visual progress bar
- Total points earned

### Final Results

- Percentage score
- Correct vs. total questions
- Total points earned
- Pass/Fail indicator (60% threshold)

## Tips for Best Results

### Creating Better Exams

1. **Use Quality PDFs**

   - Clear, well-formatted text
   - Proper paragraphs and sentences
   - Avoid heavily formatted or image-heavy PDFs

2. **Content Structure**

   - Include definitions
   - Use complete sentences
   - Have clear concepts and facts
   - Mix different types of information

3. **Optimal Length**
   - 2-5 pages works best
   - Too short: not enough content for questions
   - Too long: may take longer to process

### Taking Exams

1. **Don't Stress About Spelling**

   - The app uses smart matching
   - Minor typos are accepted
   - Focus on understanding, not perfect spelling

2. **Read Carefully**

   - Take your time with each question
   - Multiple choice: eliminate wrong answers first
   - True/False: look for absolute words (always, never)

3. **Use the Skip Feature**

   - Stuck on a question? Skip it!
   - Resets your streak but doesn't affect score
   - Better than guessing randomly

4. **Practice Regularly**
   - Take exams multiple times
   - Learn from mistakes
   - Build your streak record

## Understanding the Grading

### Exact Match

- Correct answer matches exactly (ignoring case/punctuation)
- **Score:** 100%

### Fuzzy Match

- Answer is close to correct answer
- Uses Levenshtein distance algorithm
- **Threshold:** 75% similarity
- **Examples:**
  - "mitocondria" → "mitochondria" ✓ (typo accepted)
  - "fotosynthesis" → "photosynthesis" ✓ (typo accepted)
  - "cell" → "nucleus" ✗ (different words)

### Normalization

The app automatically:

- Removes punctuation
- Ignores capitalization
- Trims extra spaces
- Compares core content

## Managing Your Exams

### Local Storage

- All exams saved in your browser
- No account needed
- Private and secure
- Works offline after creation

### Multiple Exams

- Create unlimited exams
- Each exam saved separately
- Take any exam multiple times
- Progress tracked individually

### Data Privacy

- Everything stays on your device
- No data sent to servers
- PDFs processed locally
- Clear browser data to reset

## Troubleshooting

### "Could not extract text from PDF"

**Solution:**

- Ensure PDF has readable text (not scanned images)
- Try OCR software if you have scanned pages
- Convert images to text-based PDFs

### "Could not generate questions"

**Solution:**

- PDF needs more content (at least 100 words)
- Use well-structured text with complete sentences
- Try reducing number of questions

### Exam not saving

**Solution:**

- Check browser storage permissions
- Clear some browser data if storage is full
- Try a different browser

### App not loading

**Solution:**

- Clear browser cache
- Check internet connection (needed for initial load)
- Try in incognito/private mode

## Best Practices

### For Students

1. Create separate exams for each chapter/topic
2. Take exams multiple times to reinforce learning
3. Review incorrect answers
4. Challenge yourself with more questions
5. Track your improvement over time

### For Educators

1. Provide well-structured study materials
2. Include key concepts and definitions
3. Use clear, unambiguous language
4. Test PDFs before sharing with students
5. Encourage regular practice

## Keyboard Shortcuts

- **Enter:** Submit text answers
- **Tab:** Navigate between options
- **Arrow Keys:** Select in multiple choice
- **Escape:** (future feature) Pause exam

## Coming Soon (Ideas for Enhancement)

- Dark mode
- Export results as PDF
- Timed exams mode
- Difficulty levels
- Custom question types
- Study statistics dashboard
- Share exams with friends

## Need More Help?

- Check the README.md for technical details
- Review the DEPLOYMENT.md for hosting information
- Open an issue on GitHub for bugs or suggestions

---

Happy studying! 📚✨
