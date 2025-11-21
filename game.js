/**
 * ============================================
 * GAME STATE MANAGEMENT
 * ============================================
 * Centralized state object that tracks all game data.
 * Uses JavaScript Set for efficient duplicate question tracking (O(1) lookup).
 * Integrates with localStorage for persistent data across sessions.
 */
let gameState = {
    score: 0,                          // Current player score
    lives: 3,                          // Number of lives remaining
    streak: 0,                         // Consecutive correct answers
    level: 1,                          // Current difficulty level
    stage: 1,                          // Current stage (advances every 5 questions)
    currentQuestionIndex: 0,           // Index of current question
    selectedCharacter: null,           // Character chosen by player
    difficulty: 'medium',              // Difficulty level: 'easy', 'medium', or 'hard'
    category: 'all',                   // Question category: 'all', 'rise', 'golden', or 'decline'
    timeRemaining: 30,                 // Time left to answer current question (seconds)
    timerInterval: null,               // Reference to setInterval for timer countdown
    powerUps: {                        // Power-up system with uses and cooldowns
        hint: { uses: 3, cooldown: 0 },        // Eliminates 50% of wrong answers
        strike: { uses: 2, cooldown: 0 },      // Eliminates all wrong answers
        timeFreeze: { uses: 2, cooldown: 0 }, // Adds 15 seconds to timer
        doublePoints: { uses: 1, active: false } // Doubles points for next answer
    },
    answeredQuestions: new Set(),      // Set of answered questions (prevents duplicates)
    totalCorrectAnswers: parseInt(localStorage.getItem('totalCorrectAnswers') || '0'), // Lifetime total
    achievementsUnlocked: new Set()    // Set of unlocked achievement IDs
};

/**
 * ============================================
 * ACHIEVEMENT SYSTEM
 * ============================================
 * Defines all achievements with their conditions.
 * Each achievement has:
 * - id: Unique identifier
 * - title: Display name
 * - description: What the achievement is for
 * - icon: Emoji icon
 * - check: Function that returns true when achievement should unlock
 * 
 * Uses functional programming pattern - each achievement defines its own check function.
 */
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

/**
 * Load achievements from localStorage
 * Converts JSON array back to Set data structure for efficient lookups
 */
function loadAchievements() {
    const saved = localStorage.getItem('achievements');
    if (saved) {
        gameState.achievementsUnlocked = new Set(JSON.parse(saved));
    }
}

/**
 * Save achievements to localStorage
 * Converts Set to array using spread operator for JSON serialization
 */
function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify([...gameState.achievementsUnlocked]));
}

/**
 * Check and unlock achievements
 * Iterates through all achievements and checks if conditions are met
 * Only unlocks if not already unlocked (prevents duplicate notifications)
 */
function checkAchievements() {
    Object.values(achievements).forEach(achievement => {
        if (!gameState.achievementsUnlocked.has(achievement.id) && achievement.check()) {
            unlockAchievement(achievement);
        }
    });
}

/**
 * Unlock and display achievement popup
 * Updates state, saves to localStorage, and shows animated popup notification
 * @param {Object} achievement - The achievement object to unlock
 */
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

/**
 * Track power-up usage for achievement system
 * Stores which power-ups have been used in current game session
 * Used to unlock "Strategic Master" achievement (all power-ups used)
 * @param {string} powerName - Name of the power-up that was used
 */
function trackPowerUpUsage(powerName) {
    const used = JSON.parse(localStorage.getItem('powerUpsUsed') || '{}');
    used[powerName] = true;
    localStorage.setItem('powerUpsUsed', JSON.stringify(used));
    checkAchievements(); // Check if "all power-ups used" achievement should unlock
}

/**
 * ============================================
 * QUESTION DATABASE
 * ============================================
 * Organized by category (rise, golden, decline) and difficulty (easy, medium, hard)
 * Each question object contains:
 * - question: The question text
 * - answers: Array of 4 possible answers
 * - correct: The correct answer string
 * 
 * Total: 70+ historical questions about Ancient Greece
 */
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

/**
 * ============================================
 * CHARACTER ABILITIES SYSTEM
 * ============================================
 * Defines unique abilities for each playable character.
 * Each character modifies gameplay in different ways:
 * - Odysseus: Time bonus (50% more time)
 * - Heracles: Double points multiplier
 * - Perseus: Extra life at start
 * - Athena: Extra hint use
 * - Achilles: Double streak bonuses
 */
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

/**
 * Get available questions based on category and difficulty
 * Filters out already-answered questions using Set (O(1) lookup)
 * Uses Fisher-Yates shuffle algorithm for true randomization
 * @returns {Array} Array of question objects with category property added
 */
function getQuestions() {
    let availableQuestions = [];
    
    // If "all" categories selected, combine questions from all categories
    if (gameState.category === 'all') {
        Object.keys(questionsDatabase).forEach(cat => {
            questionsDatabase[cat][gameState.difficulty].forEach(q => {
                // Use Set.has() for O(1) duplicate checking
                if (!gameState.answeredQuestions.has(q.question)) {
                    availableQuestions.push({ ...q, category: cat });
                }
            });
        });
    } else {
        // Single category selected
        questionsDatabase[gameState.category][gameState.difficulty].forEach(q => {
            if (!gameState.answeredQuestions.has(q.question)) {
                availableQuestions.push({ ...q, category: gameState.category });
            }
        });
    }
    
    /**
     * Fisher-Yates Shuffle Algorithm
     * More efficient than sorting with Math.random()
     * Time complexity: O(n), Space complexity: O(1)
     * Ensures true random distribution
     */
    for (let i = availableQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements using destructuring
        [availableQuestions[i], availableQuestions[j]] = [availableQuestions[j], availableQuestions[i]];
    }
    
    return availableQuestions;
}

/**
 * Update all UI elements with current game state
 * Called after any state change to keep UI synchronized
 * Updates: score, lives, streak, level/stage, timer, power-ups, progress bar
 */
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

/**
 * Update progress bar to show advancement toward next stage
 * Progress resets every 5 questions (when stage advances)
 * Calculates percentage and updates visual fill bar
 */
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

/**
 * Update power-up button states and display
 * Shows remaining uses and cooldown timers
 * Disables buttons when uses are depleted or on cooldown
 */
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

/**
 * Start countdown timer for current question
 * Timer decreases by 2 seconds per level (progressive difficulty)
 * Minimum time is 15 seconds
 * Character abilities can modify timer (e.g., Odysseus gets 50% bonus)
 * Uses setInterval for asynchronous countdown
 */
function startTimer() {
    // Clear any existing timer to prevent multiple intervals
    clearInterval(gameState.timerInterval);
    
    // Calculate base time: decreases by 2 seconds per level
    const baseTime = 30 - (gameState.level - 1) * 2;
    gameState.timeRemaining = Math.max(15, baseTime); // Minimum 15 seconds
    
    // Apply character time bonus if applicable
    if (gameState.selectedCharacter && characterAbilities[gameState.selectedCharacter].bonus.time) {
        gameState.timeRemaining = Math.floor(gameState.timeRemaining * characterAbilities[gameState.selectedCharacter].bonus.time);
    }
    
    // Reset visual warning state
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
        timeDisplay.classList.remove('time-warning');
    }
    
    updateUI();
    
    // Set up interval to count down every second
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateUI();
        
        // Add visual warning when time is low (5 seconds or less)
        const timeDisplay = document.getElementById('time-display');
        if (gameState.timeRemaining <= 5) {
            timeDisplay.classList.add('time-warning');
        } else {
            timeDisplay.classList.remove('time-warning');
        }
        
        // Handle time running out
        if (gameState.timeRemaining <= 0) {
            timeUp();
        }
    }, 1000); // Update every 1000ms (1 second)
}

/**
 * Handle timer expiration
 * Player loses a life and streak resets
 * Game ends if no lives remaining
 */
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

/**
 * Load and display a new question
 * Handles level progression when all questions are answered
 * Randomly selects from available questions
 * Shuffles answer order to prevent pattern recognition
 * Dynamically creates answer buttons
 */
function loadQuestion() {
    const questions = getQuestions();
    
    // If no questions available, advance to next level
    if (questions.length === 0) {
        gameState.level++;
        gameState.stage++;
        gameState.answeredQuestions.clear(); // Reset answered questions for new level
        // Increase difficulty based on level
        gameState.difficulty = gameState.level > 3 ? 'hard' : gameState.level > 1 ? 'medium' : 'easy';
        showFeedback(`Level ${gameState.level} reached!`, true);
        checkAchievements(); // Check level-based achievements
    }
    
    // Get questions again after potential level advancement
    const questionsAvailable = getQuestions();
    if (questionsAvailable.length === 0) {
        endGame(); // No more questions available
        return;
    }
    
    // Randomly select a question from available pool
    const randomIndex = Math.floor(Math.random() * questionsAvailable.length);
    const currentQuestion = questionsAvailable[randomIndex];
    gameState.currentQuestion = currentQuestion;
    
    // Get DOM elements
    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');
    const categoryElement = document.getElementById('category');
    
    // Map category codes to display names
    const categoryNames = {
        'rise': 'The Rise of Greece',
        'golden': 'Golden Age',
        'decline': 'Decline & Fall'
    };
    
    // Display question and category
    questionElement.textContent = currentQuestion.question;
    categoryElement.textContent = `Period: ${categoryNames[currentQuestion.category] || currentQuestion.category}`;
    answersElement.innerHTML = ''; // Clear previous answers
    
    // Shuffle answers to randomize position (prevents memorizing positions)
    const shuffledAnswers = [...currentQuestion.answers].sort(() => Math.random() - 0.5);
    
    // Create answer buttons dynamically
    shuffledAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.onclick = () => checkAnswer(answer, button);
        answersElement.appendChild(button);
    });
    
    startTimer(); // Start countdown timer
}

/**
 * Check if selected answer is correct and handle scoring
 * Implements dynamic scoring system with multiple multipliers
 * Formula: Base Points + Level Bonus + Streak Bonus + Time Bonus + Character Multipliers + Power-up Multipliers
 * 
 * @param {string} selectedAnswer - The answer selected by the player
 * @param {HTMLElement} buttonElement - The button element that was clicked
 */
function checkAnswer(selectedAnswer, buttonElement) {
    // Stop timer when answer is selected
    clearInterval(gameState.timerInterval);
    
    // Check if answer is correct
    const isCorrect = selectedAnswer === gameState.currentQuestion.correct;
    const allButtons = document.querySelectorAll('.answer-btn');
    
    // Disable all buttons and add visual feedback
    allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === gameState.currentQuestion.correct) {
            btn.classList.add('correct'); // Highlight correct answer in green
        } else if (btn === buttonElement && !isCorrect) {
            btn.classList.add('wrong'); // Highlight wrong selection in red
        }
    });
    
    if (isCorrect) {
        // CORRECT ANSWER HANDLING
        gameState.streak++;
        gameState.totalCorrectAnswers++;
        // Save total to localStorage for persistent tracking
        localStorage.setItem('totalCorrectAnswers', gameState.totalCorrectAnswers.toString());
        // Add question to Set to prevent duplicates
        gameState.answeredQuestions.add(gameState.currentQuestion.question);
        
        /**
         * DYNAMIC SCORING CALCULATION
         * Base: 100 points
         * Level bonus: +50 per level (encourages progression)
         * Streak bonus: +10 per consecutive correct answer (encourages consistency)
         * Time bonus: +50 if answered quickly (encourages speed)
         */
        let points = 100 + (gameState.level * 50) + (gameState.streak * 10);
        if (gameState.timeRemaining > 20) points += 50;
        
        // Character ability multipliers (e.g., Heracles doubles all points)
        if (gameState.selectedCharacter && characterAbilities[gameState.selectedCharacter].bonus.points) {
            points *= characterAbilities[gameState.selectedCharacter].bonus.points;
        }
        
        // Double points power-up multiplier
        if (gameState.powerUps.doublePoints.active) {
            points *= 2;
            gameState.powerUps.doublePoints.active = false; // Deactivate after use
        }
        
        // Special character streak bonus (Achilles gets extra points per streak)
        if (gameState.selectedCharacter === 'Achilles' && characterAbilities['Achilles'].bonus.streak) {
            points += gameState.streak * 20;
        }
        
        // Add points to total score
        gameState.score += Math.floor(points);
        
        // Advance stage every 5 consecutive correct answers
        if (gameState.streak % 5 === 0) {
            gameState.stage++;
            showFeedback(`Stage ${gameState.stage} reached!`, true);
        }
        
        // Check for achievement unlocks
        checkAchievements();
        
        // Show positive feedback and load next question after delay
        showFeedback(`+${Math.floor(points)} points!`, true);
        setTimeout(() => loadQuestion(), 1500);
    } else {
        // WRONG ANSWER HANDLING
        gameState.lives--;
        gameState.streak = 0; // Reset streak on wrong answer
        
        showFeedback("Wrong answer! You lost a life.", false);
        
        // Check if game should end
        if (gameState.lives <= 0) {
            setTimeout(() => endGame(), 2000);
        } else {
            // Continue with next question after delay
            setTimeout(() => loadQuestion(), 2000);
        }
    }
    
    // Update UI with new state
    updateUI();
}

/**
 * Display feedback message to player
 * Shows success (green) or error (red) messages
 * Auto-hides after 2 seconds
 * 
 * @param {string} message - The message to display
 * @param {boolean} isSuccess - True for success styling, false for error styling
 */
function showFeedback(message, isSuccess) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = isSuccess ? 'feedback success' : 'feedback error';
    feedback.style.display = 'block';
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 2000);
}

/**
 * ============================================
 * POWER-UP FUNCTIONS
 * ============================================
 * Each power-up has limited uses and cooldown periods
 * Tracks usage for achievement system
 */

/**
 * Use Hint power-up
 * Eliminates 50% of wrong answers (rounded down)
 * Has 3 uses and 3-second cooldown
 */
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

/**
 * Use Zeus' Strike power-up
 * Eliminates ALL wrong answers (leaves only correct answer visible)
 * Has 2 uses and 5-second cooldown
 */
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

/**
 * Use Time Freeze power-up
 * Adds 15 seconds to the current timer
 * Has 2 uses and 4-second cooldown
 */
function useTimeFreeze() {
    if (gameState.powerUps.timeFreeze.uses <= 0 || gameState.powerUps.timeFreeze.cooldown > 0) return;
    
    gameState.powerUps.timeFreeze.uses--;
    gameState.timeRemaining += 15;
    gameState.powerUps.timeFreeze.cooldown = 4;
    startCooldown('timeFreeze');
    trackPowerUpUsage('timeFreeze');
    updateUI();
}

/**
 * Use Double Points power-up
 * Doubles points for the next correct answer
 * Has 1 use and activates immediately (no cooldown)
 * Deactivates automatically after use
 */
function useDoublePoints() {
    if (gameState.powerUps.doublePoints.uses <= 0 || gameState.powerUps.doublePoints.active) return;
    
    gameState.powerUps.doublePoints.active = true;
    gameState.powerUps.doublePoints.uses--;
    trackPowerUpUsage('doublePoints');
    updateUI();
    showFeedback("Double Points activated for next answer!", true);
}

/**
 * Start cooldown timer for a power-up
 * Uses setInterval to count down cooldown every second
 * Automatically clears interval when cooldown reaches 0
 * 
 * @param {string} power - Name of the power-up (hint, strike, timeFreeze)
 */
function startCooldown(power) {
    const interval = setInterval(() => {
        gameState.powerUps[power].cooldown--;
        updateUI();
        
        if (gameState.powerUps[power].cooldown <= 0) {
            clearInterval(interval);
        }
    }, 1000);
}

/**
 * End game and display final results
 * Saves high score to localStorage if new record
 * Shows game over screen with final statistics
 */
function endGame() {
    clearInterval(gameState.timerInterval); // Stop timer
    
    // Check and save high score
    const highScore = localStorage.getItem('greekGameHighScore') || 0;
    if (gameState.score > highScore) {
        localStorage.setItem('greekGameHighScore', gameState.score);
        localStorage.setItem('greekGameHighScoreLevel', gameState.level);
    }
    
    // Hide game container and show game over screen
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-level').textContent = gameState.level;
    document.getElementById('high-score').textContent = Math.max(gameState.score, highScore);
}

/**
 * Start the game quest
 * Applies character bonuses (extra lives, hints)
 * Shows game interface and loads first question
 */
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

/**
 * Handle character selection
 * Updates game state and displays character information
 * 
 * @param {string} character - Character name (Odysseus, Heracles, etc.)
 */
function selectCharacter(character) {
    gameState.selectedCharacter = character;
    document.getElementById('character-selection').style.display = 'none';
    document.getElementById('quest-intro').style.display = 'block';
    document.getElementById('storyline').textContent = 
        `Welcome, ${characterAbilities[character].name}. ${characterAbilities[character].description}. Your quest begins now!`;
    document.getElementById('character-ability').textContent = 
        `Ability: ${characterAbilities[character].ability}`;
}

/**
 * Handle difficulty selection
 * Updates game state and shows category selection screen
 * 
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 */
function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
}

/**
 * Handle category selection
 * Updates game state and shows character selection screen
 * 
 * @param {string} category - 'all', 'rise', 'golden', or 'decline'
 */
function selectCategory(category) {
    gameState.category = category;
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('character-selection').style.display = 'block';
}

/**
 * Restart game and reset all state
 * Resets game state to initial values
 * Preserves achievements and total correct answers (persistent data)
 * Resets power-up usage tracking for new game session
 */
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

/**
 * ============================================
 * INITIALIZATION
 * ============================================
 * Sets up event listeners when DOM is fully loaded
 * Loads persistent data (achievements, high scores)
 * Binds all interactive elements to their functions
 */
document.addEventListener('DOMContentLoaded', () => {
    // Load achievements from localStorage on page load
    loadAchievements();
    
    // Set up character selection buttons dynamically
    Object.keys(characterAbilities).forEach(char => {
        const btn = document.getElementById(`character-${char.toLowerCase()}`);
        if (btn) {
            btn.onclick = () => selectCharacter(char);
        }
    });
    
    // Set up difficulty selection buttons
    ['easy', 'medium', 'hard'].forEach(diff => {
        const btn = document.getElementById(`difficulty-${diff}`);
        if (btn) {
            btn.onclick = () => selectDifficulty(diff);
        }
    });
    
    // Set up category selection buttons
    ['all', 'rise', 'golden', 'decline'].forEach(cat => {
        const btn = document.getElementById(`category-${cat}`);
        if (btn) {
            btn.onclick = () => selectCategory(cat);
        }
    });
    
    // Main game start button
    document.getElementById('start-quest').onclick = startQuest;
    
    // Power-up button event listeners
    document.getElementById('power-hint').onclick = useHint;
    document.getElementById('power-strike').onclick = useStrike;
    document.getElementById('power-timeFreeze').onclick = useTimeFreeze;
    document.getElementById('power-doublePoints').onclick = useDoublePoints;
    
    // Restart button
    document.getElementById('restart-game').onclick = restartGame;
    
    // Display high score on home screen if available
    const highScore = localStorage.getItem('greekGameHighScore') || 0;
    if (highScore > 0) {
        document.getElementById('home-high-score').textContent = `High Score: ${highScore}`;
    }
});
