document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const nameModal = document.getElementById('name-modal');
    const nameInput = document.getElementById('name-input');
    const startBtn = document.getElementById('start-btn');
    const displayName = document.getElementById('display-name');
    const welcomeName = document.getElementById('welcome-name');
    const userProfile = document.getElementById('user-profile');
    
    const mainMenu = document.getElementById('main-menu');
    const cardsView = document.getElementById('cards-view');
    const startCardsBtn = document.getElementById('start-cards-btn');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const cardsGrid = document.getElementById('cards-grid');
    const gradeSelector = document.getElementById('grade-selector');
    const cardsGradeBadge = document.getElementById('cards-grade-badge');

    // Setup Modal
    const setupModal = document.getElementById('card-setup-modal');
    const closeSetupBtn = document.getElementById('close-setup-modal');
    const setupCardNumber = document.getElementById('setup-card-number');
    const modalLevelList = document.querySelectorAll('.setup-btn');
    const modalTopicSelect = document.getElementById('modal-topic-select');
    const flipCardBtn = document.getElementById('flip-card-btn');

    // Question Modal
    const questionModal = document.getElementById('question-modal');
    const closeQuestionBtn = document.getElementById('close-question-modal');
    const qLevelBadge = document.getElementById('q-level-badge');
    const qTopicBadge = document.getElementById('q-topic-badge');
    const qText = document.getElementById('q-text');
    const qIcon = document.getElementById('q-icon');
    const answerInput = document.getElementById('answer-input');
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    const feedbackText = document.getElementById('feedback-text');

    // State
    let currentGrade = "5";
    let activeCardElement = null;
    let selectedCardNum = 0;
    let currentCorrectAnswer = null;


    // --- Initialization ---
    initCards();

    // --- Name Logic ---
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
        setPlayerName(savedName);
        nameModal.classList.remove('active');
    } else {
        nameInput.focus();
    }

    startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name) {
            setPlayerName(name);
            localStorage.setItem('playerName', name);
            nameModal.style.opacity = '0';
            setTimeout(() => nameModal.classList.remove('active'), 300);
        } else {
            nameInput.style.transform = 'translateX(10px)';
            setTimeout(() => nameInput.style.transform = 'translateX(-10px)', 100);
            setTimeout(() => nameInput.style.transform = 'translateX(10px)', 200);
            setTimeout(() => nameInput.style.transform = 'translateX(0)', 300);
        }
    });

    nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') startBtn.click(); });
    function setPlayerName(name) { displayName.textContent = name; welcomeName.textContent = name; }

    userProfile.addEventListener('click', () => {
        const currentName = localStorage.getItem('playerName') || '';
        nameInput.value = currentName;
        nameModal.style.opacity = '1';
        nameModal.classList.add('active');
        setTimeout(() => nameInput.focus(), 100);
    });

    gradeSelector.addEventListener('change', (e) => {
        currentGrade = e.target.value;
        cardsGradeBadge.textContent = `${currentGrade}. Sınıf`;
    });

    // --- View Switching ---
    startCardsBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        cardsView.classList.remove('hidden');
        cardsGradeBadge.textContent = `${currentGrade}. Sınıf`;
    });

    backToMenuBtn.addEventListener('click', () => {
        cardsView.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });

    // --- Generate 20 Cards ---
    function initCards() {
        cardsGrid.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            const card = document.createElement('div');
            card.className = 'playing-card';
            card.dataset.num = i;
            
            const numSpan = document.createElement('span');
            numSpan.className = 'card-number';
            numSpan.textContent = i;
            
            card.appendChild(numSpan);
            
            card.addEventListener('click', () => openSetupModal(card, i));
            cardsGrid.appendChild(card);
        }
    }

    // --- Modals Logic ---
    function openSetupModal(cardEl, num) {
        if(cardEl.classList.contains('completed')) return; // Already solved
        activeCardElement = cardEl;
        selectedCardNum = num;
        setupCardNumber.textContent = num;
        setupModal.classList.add('active');
    }

    closeSetupBtn.addEventListener('click', () => setupModal.classList.remove('active'));

    modalLevelList.forEach(btn => {
        btn.addEventListener('click', () => {
            modalLevelList.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    flipCardBtn.addEventListener('click', () => {
        setupModal.classList.remove('active');
        
        // Flip card effect
        activeCardElement.classList.add('flipped');
        
        const selectedLevel = document.querySelector('.setup-btn.active').dataset.level;
        let selectedTopic = modalTopicSelect.value;
        
        if (selectedTopic === 'Rastgele') {
            const topics = ["Toplama", "Çıkarma", "Çarpma", "Bölme", "Kesirler"];
            selectedTopic = topics[Math.floor(Math.random() * topics.length)];
        }

        setTimeout(() => {
            showQuestionModal(selectedLevel, selectedTopic);
        }, 500); // wait for flip animation
    });

    function showQuestionModal(level, topic) {
        qLevelBadge.textContent = level;
        qTopicBadge.textContent = topic;
        
        const questionData = generateQuestion(currentGrade, topic, level);
        qText.innerHTML = questionData.text; // USING innerHTML for red highlights
        currentCorrectAnswer = questionData.answer;
        qIcon.textContent = questionData.icon || "🤔";
        
        answerInput.value = '';
        feedbackText.textContent = '';
        feedbackText.className = 'feedback-msg';
        
        questionModal.classList.add('active');
        setTimeout(() => answerInput.focus(), 300);
    }

    closeQuestionBtn.addEventListener('click', () => {
        questionModal.classList.remove('active');
        activeCardElement.classList.remove('flipped'); // Reset card if closed without solving
    });

    checkAnswerBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });

    function checkAnswer() {
        const userAns = answerInput.value.trim().replace(',', '.');
        if (userAns === '') return;

        if (userAns == currentCorrectAnswer) {
            feedbackText.textContent = "Tebrikler! Doğru cevap! 🎉";
            feedbackText.className = 'feedback-msg success';
            setTimeout(() => {
                questionModal.classList.remove('active');
                activeCardElement.classList.add('completed');
                activeCardElement.innerHTML = '<span class="card-number">✔️</span>';
            }, 1500);
        } else {
            feedbackText.textContent = "Maalesef yanlış. Tekrar dene! ❌";
            feedbackText.className = 'feedback-msg error';
            
            answerInput.style.transform = 'translateX(10px)';
            setTimeout(() => answerInput.style.transform = 'translateX(-10px)', 100);
            setTimeout(() => answerInput.style.transform = 'translateX(10px)', 200);
            setTimeout(() => answerInput.style.transform = 'translateX(0)', 300);
        }
    }

    // --- Main Menu Topic & Level Selection ---
    const topicListItems = document.querySelectorAll('#topic-list .list-item');
    const selectedTopicSpan = document.getElementById('selected-topic');
    
    topicListItems.forEach(item => {
        item.addEventListener('click', () => {
            topicListItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            selectedTopicSpan.textContent = item.dataset.topic;
        });
    });

    const levelListItems = document.querySelectorAll('#level-list .list-item');
    const selectedLevelSpan = document.getElementById('selected-level');

    levelListItems.forEach(item => {
        item.addEventListener('click', () => {
            levelListItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            selectedLevelSpan.textContent = item.dataset.level;
        });
    });



    // --- Question Generator ---
    // MEB 5. Sınıf Müfredatına Uygun Basit Problemler
    function generateQuestion(grade, topic, level) {
        let text = "", ans = 0, icon = "🤔";
        let num1, num2, num3;

        if (topic === "Toplama") {
            icon = "🛒";
            if (level === "Kolay") {
                num1 = Math.floor(Math.random() * 800) + 100;
                num2 = Math.floor(Math.random() * 400) + 100;
                ans = num1 + num2;
                text = `Bir kütüphanede <span class="highlight-red">${num1} hikaye kitabı</span> ve <span class="highlight-red">${num2} şiir kitabı</span> vardır. Kütüphanede toplam kaç kitap vardır?`;
            } else if (level === "Orta") {
                num1 = Math.floor(Math.random() * 4000) + 1000;
                num2 = Math.floor(Math.random() * 3000) + 1000;
                ans = num1 + num2;
                text = `Bir çiftçi birinci yıl <span class="highlight-red">${num1} kg</span>, ikinci yıl <span class="highlight-red">${num2} kg</span> buğday hasat etmiştir. Çiftçi iki yılda toplam kaç kg buğday almıştır?`;
            } else {
                num1 = Math.floor(Math.random() * 50000) + 10000;
                num2 = Math.floor(Math.random() * 30000) + 10000;
                ans = num1 + num2;
                text = `Bir ilçenin nüfusu <span class="highlight-red">${num1}</span> kişidir. Çevre yerlerden <span class="highlight-red">${num2} kişi</span> göç ederse ilçenin yeni nüfusu kaç olur?`;
            }
        } 
        else if (topic === "Çıkarma") {
            icon = "📉";
            if (level === "Kolay") {
                num1 = Math.floor(Math.random() * 500) + 400;
                num2 = Math.floor(Math.random() * 300) + 50;
                ans = num1 - num2;
                text = `Bir mağazadaki <span class="highlight-red">${num1} tişörtün</span> <span class="highlight-red">${num2} tanesi</span> satılmıştır. Geriye satılmayan kaç tişört kalmıştır?`;
            } else if (level === "Orta") {
                num1 = Math.floor(Math.random() * 4000) + 5000;
                num2 = Math.floor(Math.random() * 3000) + 1000;
                ans = num1 - num2;
                text = `Maaşı <span class="highlight-red">${num1} TL</span> olan Ali Bey, kiraya ve faturalara <span class="highlight-red">${num2} TL</span> vermiştir. Geriye kaç TL parası kalmıştır?`;
            } else {
                num1 = Math.floor(Math.random() * 80000) + 50000;
                num2 = Math.floor(Math.random() * 40000) + 20000;
                ans = num1 - num2;
                text = `Bir araba almak için <span class="highlight-red">${num1} TL</span> biriktiren Ayşe Hanım, <span class="highlight-red">${num2} TL</span> değerindeki arabayı alırsa geriye kaç TL'si kalır?`;
            }
        }
        else if (topic === "Çarpma") {
            icon = "📦";
            if (level === "Kolay") {
                num1 = Math.floor(Math.random() * 20) + 10;
                num2 = Math.floor(Math.random() * 8) + 2;
                ans = num1 * num2;
                text = `Bir sınıfta <span class="highlight-red">${num1} sıra</span> vardır. Her sırada <span class="highlight-red">${num2} öğrenci</span> oturduğuna göre, sınıf mevcudu kaçtır?`;
            } else if (level === "Orta") {
                num1 = Math.floor(Math.random() * 150) + 50;
                num2 = Math.floor(Math.random() * 20) + 10;
                ans = num1 * num2;
                text = `Bir koliye <span class="highlight-red">${num1} adet</span> gofret sığmaktadır. <span class="highlight-red">${num2} koli</span> sipariş veren bakkal, toplam kaç gofret almış olur?`;
            } else {
                num1 = Math.floor(Math.random() * 400) + 200;
                num2 = Math.floor(Math.random() * 80) + 30;
                ans = num1 * num2;
                text = `Tanesi <span class="highlight-red">${num1} TL</span> olan sandalyelerden okula <span class="highlight-red">${num2} tane</span> alınmıştır. Toplam kaç TL ödenmesi gerekir?`;
            }
        }
        else if (topic === "Bölme") {
            icon = "🍬";
            if (level === "Kolay") {
                num2 = Math.floor(Math.random() * 8) + 2;
                ans = Math.floor(Math.random() * 20) + 10;
                num1 = num2 * ans;
                text = `Öğretmen, sınıfındaki <span class="highlight-red">${num1} kalemi</span> <span class="highlight-red">${num2} öğrenciye</span> eşit olarak paylaştırmıştır. Her öğrenciye kaç kalem düşer?`;
            } else if (level === "Orta") {
                num2 = Math.floor(Math.random() * 20) + 10;
                ans = Math.floor(Math.random() * 30) + 15;
                num1 = num2 * ans;
                text = `Fırıncı <span class="highlight-red">${num1} kg unu</span>, her biri <span class="highlight-red">${num2} kg</span> alan çuvallara dolduracaktır. Toplam kaç çuval un elde edilir?`;
            } else {
                num2 = Math.floor(Math.random() * 40) + 20;
                ans = Math.floor(Math.random() * 50) + 25;
                num1 = num2 * ans;
                text = `Okul gezisi için <span class="highlight-red">${num1} öğrenci</span>, <span class="highlight-red">${num2} kişilik</span> otobüslere binecektir. Hiç öğrenci artmadığına göre kaç otobüs gereklidir?`;
            }
        }
        else if (topic === "Kesirler") {
            icon = "🍕";
            if (level === "Kolay") {
                num1 = (Math.floor(Math.random() * 10) + 5) * 4;
                ans = num1 / 4;
                text = `<span class="highlight-red">${num1} sayfalık</span> bir kitabın <span class="highlight-red">1/4'ünü</span> okuyan Mert, kaç sayfa kitap okumuştur?`;
            } else if (level === "Orta") {
                num1 = (Math.floor(Math.random() * 20) + 10) * 5;
                num2 = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
                ans = (num1 / 5) * num2;
                text = `Bir çiftçi <span class="highlight-red">${num1} dönüm</span> tarlasının <span class="highlight-red">${num2}/5'ine</span> mısır ekmiştir. Kaç dönüme mısır ekilmiştir?`;
            } else {
                num1 = (Math.floor(Math.random() * 15) + 10) * 20; // Multiple of 20
                let p1 = num1 / 4; // 1/4
                let p2 = (num1 / 5) * 2; // 2/5
                ans = num1 - (p1 + p2);
                text = `Bir kütüphanedeki <span class="highlight-red">${num1} kitabın</span> önce <span class="highlight-red">1/4'ü</span>, sonra <span class="highlight-red">2/5'i</span> ödünç verilmiştir. Kütüphanede verilmeyen kaç kitap kalmıştır?`;
            }
        }
        else if (topic === "Ondalıklar") {
            icon = "⚖️";
            if (level === "Kolay") {
                num1 = (Math.floor(Math.random() * 10) + 10) + 0.5; // e.g. 15.5
                num2 = (Math.floor(Math.random() * 5) + 5) + 0.5;  // e.g. 7.5
                ans = num1 + num2;
                text = `Manavdan kilogramı <span class="highlight-red">${num1} TL</span> olan elma ve kilogramı <span class="highlight-red">${num2} TL</span> olan muz alan biri toplam kaç TL öder?`;
            } else if (level === "Orta") {
                num1 = (Math.floor(Math.random() * 5) + 14) / 10; // e.g. 1.4 to 1.8
                num2 = num1 - (Math.floor(Math.random() * 3) + 1) / 10; // e.g. 1.2
                ans = Math.round((num1 - num2) * 10) / 10;
                text = `Zeynep'in boyu <span class="highlight-red">${num1.toFixed(2)} metre</span>, kardeşinin boyu <span class="highlight-red">${num2.toFixed(2)} metredir</span>. Zeynep kardeşinden kaç metre uzundur? (Virgül kullanarak yazınız, ör: 0.15)`;
            } else {
                num1 = 20.5;
                num2 = 14.25;
                num3 = 50;
                ans = num3 - (num1 + num2);
                text = `Marketten <span class="highlight-red">${num1} TL'lik</span> peynir ve <span class="highlight-red">${num2} TL'lik</span> zeytin alan Ayşe Teyze, satıcıya <span class="highlight-red">${num3} TL</span> verirse kaç TL para üstü alır? (Virgül kullanarak yazınız)`;
            }
        }
        else if (topic === "Yüzdeler") {
            icon = "🏷️";
            if (level === "Kolay") {
                num1 = (Math.floor(Math.random() * 20) + 10) * 10; // 100, 110... 300
                ans = num1 / 2; // 50%
                text = `<span class="highlight-red">${num1} TL'lik</span> bir ayakkabıya sezon sonu <span class="highlight-red">%50 indirim</span> yapılmıştır. Ayakkabının indirimli fiyatı kaç TL olmuştur?`;
            } else if (level === "Orta") {
                num1 = (Math.floor(Math.random() * 30) + 20) * 10; // 200... 500
                num2 = 20; // 20%
                ans = (num1 * num2) / 100;
                text = `<span class="highlight-red">${num1} kişilik</span> bir okulun <span class="highlight-red">%20'si</span> tiyatro kulübündedir. Tiyatro kulübünde kaç öğrenci vardır?`;
            } else {
                num1 = (Math.floor(Math.random() * 4) + 2) * 100; // 200, 300.. 500
                ans = num1 + (num1 * 0.10); // 10% zam
                text = `<span class="highlight-red">${num1} TL'ye</span> satılan bir bisiklete <span class="highlight-red">%10 zam</span> yapılmıştır. Bisikletin zamlı yeni fiyatı kaç TL olmuştur?`;
            }
        }

        return { text, answer: ans, icon };
    }
});
