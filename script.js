const letters = [
  {ltr:'ا', word:'أسد'}, {ltr:'ب', word:'باب'}, {ltr:'ت', word:'تفاح'},
  {ltr:'ث', word:'ثعلب'}, {ltr:'ج', word:'جمل'}, {ltr:'ح', word:'حصان'},
  {ltr:'خ', word:'خبز'}, {ltr:'د', word:'دب'}, {ltr:'ذ', word:'ذهب'},
  {ltr:'ر', word:'رمان'}, {ltr:'ز', word:'زرافة'}, {ltr:'س', word:'سمك'},
  {ltr:'ش', word:'شمعة'}, {ltr:'ص', word:'صقر'}, {ltr:'ض', word:'ضفدع'},
  {ltr:'ط', word:'طائر'}, {ltr:'ظ', word:'ظرف'}, {ltr:'ع', word:'عنب'},
  {ltr:'غ', word:'غزال'}, {ltr:'ف', word:'فيل'}, {ltr:'ق', word:'قمر'},
  {ltr:'ك', word:'كتاب'}, {ltr:'ل', word:'ليمون'}, {ltr:'م', word:'موز'},
  {ltr:'ن', word:'نمل'}, {ltr:'ه', word:'هدهد'}, {ltr:'و', word:'وردة'},
  {ltr:'ي', word:'يقطين'}
];

const grid = document.getElementById('grid');
const big = document.getElementById('big');
const synth = window.speechSynthesis;

function renderGrid(arr) {
  grid.innerHTML = '';
  arr.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="letter">${item.ltr}</div><div class="example">${item.word}</div>`;
    card.onclick = () => { showBig(item); speakText(item.ltr + ' ... ' + item.word); };
    grid.appendChild(card);
  });
}
renderGrid(letters);

function showBig(item) {
  big.classList.remove('hidden');
  big.textContent = item.ltr;
  setTimeout(() => big.classList.add('hidden'), 2500);
}

// Female Arabic voice preference
function speakText(text, letterOnly = false) {
  if (!('speechSynthesis' in window)) {
    alert('جهازك لا يدعم النطق التلقائي');
    return;
  }

  synth.cancel();

  // 🔹 If the text is just a single Arabic letter, wrap it in a small phrase
  let speakPhrase = text.trim();
  if (letterOnly && /^[\u0621-\u064A]$/.test(speakPhrase)) {
    speakPhrase = 'حرف ' + speakPhrase; // e.g. "حرف باء"
  }

  const utterance = new SpeechSynthesisUtterance(speakPhrase);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.9;
  utterance.pitch = 1.1;

  // Choose a known Arabic voice if available
  const voices = synth.getVoices();
  const arVoice = voices.find(v =>
    v.lang.startsWith('ar') &&
    (v.name.includes('Hoda') || v.name.includes('Naayem') || v.name.includes('Google'))
  );
  if (arVoice) utterance.voice = arVoice;

  synth.speak(utterance);
}
 

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => synth.getVoices();
}


document.getElementById('speakAll').onclick = async () => {
  for (const item of letters) {
    speakText(item.ltr + ' ... ' + item.word);
    await new Promise(r => setTimeout(r, 900));
  }
};

document.getElementById('shuffle').onclick = () => {
  const shuffled = [...letters].sort(() => Math.random() - 0.5);
  renderGrid(shuffled);
};

const quizBox = document.getElementById('quiz');
const startQuizBtn = document.getElementById('startQuiz');
const playSoundBtn = document.getElementById('playSound');
const optionsDiv = document.getElementById('options');
const scoreP = document.getElementById('score');
const nextQ = document.getElementById('nextQ');
const endQuiz = document.getElementById('endQuiz');

let quizState = {questions: [], current: 0, score: 0};

function prepareQuiz(num = 8) {
  const pool = [...letters];
  const qs = [];
  for (let i = 0; i < num; i++) {
    if (pool.length === 0) pool.push(...letters);
    const correct = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const wrongs = [];
    while (wrongs.length < 3) {
      const cand = letters[Math.floor(Math.random() * letters.length)];
      if (cand.ltr !== correct.ltr && !wrongs.includes(cand)) wrongs.push(cand);
    }
    const choices = [correct, ...wrongs].sort(() => Math.random() - 0.5);
    qs.push({correct, choices});
  }
  return qs;
}

function startQuiz() {
  quizState.questions = prepareQuiz(8);
  quizState.current = 0;
  quizState.score = 0;
  quizBox.classList.remove('hidden');
  grid.classList.add('hidden');
  showQuestion();
}

function showQuestion() {
  const q = quizState.questions[quizState.current];
  optionsDiv.innerHTML = '';
  q.choices.forEach(c => {
    const b = document.createElement('button');
    b.className = 'option';
    b.textContent = c.ltr + ' — ' + c.word;
    b.onclick = () => selectOption(c);
    optionsDiv.appendChild(b);
  });
  scoreP.textContent = `السؤال ${quizState.current + 1} من ${quizState.questions.length} — نقاط: ${quizState.score}`;
  speakPlayCorrect();
}

function speakPlayCorrect() {
  const q = quizState.questions[quizState.current];
  speakText(q.correct.word);
}

function selectOption(choice) {
  const q = quizState.questions[quizState.current];
  if (choice.ltr === q.correct.ltr) {
    quizState.score++;
    alert('صحيح! 👍');
  } else {
    alert('خطأ — الحرف الصحيح: ' + q.correct.ltr + ' (' + q.correct.word + ')');
  }
}

playSoundBtn.onclick = () => speakPlayCorrect();

nextQ.onclick = () => {
  quizState.current++;
  if (quizState.current >= quizState.questions.length) {
    alert('انتهى الاختبار. مجموع نقاطك: ' + quizState.score + ' من ' + quizState.questions.length);
    endQuizFunc();
    return;
  }
  showQuestion();
};

endQuiz.onclick = () => endQuizFunc();

function endQuizFunc() {
  quizBox.classList.add('hidden');
  grid.classList.remove('hidden');
}

startQuizBtn.onclick = startQuiz;
