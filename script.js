/* =====================================================
   MARVEL LIFE RPG
   VERSION 1

   IMPORTANT RULE:

   THE PLAYER CONTROLS THEIR CHARACTER.

   THE GAME NEVER DECIDES:
   - player's dialogue
   - player's thoughts
   - player's feelings
   - player's actions
   - player's movement

   NPCs control themselves.
   ===================================================== */


/* =====================================================
   NPC DATABASE
   ===================================================== */

const NPC_DATABASE = {

  Tony: {
    name: "Tony Stark",

    personality:
      "sarcastic, intelligent, fast-talking, observant",

    relationship: 0,

    memories: []
  },

  Natasha: {
    name: "Natasha Romanoff",

    personality:
      "quiet, direct, perceptive, controlled",

    relationship: 0,

    memories: []
  },

  Steve: {
    name: "Steve Rogers",

    personality:
      "polite, steady, sincere, protective",

    relationship: 0,

    memories: []
  },

  Peter: {
    name: "Peter Parker",

    personality:
      "awkward, funny, enthusiastic, intelligent",

    relationship: 0,

    memories: []
  },

  Bruce: {
    name: "Bruce Banner",

    personality:
      "calm, thoughtful, scientific",

    relationship: 0,

    memories: []
  }

};


/* =====================================================
   GAME STATE
   ===================================================== */

let game = {

  player: null,

  day: 1,

  week: 1,

  time: "9:00 AM",

  location: "Avengers Tower",

  goal:
    "Meet the Avengers and learn your first assignment.",

  goals: [

    {
      text: "Arrive at Avengers Tower",
      completed: true
    },

    {
      text: "Meet the Avengers",
      completed: false
    },

    {
      text: "Learn your first assignment",
      completed: false
    }

  ],

  npcs: structuredClone(NPC_DATABASE),

  story: []

};


/* =====================================================
   SAVE GAME
   ===================================================== */

function saveGame() {

  localStorage.setItem(
    "marvelLifeSave",
    JSON.stringify(game)
  );

  document.getElementById(
    "saveStatus"
  ).textContent =
    "Saved locally • " +
    new Date().toLocaleTimeString();

}


/* =====================================================
   LOAD GAME
   ===================================================== */

function loadGame() {

  const saved =
    localStorage.getItem(
      "marvelLifeSave"
    );

  if (!saved) return false;

  try {

    game = JSON.parse(saved);

    return true;

  }

  catch {

    return false;

  }

}


/* =====================================================
   START GAME
   ===================================================== */

function startGame() {

  const name =
    document.getElementById("name")
      .value.trim();

  if (!name) {

    alert(
      "Your character needs a name!"
    );

    return;

  }


  game.player = {

    name: name,

    age:
      Number(
        document.getElementById("age").value
      ) || 16,

    role:
      document.getElementById("role").value,

    description:
      document.getElementById(
        "description"
      ).value.trim()

  };


  document
    .getElementById("creator")
    .classList.add("hidden");

  document
    .getElementById("game")
    .classList.remove("hidden");


  addStory(
    "narrator",
    "",
    `DAY 1 — ${game.time}

Avengers Tower.

The elevator doors open onto the main floor.

The Tower is already busy.

Your new role is officially beginning today.

The world is waiting for YOUR character's decision.`
  );


  addStory(
    "npc",
    "Tony Stark",

    `Tony looks up from a tablet.

"You're the new ${game.player.role}, right?

Okay. Good.

Please tell me somebody gave you a schedule, because I absolutely did not."`
  );


  addStory(
    "npc",
    "Natasha Romanoff",

    `Natasha glances over.

"Welcome."`
  );


  addStory(
    "npc",
    "Peter Parker",

    `A voice comes from somewhere behind Tony.

"Wait—new person?"

Peter looks over.

"Oh. Hi."`
  );


  addStory(
    "system",
    "WORLD",

    `You control ONLY your character.

NPCs control themselves.

If an NPC asks your character a question, the game waits for YOUR answer.`
  );


  updateUI();

  saveGame();

}


/* =====================================================
   ADD STORY ENTRY
   ===================================================== */

function addStory(
  type,
  speaker,
  text
) {

  game.story.push({

    type: type,

    speaker: speaker,

    text: text

  });

  renderStory();

  saveGame();

}


/* =====================================================
   RENDER STORY
   ===================================================== */

function renderStory() {

  const container =
    document.getElementById(
      "storyLog"
    );

  container.innerHTML = "";


  game.story.forEach(entry => {

    const box =
      document.createElement("div");

    box.className =
      "entry " + entry.type;


    if (entry.speaker) {

      const speaker =
        document.createElement("div");

      speaker.className =
        "speaker";

      speaker.textContent =
        entry.speaker;

      box.appendChild(speaker);

    }


    const text =
      document.createElement("div");

    text.textContent =
      entry.text;

    box.appendChild(text);


    container.appendChild(box);

  });


  container.scrollTop =
    container.scrollHeight;

}


/* =====================================================
   RELATIONSHIP SYSTEM
   ===================================================== */

function relationshipStatus(
  points
) {

  if (points >= 80)
    return "Found Family";

  if (points >= 60)
    return "Trusted";

  if (points >= 40)
    return "Close Friend";

  if (points >= 20)
    return "Friendly";

  if (points >= 5)
    return "Acquaintance";

  return "Stranger";

}


/* =====================================================
   CHANGE RELATIONSHIP
   ===================================================== */

function changeRelationship(
  npcKey,
  amount,
  memory
) {

  const npc =
    game.npcs[npcKey];

  if (!npc) return;


  npc.relationship =
    Math.max(
      0,
      Math.min(
        100,
        npc.relationship + amount
      )
    );


  /*
    IMPORTANT:

    The player does NOT see
    "Tony = 37 points".

    They only see the relationship
    stage.

    The numerical value is hidden.
  */


  if (memory) {

    npc.memories.push({

      day: game.day,

      location: game.location,

      memory: memory

    });

  }

}


/* =====================================================
   NPC MEMORY
   ===================================================== */

function remember(
  npcKey,
  memory
) {

  const npc =
    game.npcs[npcKey];

  if (!npc) return;


  npc.memories.push({

    day: game.day,

    location: game.location,

    memory: memory

  });

}


/* =====================================================
   SEND PLAYER MESSAGE
   ===================================================== */

function sendMessage() {

  const input =
    document.getElementById(
      "playerInput"
    );

  const text =
    input.value.trim();


  if (!text) return;


  /*
    THIS IS IMPORTANT.

    Whatever the player writes is treated
    as THEIR character's input.

    We do NOT add thoughts such as:

    "They felt nervous."

    unless the player explicitly writes it.
  */


  addStory(
    "player",
    game.player.name,
    text
  );


  input.value = "";


  processPrototypeResponse(
    text
  );

}


/* =====================================================
   TEMPORARY NPC ENGINE
   =====================================================

   THIS PART WILL EVENTUALLY BE REPLACED
   BY THE REAL AI BACKEND.

   It exists so the game is playable
   before connecting an AI API.
   ===================================================== */

function processPrototypeResponse(
  playerText
) {

  const text =
    playerText.toLowerCase();


  /* GREETING */

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {

    addStory(
      "npc",
      "Peter Parker",

      `Peter gives a small wave.

"Hey. I'm Peter."`
    );


    changeRelationship(
      "Peter",
      2,
      "The player greeted Peter."
    );


    addStory(
      "npc",
      "Tony Stark",

      `Tony looks between you and Peter.

"Great. Introductions. Humanity survives another day."`
    );


    changeRelationship(
      "Tony",
      2,
      "The player greeted the team."
    );

  }


  /* THANK YOU */

  else if (
    text.includes("thank")
  ) {

    addStory(
      "npc",
      "Natasha Romanoff",

      `Natasha gives a small nod.

"You're welcome."`
    );


    changeRelationship(
      "Natasha",
      2,
      "The player expressed gratitude."
    );

  }


  /* WHO ARE YOU */

  else if (
    text.includes("who are you")
  ) {

    addStory(
      "npc",
      "Tony Stark",

      `"Tony Stark."

He pauses.

"You've probably heard of me."`
    );


    remember(
      "Tony",
      "The player asked who Tony was."
    );

  }


  /* QUESTION */

  else if (
    text.includes("?")
  ) {

    addStory(
      "npc",
      "Steve Rogers",

      `Steve considers the question.

"That's something we can figure out together."`
    );

  }


  /* DEFAULT */

  else {

    addStory(
      "npc",
      "Tony Stark",

      `Tony studies you for a moment.

"Okay.

Noted."`
    );


    addStory(
      "npc",
      "Natasha Romanoff",

      `Natasha remains nearby.

"We'll see how the day goes."`
    );

  }


  /* COMPLETE FIRST MEETING */

  game.goals[1].completed = true;

  game.goals[2].completed = true;

  game.goal =
    "Begin your first assignment at the Tower.";


  updateUI();

  saveGame();

}


/* =====================================================
   UPDATE UI
   ===================================================== */

function updateUI() {

  if (!game.player)
    return;


  /* PLAYER */

  document.getElementById(
    "playerInfo"
  ).innerHTML = `

    <strong>
      ${escapeHTML(game.player.name)}
    </strong>

    <br><br>

    Age: ${game.player.age}

    <br>

    ${escapeHTML(game.player.role)}

    <br><br>

    ${escapeHTML(
      game.player.description ||
      "No description."
    )}

  `;


  /* WORLD */

  document.getElementById(
    "worldInfo"
  ).innerHTML = `

    Day ${game.day}

    <br>

    Week ${game.week}

    <br>

    ${game.time}

    <br><br>

    ${escapeHTML(game.location)}

  `;


  /* GOALS */

  const goals =
    document.getElementById(
      "goals"
    );

  goals.innerHTML = `

    <strong>
      ${escapeHTML(game.goal)}
    </strong>

    <br><br>

  `;


  game.goals.forEach(goal => {

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "goal " +
      (
        goal.completed
          ? "completed"
          : ""
      );

    div.textContent =
      "• " + goal.text;

    goals.appendChild(div);

  });


  /* RELATIONSHIPS */

  const relationshipBox =
    document.getElementById(
      "relationships"
    );

  relationshipBox.innerHTML = "";


  Object.values(
    game.npcs
  ).forEach(npc => {

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "relationship";

    div.innerHTML = `

      <span>
        ${escapeHTML(npc.name)}
      </span>

      <span class="status">
        ${escapeHTML(
          relationshipStatus(
            npc.relationship
          )
        )}
      </span>

    `;

    relationshipBox.appendChild(div);

  });

}


/* =====================================================
   SECURITY / TEXT ESCAPING
   ===================================================== */

function escapeHTML(text) {

  return String(text)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


/* =====================================================
   RESET
   ===================================================== */

function resetGame() {

  const confirmReset =
    confirm(
      "Delete your entire story?"
    );

  if (!confirmReset)
    return;


  localStorage.removeItem(
    "marvelLifeSave"
  );

  location.reload();

}


/* =====================================================
   AUTOMATIC SAVE RESTORE
   ===================================================== */

if (loadGame()) {

  if (game.player) {

    document
      .getElementById(
        "creator"
      )
      .classList.add("hidden");


    document
      .getElementById(
        "game"
      )
      .classList.remove("hidden");


    renderStory();

    updateUI();

  }

}
