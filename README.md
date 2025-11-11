# 🏛️ Greek Quests Game

<div align="center">

**An interactive educational quiz game exploring the rise and fall of Ancient Greece**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Features](#-features) • [How to Play](#-how-to-play) • [Game Mechanics](#-game-mechanics) • [Technical Details](#-technical-details)

</div>

---

## 📖 Overview

**Greek Quests Game** is a browser-based educational quiz game that makes learning about Ancient Greek history engaging and interactive. Players answer questions across three historical periods while managing resources, using power-ups, and progressing through levels.

### 🎯 Learning Objectives

- Explore the foundations of Greek civilization (Minoan & Mycenaean)
- Understand the Golden Age of Classical Greece
- Learn about the decline and fall of Greek independence
- Master historical facts through gamified repetition

---

## ✨ Features

### 🎮 Core Gameplay
- **Three Difficulty Levels**: Easy, Medium, and Hard
- **70+ Historical Questions**: Comprehensive coverage of Ancient Greek history
- **Progressive Difficulty**: Questions get harder as you advance
- **Timer System**: Answer quickly for bonus points
- **Lives System**: Three chances to prove your knowledge

### 🏛️ Historical Content
- **The Rise of Greece**: Minoan & Mycenaean civilizations, Archaic Period
- **Golden Age**: Classical period, Persian Wars, Peloponnesian War
- **Decline & Fall**: Macedonian conquest, Hellenistic period, Roman conquest

### ⚡ Character System
Choose from 5 unique heroes, each with special abilities:
- **Odysseus** - 50% time bonus on questions
- **Heracles** - Double points for correct answers
- **Perseus** - Start with 1 extra life
- **Athena** - Get 1 extra hint use
- **Achilles** - Double streak bonuses

### 💎 Power-Ups
Strategic resources to help you succeed:
- **Ask Athena** (Hint) - Eliminates 50% of wrong answers
- **Zeus' Strike** - Eliminates all wrong answers
- **Time Freeze** - Adds 15 seconds to the timer
- **Double Points** - Doubles points for next correct answer

### 📊 Game Systems
- **Dynamic Scoring**: Points based on difficulty, streak, time remaining, and character bonuses
- **Progress Tracking**: Visual progress bar showing advancement to next stage
- **High Score System**: LocalStorage persistence for competitive play
- **Streak System**: Build combos for bonus points
- **Level Progression**: Advance through stages every 5 correct answers

---

## 🚀 How to Play

### Quick Start

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Select** your difficulty level (Easy, Medium, or Hard)
4. **Choose** a historical period or play all periods
5. **Pick** your hero character
6. **Answer** questions correctly to earn points
7. **Use** power-ups strategically
8. **Beat** your high score!

### Gameplay Tips

- ⏱️ Answer quickly for time bonuses
- 🔥 Build streaks for multiplier bonuses
- 💡 Use hints wisely - they're limited!
- 🎯 Choose your character based on your playstyle
- 📈 Progress resets when you advance levels

---

## 🎮 Game Mechanics

### Scoring System

Points are calculated using a dynamic formula:

```
Base Points = 100 + (Level × 50) + (Streak × 10)
Time Bonus = +50 if time remaining > 20 seconds
Character Multipliers = Applied based on selected hero
Power-Up Multipliers = Double Points activates 2× multiplier
```

### Progression System

- **Stages**: Advance every 5 correct answers
- **Levels**: Increase automatically, affecting difficulty and timer
- **Difficulty Scaling**: Timer decreases by 2 seconds per level (minimum 15s)

### Power-Up Mechanics

- **Cooldowns**: Some power-ups have cooldown periods
- **Limited Uses**: Each power-up has a maximum number of uses
- **Strategic Timing**: Use power-ups at critical moments for maximum effect

---

## 🛠️ Technical Details

### Architecture

```
Greek-game/
├── index.html      # Main game interface and structure
├── game.js         # Game logic, state management, and question database
├── style.css       # Styling, animations, and responsive design
└── README.md       # Project documentation
```

### Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: No frameworks - pure JS for game logic
- **LocalStorage API**: Persistent high score storage

### Key Features

- **State Management**: Centralized game state object
- **Question Database**: Organized by category and difficulty
- **Dynamic UI Updates**: Real-time feedback and animations
- **Timer System**: Interval-based countdown with visual warnings
- **Set Data Structure**: Efficient tracking of answered questions

### Code Highlights

- **Dynamic Scoring Calculation**: Multi-factor point system
- **Power-Up Cooldown System**: Interval-based countdown timers
- **Question Shuffling**: Fisher-Yates algorithm for randomization
- **Progressive Difficulty**: Adaptive timer and question selection

---

## 📚 Question Topics

The game covers comprehensive historical content:

### The Rise of Greece
- Minoan Civilization (c. 3000–1450 BCE)
- Mycenaean Civilization (c. 1600–1100 BCE)
- Greek Dark Ages
- Archaic Period and Birth of the Polis
- Political evolution (Monarchies → Oligarchies → Tyrannies → Democracies)

### Golden Age
- Classical Greece and Athenian democracy
- Persian Wars (Marathon, Thermopylae, Salamis)
- Peloponnesian War
- Pericles and the Golden Age of Athens
- Spartan hegemony

### Decline & Fall
- Constant warfare after Peloponnesian War
- Macedonian conquest (Philip II, Alexander the Great)
- Hellenistic Period
- Roman conquest and decline
- End of Greek independence

---

## 🎨 Design Features

- **Modern UI**: Clean, gradient-based design
- **Smooth Animations**: CSS transitions and keyframe animations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Visual Feedback**: Color-coded correct/incorrect answers
- **Progress Indicators**: Visual progress bar and stat displays

---

## 📝 File Structure

| File | Description |
|------|-------------|
| `index.html` | Main HTML structure, game interface, and UI elements |
| `game.js` | Game logic, state management, question database (70+ questions), scoring system |
| `style.css` | Styling, animations, responsive design, and visual effects |
| `README.md` | Project documentation |

---

## 🔮 Future Enhancements

Potential features for future versions:

- [ ] Achievement system with badges
- [ ] Detailed statistics and analytics
- [ ] Sound effects and background music
- [ ] Multiplayer/leaderboard functionality
- [ ] Question explanations after answers
- [ ] Practice mode with unlimited lives
- [ ] Daily challenges
- [ ] Export/import save data

---

## 🤝 Contributing

Contributions are welcome! If you'd like to:

- Add more historical questions
- Improve the UI/UX
- Fix bugs or optimize code
- Add new features

Please feel free to submit a pull request or open an issue.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Will Norton**

- GitHub: [@wnorton26-sketch](https://github.com/wnorton26-sketch)

---

## 🙏 Acknowledgments

- Historical content based on academic sources
- Inspired by educational gamification principles
- Built with modern web technologies

---

<div align="center">

**Made with ❤️ for learning Ancient Greek history**

⭐ Star this repo if you find it helpful!

</div>
