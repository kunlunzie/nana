// Definisi Abjad (Anda bisa menambahkan gambar atau contoh kata jika diinginkan)
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
let currentLetterIndex = 0;
let score = 0;
let timer = 60; // Waktu dalam detik
let timerInterval;
const maxStars = 10; // Jumlah bintang yang bisa dikumpulkan

// Mendapatkan elemen-elemen DOM
const currentLetterEl = document.getElementById('current-letter');
const answerInput = document.getElementById('answer-input');
const checkButton = document.getElementById('check-button');
const feedbackMessage = document.getElementById('feedback-message');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const leaderboardList = document.getElementById('leaderboard-list');
const starCollection = document.getElementById('star-collection');
const playSoundButton = document.getElementById('play-sound-button');

// Menggunakan Web Speech API untuk suara huruf
const synth = window.speechSynthesis;

// Inisialisasi Game saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Memastikan kode game hanya berjalan di halaman game.html
    if (currentLetterEl) { 
        startGame();
        // Menambahkan event listener untuk tombol dan input di halaman game
        checkButton.addEventListener('click', checkAnswer);
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
        playSoundButton.addEventListener('click', playCurrentLetterSound);
    }
    // Tidak ada logika khusus untuk index.html selain tombol redirect
});

/**
 * Memulai permainan abjad.
 * Mengatur ulang skor, timer, menampilkan huruf pertama, dan memulai timer.
 */
function startGame() {
    score = 0;
    timer = 60;
    scoreEl.textContent = score;
    timerEl.textContent = timer;
    feedbackMessage.textContent = '';
    answerInput.value = '';
    currentLetterIndex = 0; // Selalu mulai dari 'A'
    displayNewLetter();
    startTimer();
    updateLeaderboard(); // Memuat papan peringkat saat game dimulai
    initializeStars(); // Menggambar ulang bintang
}

/**
 * Menampilkan huruf abjad yang baru untuk ditebak.
 * Juga membersihkan input jawaban dan fokuskan kembali.
 */
function displayNewLetter() {
    currentLetterEl.textContent = alphabet[currentLetterIndex];
    answerInput.value = '';
    answerInput.focus(); // Fokuskan input untuk kemudahan pengguna
    feedbackMessage.textContent = ''; // Hapus pesan feedback sebelumnya
}

/**
 * Mengecek jawaban pengguna dengan huruf yang benar.
 * Memperbarui skor dan memberikan feedback.
 */
function checkAnswer() {
    const userAnswer = answerInput.value.toUpperCase();
    const correctAnswer = alphabet[currentLetterIndex];

    if (userAnswer === correctAnswer) {
        score += 10; // Tambah skor
        feedbackMessage.textContent = '👍 Benar sekali!';
        feedbackMessage.style.color = 'green';
        collectStar(); // Panggil fungsi kumpulkan bintang
        // Lanjut ke huruf berikutnya atau acak (di sini kita lanjut berurutan)
        currentLetterIndex = (currentLetterIndex + 1) % alphabet.length; // Loop abjad
    } else {
        score = Math.max(0, score - 5); // Kurangi skor, minimal 0
        feedbackMessage.textContent = `❌ Salah! Huruf yang benar adalah "${correctAnswer}".`;
        feedbackMessage.style.color = 'red';
    }
    scoreEl.textContent = score;
    displayNewLetter(); // Tampilkan huruf baru setelah cek
    updateLeaderboard(); // Update papan peringkat setelah setiap jawaban
}

/**
 * Memulai timer permainan.
 * Ketika timer habis, permainan berakhir.
 */
function startTimer() {
    clearInterval(timerInterval); // Bersihkan interval sebelumnya jika ada
    timerInterval = setInterval(() => {
        timer--;
        timerEl.textContent = timer;
        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000); // Setiap 1 detik
}

/**
 * Mengakhiri permainan.
 * Memberi tahu skor akhir dan menawarkan untuk menyimpan skor ke papan peringkat.
 */
function endGame() {
    alert(`Waktu habis! Skormu: ${score}. Yuk, coba lagi untuk skor yang lebih tinggi!`);
    saveScore(score); // Simpan skor ke localStorage
    // Opsional: bisa tambahkan tombol restart di UI daripada reload halaman
    location.reload(); // Reload halaman untuk memulai ulang game
}

---

### **Fitur Menarik**

---

### Fitur 1: Papan Peringkat (Leaderboard)

/**
 * Menyimpan skor pengguna ke localStorage.
 * Meminta nama pengguna dan membatasi daftar skor tertinggi.
 * @param {number} newScore - Skor yang akan disimpan.
 */
function saveScore(newScore) {
    let highScores = JSON.parse(localStorage.getItem('abjadCeriaHighScores')) || [];
    const playerName = prompt("Selamat! Kamu masuk papan peringkat! Masukkan namamu:") || "Pemain Anonim";
    
    // Tambahkan skor baru
    highScores.push({ name: playerName, score: newScore });
    
    // Urutkan dari skor tertinggi ke terendah
    highScores.sort((a, b) => b.score - a.score); 
    
    // Ambil 5 skor tertinggi saja
    highScores = highScores.slice(0, 5); 
    
    // Simpan kembali ke localStorage
    localStorage.setItem('abjadCeriaHighScores', JSON.stringify(highScores));
}

/**
 * Memperbarui tampilan papan peringkat dari data di localStorage.
 */
function updateLeaderboard() {
    const highScores = JSON.parse(localStorage.getItem('abjadCeriaHighScores')) || [];
    leaderboardList.innerHTML = ''; // Kosongkan daftar yang ada

    if (highScores.length === 0) {
        leaderboardList.innerHTML = '<li>Belum ada skor tinggi. Mainkan gamenya!</li>';
        return;
    }

    highScores.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${index + 1}. ${entry.name} (<span style="font-weight: bold; color: #4CAF50;">${entry.score}</span>)`;
        leaderboardList.appendChild(listItem);
    });
}

---

### Fitur 2: Koleksi Bintang (Rewards System)

let collectedStars = 0; // Jumlah bintang yang sudah terkumpul

/**
 * Menginisialisasi tampilan bintang di awal permainan.
 * Menggambar bintang yang belum terkumpul.
 */
function initializeStars() {
    collectedStars = 0; // Reset bintang saat game baru dimulai
    starCollection.innerHTML = ''; // Bersihkan bintang sebelumnya
    for (let i = 0; i < maxStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star'); // Hanya tambahkan kelas 'star'
        starCollection.appendChild(star);
    }
}

/**
 * Menambahkan satu bintang ke koleksi saat jawaban benar.
 * Memberikan feedback jika mencapai milestone bintang.
 */
function collectStar() {
    if (collectedStars < maxStars) {
        collectedStars++;
        const stars = starCollection.querySelectorAll('.star');
        // Pastikan indeks bintang yang diubah sesuai
        stars[collectedStars - 1].classList.add('collected');

        // Contoh: Beri hadiah setiap 5 bintang
        if (collectedStars % 5 === 0) {
            alert(`🌟 Selamat! Kamu telah mengumpulkan ${collectedStars} bintang! Kamu hebat! Terus belajar!`);
            // Di sini Anda bisa menambahkan logika untuk membuka konten atau tema baru
        }
    }
}

---

### Fitur 3: Suara Huruf (Audio Reinforcement)

/**
 * Memainkan suara dari huruf yang sedang ditampilkan menggunakan Web Speech API.
 */
function playCurrentLetterSound() {
    const textToSpeak = currentLetterEl.textContent;
    if (textToSpeak && synth) { // Pastikan ada teks dan Web Speech API tersedia
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'id-ID'; // Set bahasa ke Indonesia (penting untuk pelafalan)
        utterance.pitch = 1; // Nada suara (0 to 2)
        utterance.rate = 0.8; // Kecepatan bicara (0.1 to 10), sedikit lebih lambat agar jelas
        synth.speak(utterance);
    } else {
        console.warn("Web Speech API tidak didukung atau tidak ada teks untuk diucapkan.");
    }
}