const byId = (id) => document.getElementById(id);

function renderTable(container, headings, rows, rowHeadings = false) {
  const table = document.createElement("table");
  const header = table.createTHead().insertRow();
  headings.forEach((heading) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = heading;
    header.append(cell);
  });
  const body = table.createTBody();
  rows.forEach((values) => {
    const row = body.insertRow();
    let previousCell;
    values.forEach((value, index) => {
      if (rowHeadings && index > 1 && value === values[index - 1] && value !== "Varies") {
        previousCell.colSpan += 1;
        return;
      }
      const cell = document.createElement(rowHeadings && index === 0 ? "th" : "td");
      if (cell.tagName === "TH") cell.scope = "row";
      if (rowHeadings && value === "Varies") cell.className = "variable-ending";
      cell.append(value);
      row.append(cell);
      previousCell = cell;
    });
  });
  byId(container).append(table);
}

function shuffle(cards) {
  for (let index = cards.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return cards;
}

function caseEndings(form, stem) {
  return form.split(" / ").map((variant) =>
    variant.startsWith(stem) ? "-" + variant.slice(stem.length) : "Varies"
  ).join(" / ");
}

const latinPatterns = new Map();
latinNouns.forEach((noun) => {
  if (!latinPatterns.has(noun.pattern)) latinPatterns.set(noun.pattern, []);
  latinPatterns.get(noun.pattern).push(noun);
});

["latin-singular", "latin-plural"].forEach((container, numberIndex) => {
  const cases = numberIndex === 0
    ? [["Nominativus", 0], ["Vocativus", 5], ["Accusativus", 3], ["Genitivus", 1], ["Dativus", 2], ["Ablativus", 4]]
    : [["Nom. / Voc.", 0], ["Accusativus", 3], ["Genitivus", 1], ["Dat. / Abl.", 2]];
  const rows = cases.map(([label, caseIndex]) => [
    label,
    ...Array.from(latinPatterns.values(), (nouns) => {
      const endings = nouns.flatMap(({ forms, stem }) =>
        caseEndings(forms[caseIndex][numberIndex], stem).split(" / ")
      );
      return endings.includes("Varies") ? "Varies" : [...new Set(endings)].join(" / ");
    }),
  ]);
  renderTable(container, ["Casus", ...latinPatterns.keys()], rows, true);
});
renderTable("greek-table", ["Uppercase", "Lowercase", "Name", "Latin letters"], greekAlphabet);

const latinCards = latinNouns.flatMap(({ declension, meaning, forms }) =>
  forms.flatMap((pair, caseIndex) => pair.map((answer, numberIndex) => ({
    declension,
    noun: forms[0][0] + " (" + meaning + ")",
    form: latinCases[caseIndex] + " " + ["singular", "plural"][numberIndex],
    answer,
  })))
);

let latinDeck = [];
let latinCard;
const filters = byId("declensions");

function nextLatinCard() {
  if (!latinDeck.length) {
    const selected = new Set([...filters.querySelectorAll("input:checked")].map((input) => Number(input.value)));
    latinDeck = shuffle(latinCards.filter((card) => selected.has(card.declension)));
    if (latinDeck.length > 1 && latinDeck.at(-1) === latinCard) {
      latinDeck.unshift(latinDeck.pop());
    }
  }
  latinCard = latinDeck.pop();
  byId("latin-answer").textContent = "";
  byId("latin-reveal").disabled = !latinCard;
  byId("latin-next").disabled = !latinCard;
  byId("latin-prompt").textContent = latinCard
    ? latinCard.form + " of " + latinCard.noun
    : "Select at least one declension.";
}

const declensionNumbers = [...new Set(latinNouns.map((noun) => noun.declension))];
declensionNumbers.forEach((number) => {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = number;
  input.checked = true;
  label.append(input, " " + number);
  filters.append(label);
});
filters.addEventListener("change", () => {
  latinDeck = [];
  nextLatinCard();
});
byId("latin-reveal").addEventListener("click", () => {
  byId("latin-answer").textContent = latinCard.answer;
});
byId("latin-next").addEventListener("click", nextLatinCard);
nextLatinCard();

const greekInput = byId("greek-input");
const greekCheck = byId("greek-check");
const greekNext = byId("greek-next");
const greekFeedback = byId("greek-feedback");
const segmenter = new Intl.Segmenter("el", { granularity: "grapheme" });
const [firstGreekWord, ...remainingGreekWords] = greekWords;
let greekDeck = [...shuffle(remainingGreekWords), firstGreekWord];
let greekCard;

function nextGreekWord() {
  if (!greekDeck.length) {
    greekDeck = shuffle([...greekWords]);
    if (greekDeck.length > 1 && greekDeck.at(-1) === greekCard) {
      greekDeck.unshift(greekDeck.pop());
    }
  }
  greekCard = greekDeck.pop();
  byId("greek-word").textContent = greekCard.word;
  greekInput.value = "";
  greekInput.readOnly = false;
  greekCheck.disabled = false;
  greekNext.disabled = true;
  greekFeedback.replaceChildren();
}

const normalize = (answer) => answer.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

byId("greek-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (greekCheck.disabled) return;
  const guess = normalize(greekInput.value);
  if (!guess) {
    greekFeedback.textContent = "Enter a transliteration to check your answer.";
    greekInput.focus();
    return;
  }

  const correct = greekCard.answers.some((answer) => normalize(answer) === guess);
  const result = document.createElement("strong");
  result.textContent = (correct ? "Correct. " : "Try another word. ") + "Answer: " + greekCard.answers[0];
  const letters = document.createElement("p");
  const breakdown = document.createElement("span");
  breakdown.lang = "grc";
  breakdown.textContent = Array.from(segmenter.segment(greekCard.word), ({ segment }) => segment).join(" · ");
  letters.append("Letters: ", breakdown);
  greekFeedback.replaceChildren(result, letters);
  if (greekCard.note) {
    const note = document.createElement("p");
    note.textContent = greekCard.note;
    greekFeedback.append(note);
  }
  greekInput.readOnly = true;
  greekNext.disabled = false;
  greekCheck.disabled = true;
  greekNext.focus();
});

greekNext.addEventListener("click", () => {
  nextGreekWord();
  greekInput.focus();
});
nextGreekWord();
