// Game state
let gameState = {
    score: 0,
    lives: 3,
    streak: 0,
    level: 1,
    stage: 1,
    currentQuestionIndex: 0,
    selectedCharacter: null,
    difficulty: 'medium',
    category: 'all',
    timeRemaining: 30,
    timerInterval: null,
    powerUps: {
        hint: { uses: 3, cooldown: 0 },
        strike: { uses: 2, cooldown: 0 },
        timeFreeze: { uses: 2, cooldown: 0 },
        doublePoints: { uses: 1, active: false }
    },
    answeredQuestions: new Set(),
    totalCorrectAnswers: parseInt(localStorage.getItem('totalCorrectAnswers') || '0'),
    achievementsUnlocked: new Set()
};

// Achievement system
const achievements = {
    firstAnswer: {
        id: 'firstAnswer',
        title: 'First Steps',
        description: 'Answered your first question correctly!',
        icon: '🎯',
        check: () => gameState.totalCorrectAnswers >= 1
    },
    tenAnswers: {
        id: 'tenAnswers',
        title: 'Scholar',
        description: 'Answered 10 questions correctly!',
        icon: '📚',
        check: () => gameState.totalCorrectAnswers >= 10
    },
    twentyFiveAnswers: {
        id: 'twentyFiveAnswers',
        title: 'Historian',
        description: 'Answered 25 questions correctly!',
        icon: '🏛️',
        check: () => gameState.totalCorrectAnswers >= 25
    },
    fiftyAnswers: {
        id: 'fiftyAnswers',
        title: 'Master Historian',
        description: 'Answered 50 questions correctly!',
        icon: '👑',
        check: () => gameState.totalCorrectAnswers >= 50
    },
    perfectStreak5: {
        id: 'perfectStreak5',
        title: 'On Fire!',
        description: 'Achieved a 5-question streak!',
        icon: '🔥',
        check: () => gameState.streak >= 5 && gameState.streak % 5 === 0
    },
    perfectStreak10: {
        id: 'perfectStreak10',
        title: 'Unstoppable!',
        description: 'Achieved a 10-question streak!',
        icon: '⚡',
        check: () => gameState.streak >= 10 && gameState.streak % 10 === 0
    },
    level3: {
        id: 'level3',
        title: 'Rising Star',
        description: 'Reached Level 3!',
        icon: '⭐',
        check: () => gameState.level >= 3
    },
    level5: {
        id: 'level5',
        title: 'Legend',
        description: 'Reached Level 5!',
        icon: '🌟',
        check: () => gameState.level >= 5
    },
    highScore1000: {
        id: 'highScore1000',
        title: 'High Achiever',
        description: 'Scored over 1,000 points!',
        icon: '💯',
        check: () => gameState.score >= 1000
    },
    highScore5000: {
        id: 'highScore5000',
        title: 'Elite Player',
        description: 'Scored over 5,000 points!',
        icon: '💎',
        check: () => gameState.score >= 5000
    },
    allPowerUpsUsed: {
        id: 'allPowerUpsUsed',
        title: 'Strategic Master',
        description: 'Used all power-up types in one game!',
        icon: '🎲',
        check: () => {
            const used = JSON.parse(localStorage.getItem('powerUpsUsed') || '{}');
            return used.hint && used.strike && used.timeFreeze && used.doublePoints;
        }
    }
};

// Load achievements from localStorage
function loadAchievements() {
    const saved = localStorage.getItem('achievements');
    if (saved) {
        gameState.achievementsUnlocked = new Set(JSON.parse(saved));
    }
}

// Save achievements to localStorage
function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify([...gameState.achievementsUnlocked]));
}

// Check and unlock achievements
function checkAchievements() {
    Object.values(achievements).forEach(achievement => {
        if (!gameState.achievementsUnlocked.has(achievement.id) && achievement.check()) {
            unlockAchievement(achievement);
        }
    });
}

// Unlock and display achievement
function unlockAchievement(achievement) {
    gameState.achievementsUnlocked.add(achievement.id);
    saveAchievements();
    
    const popup = document.getElementById('achievement-popup');
    const icon = popup.querySelector('.achievement-icon');
    const title = document.getElementById('achievement-title');
    const description = document.getElementById('achievement-description');
    
    icon.textContent = achievement.icon;
    title.textContent = achievement.title;
    description.textContent = achievement.description;
    
    popup.style.display = 'block';
    popup.classList.add('show');
    
    // Hide after 4 seconds
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 500);
    }, 4000);
}

// Track power-up usage
function trackPowerUpUsage(powerName) {
    const used = JSON.parse(localStorage.getItem('powerUpsUsed') || '{}');
    used[powerName] = true;
    localStorage.setItem('powerUpsUsed', JSON.stringify(used));
    checkAchievements();
}

// Extensive question database with categories and difficulties - Historical Facts about Ancient Greece
const questionsDatabase = {
    rise: {
        easy: [
            { question: "Where was the Minoan civilization based?", answers: ["Mainland Greece", "Crete", "Sicily", "Cyprus"], correct: "Crete" },
            { question: "Where was the Mycenaean civilization located?", answers: ["Crete", "Mainland Greece", "Sicily", "Asia Minor"], correct: "Mainland Greece" },
            { question: "What was the Minoan writing system called?", answers: ["Linear A", "Linear B", "Greek alphabet", "Phoenician script"], correct: "Linear A" },
            { question: "What were the Minoans particularly skilled at?", answers: ["Warfare", "Trade and sailing", "Philosophy", "Democracy"], correct: "Trade and sailing" },
            { question: "What were the Mycenaeans known for?", answers: ["Democracy", "Trade", "Warrior-kings and fortresses", "Philosophy"], correct: "Warrior-kings and fortresses" },
            { question: "What were the Minoans known for in terms of their cities?", answers: ["Small villages", "Remarkable palaces and cities", "Simple huts", "Nomadic camps"], correct: "Remarkable palaces and cities" },
            { question: "What type of society were the Mycenaeans?", answers: ["Democratic", "Militaristic", "Peaceful", "Nomadic"], correct: "Militaristic" },
            { question: "When did the Greek Dark Ages roughly begin?", answers: ["1100 BCE", "800 BCE", "500 BCE", "300 BCE"], correct: "1100 BCE" },
            { question: "What was the name of the early Greek alphabet derived from Phoenician script?", answers: ["Latin", "Linear B", "Greek alphabet", "Cyrillic"], correct: "Greek alphabet" },
            { question: "Which period marks the beginning of Classical Greece?", answers: ["Archaic Period", "Classical Period", "Hellenistic Period", "Mycenaean Period"], correct: "Archaic Period" },
            { question: "What were independent Greek city-states called?", answers: ["Poleis", "Colonies", "Kingdoms", "Republics"], correct: "Poleis" },
            { question: "When did Greek colonization of the Mediterranean begin?", answers: ["800 BCE", "600 BCE", "400 BCE", "200 BCE"], correct: "800 BCE" },
            { question: "What was the Archaic Period?", answers: ["The Classical Period", "Transitional period between Dark Ages and Classical Period", "The Hellenistic Period", "The Mycenaean Period"], correct: "Transitional period between Dark Ages and Classical Period" },
            { question: "Which city-states emerged as independent during the Archaic Period?", answers: ["Rome and Carthage", "Athens, Corinth, Sparta, and Thebes", "Alexandria and Antioch", "Troy and Mycenae"], correct: "Athens, Corinth, Sparta, and Thebes" },
            { question: "What did each Greek city-state have?", answers: ["Shared government", "Its own army and government", "No government", "One unified army"], correct: "Its own army and government" },
            { question: "Where did Greek settlements spread during the Archaic Period?", answers: ["Only in Greece", "Around the Mediterranean and Black Seas", "Only in Asia Minor", "Only in Italy"], correct: "Around the Mediterranean and Black Seas" }
        ],
        medium: [
            { question: "During what time period did the Minoan civilization exist?", answers: ["c. 3000–1450 BCE", "c. 1600–1100 BCE", "c. 800–500 BCE", "c. 500–300 BCE"], correct: "c. 3000–1450 BCE" },
            { question: "During what time period did the Mycenaean civilization exist?", answers: ["c. 3000–1450 BCE", "c. 1600–1100 BCE", "c. 800–500 BCE", "c. 500–300 BCE"], correct: "c. 1600–1100 BCE" },
            { question: "What legendary event are the Mycenaeans associated with?", answers: ["The Peloponnesian War", "The Trojan War", "The Persian Wars", "The Olympic Games"], correct: "The Trojan War" },
            { question: "What sea did Minoan prosperity spread trade and cultural ideas across?", answers: ["Mediterranean Sea", "Aegean Sea", "Black Sea", "Ionian Sea"], correct: "Aegean Sea" },
            { question: "Which Mycenaean centers were major cities of this civilization?", answers: ["Athens and Sparta", "Mycenae, Tiryns, and Pylos", "Thebes and Corinth", "Crete and Rhodes"], correct: "Mycenae, Tiryns, and Pylos" },
            { question: "What were the Mycenaeans known for in terms of structures?", answers: ["Small houses", "Big stone fortresses and royal tombs", "Temples only", "Simple settlements"], correct: "Big stone fortresses and royal tombs" },
            { question: "What crafts were the Mycenaeans known for?", answers: ["Only pottery", "Gold work, pottery, and frescoes", "Only metalwork", "Only weaving"], correct: "Gold work, pottery, and frescoes" },
            { question: "What did the Mycenaeans do across the Eastern Mediterranean and Aegean?", answers: ["Only traded", "Only fought", "Traded and fought", "Only explored"], correct: "Traded and fought" },
            { question: "What was the first recorded Olympic Games held?", answers: ["776 BCE", "650 BCE", "500 BCE", "400 BCE"], correct: "776 BCE" },
            { question: "Which Greek city was the first to develop democracy?", answers: ["Sparta", "Athens", "Thebes", "Corinth"], correct: "Athens" },
            { question: "Who introduced democratic reforms in Athens around 594 BCE?", answers: ["Pericles", "Solon", "Cleisthenes", "Draco"], correct: "Solon" },
            { question: "What event marked the end of the Archaic Period?", answers: ["The Persian Wars", "The Peloponnesian War", "Alexander's conquest", "Roman conquest"], correct: "The Persian Wars" },
            { question: "Which tyrant ruled Athens before democracy was established?", answers: ["Pisistratus", "Pericles", "Socrates", "Plato"], correct: "Pisistratus" },
            { question: "What did the Archaic Period mark?", answers: ["The end of Greek civilization", "The rebirth of Greek Civilization", "The Roman conquest", "The fall of Athens"], correct: "The rebirth of Greek Civilization" },
            { question: "What cultural developments occurred during the Archaic Period?", answers: ["Only warfare", "Temples, poetry, sculpture, and the Olympic Games", "Only trade", "Only politics"], correct: "Temples, poetry, sculpture, and the Olympic Games" },
            { question: "What was the correct order of political evolution in Greek city-states?", answers: ["Democracies → Oligarchies → Monarchies → Tyrannies", "Monarchies → Oligarchies → Tyrannies → Democracies", "Oligarchies → Democracies → Tyrannies → Monarchies", "Tyrannies → Democracies → Monarchies → Oligarchies"], correct: "Monarchies → Oligarchies → Tyrannies → Democracies" },
            { question: "What were tyrannies in ancient Greece?", answers: ["Rule by many", "Rule by wealthy elites", "Individual rulers who seized power, often supported by common citizens", "Rule by kings"], correct: "Individual rulers who seized power, often supported by common citizens" }
        ],
        hard: [
            { question: "What aspects were the Minoans particularly known for?", answers: ["Warfare and conquest", "Art, writing (Linear A), and a strong navy", "Philosophy and democracy", "Mathematics and science"], correct: "Art, writing (Linear A), and a strong navy" },
            { question: "What happened to Minoan prosperity?", answers: ["It was destroyed by the Romans", "It spread trade and cultural ideas across the Aegean Sea", "It was limited to Crete only", "It ended before Mycenaean civilization"], correct: "It spread trade and cultural ideas across the Aegean Sea" },
            { question: "Which civilization came first chronologically?", answers: ["Mycenaean", "Minoan", "Classical Greek", "Hellenistic"], correct: "Minoan" },
            { question: "What was the Mycenaean civilization known as?", answers: ["The first advanced Greek-speaking civilization", "The first democratic civilization", "The first maritime civilization", "The first agricultural civilization"], correct: "The first advanced Greek-speaking civilization" },
            { question: "What was the name of the council of elders in Sparta?", answers: ["Gerousia", "Boule", "Ecclesia", "Areopagus"], correct: "Gerousia" },
            { question: "Which Greek reformer is credited with creating the Council of 500?", answers: ["Solon", "Cleisthenes", "Pericles", "Draco"], correct: "Cleisthenes" },
            { question: "What was the term for Greek citizens who participated in government?", answers: ["Polis", "Demos", "Hoplites", "Oligarchs"], correct: "Demos" },
            { question: "When did the Greek colonization of Sicily and Southern Italy peak?", answers: ["750-550 BCE", "600-400 BCE", "500-300 BCE", "400-200 BCE"], correct: "750-550 BCE" },
            { question: "What was the name of the conflict between Athens and Sparta from 431-404 BCE?", answers: ["Persian Wars", "Peloponnesian War", "Corinthian War", "Sacred War"], correct: "Peloponnesian War" },
            { question: "What were the key developments during the Archaic Period?", answers: ["Only military", "Major developments in politics, economy, arts, and culture", "Only economic", "Only cultural"], correct: "Major developments in politics, economy, arts, and culture" },
            { question: "What characterized oligarchies in ancient Greece?", answers: ["Power held by all citizens", "Power held by wealthy elites or small groups of landowners", "Power held by kings", "Power held by tyrants"], correct: "Power held by wealthy elites or small groups of landowners" },
            { question: "What characterized monarchies in ancient Greece?", answers: ["Power held by the people", "Power held by kings or hereditary leaders", "Power held by wealthy elites", "Power held by tyrants"], correct: "Power held by kings or hereditary leaders" },
            { question: "How did Greek city-states expand their trade and influence during the Archaic Period?", answers: ["Through warfare only", "Through the spread of settlements", "Through diplomacy only", "Through conquest only"], correct: "Through the spread of settlements" }
        ]
    },
    golden: {
        easy: [
            { question: "What was the capital of ancient Greece?", answers: ["Sparta", "Athens", "Thebes", "Corinth"], correct: "Athens" },
            { question: "Which Athenian leader is known for the Golden Age of Athens?", answers: ["Solon", "Pericles", "Socrates", "Plato"], correct: "Pericles" },
            { question: "What famous temple was built on the Acropolis in Athens?", answers: ["Parthenon", "Pantheon", "Temple of Zeus", "Temple of Apollo"], correct: "Parthenon" },
            { question: "Which battle stopped the first Persian invasion in 490 BCE?", answers: ["Thermopylae", "Marathon", "Salamis", "Plataea"], correct: "Marathon" },
            { question: "What was the name of the alliance led by Athens?", answers: ["Peloponnesian League", "Delian League", "Corinthian League", "Aegean League"], correct: "Delian League" }
        ],
        medium: [
            { question: "In which battle did 300 Spartans famously hold off the Persians?", answers: ["Marathon", "Thermopylae", "Salamis", "Plataea"], correct: "Thermopylae" },
            { question: "What year did the Peloponnesian War begin?", answers: ["431 BCE", "404 BCE", "490 BCE", "480 BCE"], correct: "431 BCE" },
            { question: "Which philosopher was sentenced to death by hemlock in 399 BCE?", answers: ["Plato", "Socrates", "Aristotle", "Pythagoras"], correct: "Socrates" },
            { question: "What was the primary economic activity in Athens during its Golden Age?", answers: ["Agriculture", "Trade", "Mining", "Fishing"], correct: "Trade" },
            { question: "Which naval battle was the turning point of the Persian Wars?", answers: ["Marathon", "Thermopylae", "Salamis", "Plataea"], correct: "Salamis" }
        ],
        hard: [
            { question: "What was the name of the peace treaty that ended the Peloponnesian War?", answers: ["Peace of Nicias", "Treaty of Sparta", "Athenian Accord", "Thirty Years' Peace"], correct: "Peace of Nicias" },
            { question: "Who was the Spartan general who defeated Athens in the Peloponnesian War?", answers: ["Leonidas", "Brasidas", "Lysander", "Agesilaus"], correct: "Lysander" },
            { question: "What was the name of the period after the Peloponnesian War when Sparta dominated Greece?", answers: ["Spartan Hegemony", "Athenian Empire", "Theban Hegemony", "Macedonian Rule"], correct: "Spartan Hegemony" },
            { question: "Which Theban general defeated Sparta at the Battle of Leuctra in 371 BCE?", answers: ["Epaminondas", "Pelopidas", "Philip II", "Alexander"], correct: "Epaminondas" },
            { question: "What was the name of the system where citizens served as jurors in Athens?", answers: ["Areopagus", "Boule", "Heliaia", "Ecclesia"], correct: "Heliaia" }
        ]
    },
    decline: {
        easy: [
            { question: "Which Macedonian king conquered Greece in 338 BCE?", answers: ["Alexander the Great", "Philip II", "Antipater", "Cassander"], correct: "Philip II" },
            { question: "What battle gave Philip II control of Greece?", answers: ["Battle of Chaeronea", "Battle of Granicus", "Battle of Issus", "Battle of Gaugamela"], correct: "Battle of Chaeronea" },
            { question: "When did Alexander the Great die?", answers: ["323 BCE", "300 BCE", "280 BCE", "250 BCE"], correct: "323 BCE" },
            { question: "Which empire eventually conquered Greece?", answers: ["Persian Empire", "Roman Empire", "Byzantine Empire", "Ottoman Empire"], correct: "Roman Empire" },
            { question: "What was the period called when Greek culture spread after Alexander's death?", answers: ["Classical Period", "Archaic Period", "Hellenistic Period", "Roman Period"], correct: "Hellenistic Period" },
            { question: "What happened to Greek city-states after the Peloponnesian War?", answers: ["They united peacefully", "They continued to fight with desire for dominance", "They all disbanded", "They formed one empire"], correct: "They continued to fight with desire for dominance" },
            { question: "Which city-states each had moments of control of Greece after the Peloponnesian War?", answers: ["Rome and Carthage", "Thebes, Athens, and Sparta", "Macedonia and Thrace", "Corinth and Argos"], correct: "Thebes, Athens, and Sparta" },
            { question: "What did Greek city-states fail to do after the Peloponnesian War?", answers: ["Win battles", "Maintain unity", "Build cities", "Trade"], correct: "Maintain unity" }
        ],
        medium: [
            { question: "Which Roman general defeated the Greeks at the Battle of Pydna in 168 BCE?", answers: ["Julius Caesar", "Pompey", "Lucius Aemilius Paullus", "Scipio"], correct: "Lucius Aemilius Paullus" },
            { question: "What was the last major independent Greek city-state to fall to Rome?", answers: ["Athens", "Sparta", "Corinth", "Thebes"], correct: "Corinth" },
            { question: "In what year did Rome sack Corinth, effectively ending Greek independence?", answers: ["146 BCE", "133 BCE", "88 BCE", "30 BCE"], correct: "146 BCE" },
            { question: "What was the name of the alliance formed by Greek city-states to resist Macedonian rule?", answers: ["Achaean League", "Delian League", "Corinthian League", "Peloponnesian League"], correct: "Achaean League" },
            { question: "Which Hellenistic kingdom was the last to fall to Rome in 30 BCE?", answers: ["Macedonia", "Seleucid Empire", "Ptolemaic Egypt", "Pergamon"], correct: "Ptolemaic Egypt" },
            { question: "What was drained from Greece due to constant warfare after the Peloponnesian War?", answers: ["Only money", "Only soldiers", "Trust and resources", "Only land"], correct: "Trust and resources" },
            { question: "What was the result of Greek city-states' failure to maintain unity?", answers: ["They became stronger", "They were unable to defend themselves from outside forces", "They expanded their territory", "They formed new alliances"], correct: "They were unable to defend themselves from outside forces" },
            { question: "What was the main desire of Greek city-states after the Peloponnesian War?", answers: ["Peace", "Trade", "Dominance", "Independence"], correct: "Dominance" }
        ],
        hard: [
            { question: "What was the name of the conflict between Rome and the Achaean League?", answers: ["Achaean War", "Macedonian Wars", "Social War", "Corinthian War"], correct: "Achaean War" },
            { question: "Which Roman province was Greece organized into?", answers: ["Achaea", "Macedonia", "Illyricum", "Thrace"], correct: "Achaea" },
            { question: "What was the cause of the economic decline in Greece during the Roman period?", answers: ["Famine", "War devastation", "Loss of trade routes", "All of the above"], correct: "All of the above" },
            { question: "Which emperor made Greece a province of Rome?", answers: ["Augustus", "Hadrian", "Marcus Aurelius", "Constantine"], correct: "Augustus" },
            { question: "What event in 88 BCE saw Greek cities side with Mithridates against Rome?", answers: ["First Mithridatic War", "Social War", "Achaean War", "Spartan Revolt"], correct: "First Mithridatic War" },
            { question: "Why were Greek city-states vulnerable to outside forces after the Peloponnesian War?", answers: ["They had too many resources", "Trust and resources were drained, leaving them unable to defend themselves", "They had no armies", "They were too peaceful"], correct: "Trust and resources were drained, leaving them unable to defend themselves" },
            { question: "What characterized the period of constant warfare among Greek city-states?", answers: ["Unity and cooperation", "Each city-state seeking dominance and failing to maintain unity", "Peaceful trade", "Shared government"], correct: "Each city-state seeking dominance and failing to maintain unity" }
        ]
    }
};

// Character abilities
const characterAbilities = {
    Odysseus: {
        name: "Odysseus",
        ability: "Cunning Wisdom",
        description: "Get 50% time bonus on questions",
        bonus: { time: 1.5 }
    },
    Heracles: {
        name: "Heracles",
        ability: "Divine Strength",
        description: "Double points for correct answers",
        bonus: { points: 2 }
    },
    Perseus: {
        name: "Perseus",
        ability: "Quick Reflexes",
        description: "Start with 1 extra life",
        bonus: { lives: 1 }
    },
    Athena: {
        name: "Athena",
        ability: "Goddess of Wisdom",
        description: "Get 1 extra hint use",
        bonus: { hints: 1 }
    },
    Achilles: {
        name: "Achilles",
        ability: "Warrior's Valor",
        description: "Double streak bonuses",
        bonus: { streak: 2 }
    }
};

// Get questions based on category and difficulty
function getQuestions() {
    let availableQuestions = [];
    
    if (gameState.category === 'all') {
        Object.keys(questionsDatabase).forEach(cat => {
            questionsDatabase[cat][gameState.difficulty].forEach(q => {
                if (!gameState.answeredQuestions.has(q.question)) {
                    availableQuestions.push({ ...q, category: cat });
                }
            });
        });
    } else {
        questionsDatabase[gameState.category][gameState.difficulty].forEach(q => {
            if (!gameState.answeredQuestions.has(q.question)) {
                availableQuestions.push({ ...q, category: gameState.category });
            }
        });
    }
    
    // Shuffle questions
    for (let i = availableQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableQuestions[i], availableQuestions[j]] = [availableQuestions[j], availableQuestions[i]];
    }
    
    return availableQuestions;
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = `Score: ${gameState.score}`;
    document.getElementById('lives').textContent = `Lives: ${'❤️'.repeat(gameState.lives)}`;
    document.getElementById('streak').textContent = `Streak: ${gameState.streak}x`;
    document.getElementById('level').textContent = `Level ${gameState.level} - Stage ${gameState.stage}`;
    document.getElementById('time-display').textContent = `Time: ${gameState.timeRemaining}s`;
    
    // Update power-up buttons
    updatePowerUpButtons();
    
    // Update progress bar
    updateProgressBar();
}

// Update progress bar
function updateProgressBar() {
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (!progressContainer || !progressFill || !progressText) return;
    
    // Calculate progress to next stage (every 5 questions)
    const progressToNextStage = gameState.streak % 5;
    const progressPercent = (progressToNextStage / 5) * 100;
    
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `${progressToNextStage}/5`;
}

// Update power-up button states
function updatePowerUpButtons() {
    ['hint', 'strike', 'timeFreeze'].forEach(power => {
        const btn = document.getElementById(`power-${power}`);
        const powerState = gameState.powerUps[power];
        if (btn) {
            btn.disabled = powerState.uses <= 0 || powerState.cooldown > 0;
            btn.textContent = `${power.charAt(0).toUpperCase() + power.slice(1)} (${powerState.uses})`;
            if (powerState.cooldown > 0) {
                btn.textContent += ` [${powerState.cooldown}s]`;
            }
        }
    });
    
    const doubleBtn = document.getElementById('power-doublePoints');
    if (doubleBtn) {
        doubleBtn.disabled = gameState.powerUps.doublePoints.uses <= 0 || gameState.powerUps.doublePoints.active;
        doubleBtn.textContent = `Double Points (${gameState.powerUps.doublePoints.uses})`;
        if (gameState.powerUps.doublePoints.active) {
            doubleBtn.textContent += ' [ACTIVE]';
        }
    }
}

// Start timer
function startTimer() {
    clearInterval(gameState.timerInterval);
    const baseTime = 30 - (gameState.level - 1) * 2;
    gameState.timeRemaining = Math.max(15, baseTime);
    
    if (gameState.selectedCharacter && characterAbilities[gameState.selectedCharacter].bonus.time) {
        gameState.timeRemaining = Math.floor(gameState.timeRemaining * characterAbilities[gameState.selectedCharacter].bonus.time);
    }
    
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
        timeDisplay.classList.remove('time-warning');
    }
    
    updateUI();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateUI();
        
        const timeDisplay = document.getElementById('time-display');
        if (gameState.timeRemaining <= 5) {
            timeDisplay.classList.add('time-warning');
        } else {
            timeDisplay.classList.remove('time-warning');
        }
        
        if (gameState.timeRemaining <= 0) {
            timeUp();
        }
    }, 1000);
}

// Time's up
function timeUp() {
    clearInterval(gameState.timerInterval);
    gameState.lives--;
    gameState.streak = 0;
    showFeedback("Time's up! You lost a life.", false);
    
    if (gameState.lives <= 0) {
        endGame();
    } else {
        setTimeout(() => loadQuestion(), 2000);
    }
}

// Load question
function loadQuestion() {
    const questions = getQuestions();
    
    if (questions.length === 0) {
        // All questions answered, advance level
        gameState.level++;
        gameState.stage++;
        gameState.answeredQuestions.clear();
        gameState.difficulty = gameState.level > 3 ? 'hard' : gameState.level > 1 ? 'medium' : 'easy';
        showFeedback(`Level ${gameState.level} reached!`, true);
        checkAchievements(); // Check level-based achievements
    }
    
    const questionsAvailable = getQuestions();
    if (questionsAvailable.length === 0) {
        endGame();
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * questionsAvailable.length);
    const currentQuestion = questionsAvailable[randomIndex];
    gameState.currentQuestion = currentQuestion;
    
    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');
    const categoryElement = document.getElementById('category');
    
    // Category display names
    const categoryNames = {
        'rise': 'The Rise of Greece',
        'golden': 'Golden Age',
        'decline': 'Decline & Fall'
    };
    
    questionElement.textContent = currentQuestion.question;
    categoryElement.textContent = `Period: ${categoryNames[currentQuestion.category] || currentQuestion.category}`;
    answersElement.innerHTML = '';
    
    // Shuffle answers
    const shuffledAnswers = [...currentQuestion.answers].sort(() => Math.random() - 0.5);
    
    shuffledAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.onclick = () => checkAnswer(answer, button);
        answersElement.appendChild(button);
    });
    
    startTimer();
}

// Check answer
function checkAnswer(selectedAnswer, buttonElement) {
    clearInterval(gameState.timerInterval);
    
    const isCorrect = selectedAnswer === gameState.currentQuestion.correct;
    const allButtons = document.querySelectorAll('.answer-btn');
    
    allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === gameState.currentQuestion.correct) {
            btn.classList.add('correct');
        } else if (btn === buttonElement && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    
    if (isCorrect) {
        gameState.streak++;
        gameState.totalCorrectAnswers++;
        localStorage.setItem('totalCorrectAnswers', gameState.totalCorrectAnswers.toString());
        gameState.answeredQuestions.add(gameState.currentQuestion.question);
        
        let points = 100 + (gameState.level * 50) + (gameState.streak * 10);
        if (gameState.timeRemaining > 20) points += 50;
        
        // Character bonus
        if (gameState.selectedCharacter && characterAbilities[gameState.selectedCharacter].bonus.points) {
            points *= characterAbilities[gameState.selectedCharacter].bonus.points;
        }
        
        // Double points power-up
        if (gameState.powerUps.doublePoints.active) {
            points *= 2;
            gameState.powerUps.doublePoints.active = false;
        }
        
        // Streak bonus
        if (gameState.selectedCharacter === 'Achilles' && characterAbilities['Achilles'].bonus.streak) {
            points += gameState.streak * 20;
        }
        
        gameState.score += Math.floor(points);
        
        // Advance stage every 5 questions
        if (gameState.streak % 5 === 0) {
            gameState.stage++;
            showFeedback(`Stage ${gameState.stage} reached!`, true);
        }
        
        // Check achievements
        checkAchievements();
        
        showFeedback(`+${Math.floor(points)} points!`, true);
        setTimeout(() => loadQuestion(), 1500);
    } else {
        gameState.lives--;
        gameState.streak = 0;
        showFeedback("Wrong answer! You lost a life.", false);
        
        if (gameState.lives <= 0) {
            setTimeout(() => endGame(), 2000);
        } else {
            setTimeout(() => loadQuestion(), 2000);
        }
    }
    
    updateUI();
}

// Show feedback
function showFeedback(message, isSuccess) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = isSuccess ? 'feedback success' : 'feedback error';
    feedback.style.display = 'block';
    
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 2000);
}

// Power-ups
function useHint() {
    if (gameState.powerUps.hint.uses <= 0 || gameState.powerUps.hint.cooldown > 0) return;
    
    gameState.powerUps.hint.uses--;
    const wrongAnswers = document.querySelectorAll('.answer-btn:not(.correct)');
    const toRemove = Math.floor(wrongAnswers.length / 2);
    
    let removed = 0;
    wrongAnswers.forEach(btn => {
        if (removed < toRemove && btn.textContent !== gameState.currentQuestion.correct) {
            btn.style.opacity = '0.3';
            btn.disabled = true;
            removed++;
        }
    });
    
    gameState.powerUps.hint.cooldown = 3;
    startCooldown('hint');
    trackPowerUpUsage('hint');
    updateUI();
}

function useStrike() {
    if (gameState.powerUps.strike.uses <= 0 || gameState.powerUps.strike.cooldown > 0) return;
    
    gameState.powerUps.strike.uses--;
    const wrongAnswers = document.querySelectorAll('.answer-btn');
    wrongAnswers.forEach(btn => {
        if (btn.textContent !== gameState.currentQuestion.correct) {
            btn.style.opacity = '0.3';
            btn.disabled = true;
        }
    });
    
    gameState.powerUps.strike.cooldown = 5;
    startCooldown('strike');
    trackPowerUpUsage('strike');
    updateUI();
}

function useTimeFreeze() {
    if (gameState.powerUps.timeFreeze.uses <= 0 || gameState.powerUps.timeFreeze.cooldown > 0) return;
    
    gameState.powerUps.timeFreeze.uses--;
    gameState.timeRemaining += 15;
    gameState.powerUps.timeFreeze.cooldown = 4;
    startCooldown('timeFreeze');
    trackPowerUpUsage('timeFreeze');
    updateUI();
}

function useDoublePoints() {
    if (gameState.powerUps.doublePoints.uses <= 0 || gameState.powerUps.doublePoints.active) return;
    
    gameState.powerUps.doublePoints.active = true;
    gameState.powerUps.doublePoints.uses--;
    trackPowerUpUsage('doublePoints');
    updateUI();
    showFeedback("Double Points activated for next answer!", true);
}

function startCooldown(power) {
    const interval = setInterval(() => {
        gameState.powerUps[power].cooldown--;
        updateUI();
        
        if (gameState.powerUps[power].cooldown <= 0) {
            clearInterval(interval);
        }
    }, 1000);
}

// End game
function endGame() {
    clearInterval(gameState.timerInterval);
    
    // Save high score
    const highScore = localStorage.getItem('greekGameHighScore') || 0;
    if (gameState.score > highScore) {
        localStorage.setItem('greekGameHighScore', gameState.score);
        localStorage.setItem('greekGameHighScoreLevel', gameState.level);
    }
    
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-level').textContent = gameState.level;
    document.getElementById('high-score').textContent = Math.max(gameState.score, highScore);
}

// Start game
function startQuest() {
    // Apply character bonuses
    if (gameState.selectedCharacter === 'Perseus') {
        gameState.lives += characterAbilities['Perseus'].bonus.lives;
    }
    if (gameState.selectedCharacter === 'Athena') {
        gameState.powerUps.hint.uses += characterAbilities['Athena'].bonus.hints;
    }
    
    document.getElementById('quest-intro').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('game-stats').style.display = 'flex';
    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('controls').style.display = 'block';
    
    updateUI();
    loadQuestion();
}

// Select character
function selectCharacter(character) {
    gameState.selectedCharacter = character;
    document.getElementById('character-selection').style.display = 'none';
    document.getElementById('quest-intro').style.display = 'block';
    document.getElementById('storyline').textContent = 
        `Welcome, ${characterAbilities[character].name}. ${characterAbilities[character].description}. Your quest begins now!`;
    document.getElementById('character-ability').textContent = 
        `Ability: ${characterAbilities[character].ability}`;
}

// Select difficulty
function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
}

// Select category
function selectCategory(category) {
    gameState.category = category;
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('character-selection').style.display = 'block';
}

// Restart game
function restartGame() {
    // Reset power-up usage tracking for new game
    localStorage.setItem('powerUpsUsed', JSON.stringify({}));
    
    gameState = {
        score: 0,
        lives: 3,
        streak: 0,
        level: 1,
        stage: 1,
        currentQuestionIndex: 0,
        selectedCharacter: null,
        difficulty: 'medium',
        category: 'all',
        timeRemaining: 30,
        timerInterval: null,
        powerUps: {
            hint: { uses: 3, cooldown: 0 },
            strike: { uses: 2, cooldown: 0 },
            timeFreeze: { uses: 2, cooldown: 0 },
            doublePoints: { uses: 1, active: false }
        },
        answeredQuestions: new Set(),
        totalCorrectAnswers: parseInt(localStorage.getItem('totalCorrectAnswers') || '0'),
        achievementsUnlocked: new Set()
    };
    
    // Reload achievements (persistent across games)
    loadAchievements();
    
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('difficulty-selection').style.display = 'block';
    document.getElementById('progress-container').style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load achievements on page load
    loadAchievements();
    
    // Character selection
    Object.keys(characterAbilities).forEach(char => {
        const btn = document.getElementById(`character-${char.toLowerCase()}`);
        if (btn) {
            btn.onclick = () => selectCharacter(char);
        }
    });
    
    // Difficulty selection
    ['easy', 'medium', 'hard'].forEach(diff => {
        const btn = document.getElementById(`difficulty-${diff}`);
        if (btn) {
            btn.onclick = () => selectDifficulty(diff);
        }
    });
    
    // Category selection
    ['all', 'rise', 'golden', 'decline'].forEach(cat => {
        const btn = document.getElementById(`category-${cat}`);
        if (btn) {
            btn.onclick = () => selectCategory(cat);
        }
    });
    
    // Start quest button
    document.getElementById('start-quest').onclick = startQuest;
    
    // Power-up buttons
    document.getElementById('power-hint').onclick = useHint;
    document.getElementById('power-strike').onclick = useStrike;
    document.getElementById('power-timeFreeze').onclick = useTimeFreeze;
    document.getElementById('power-doublePoints').onclick = useDoublePoints;
    
    // Restart button
    document.getElementById('restart-game').onclick = restartGame;
    
    // Show high score
    const highScore = localStorage.getItem('greekGameHighScore') || 0;
    if (highScore > 0) {
        document.getElementById('home-high-score').textContent = `High Score: ${highScore}`;
    }
});
