import { BlobWriter, HttpReader, TextReader, ZipWriter } from "@zip.js/zip.js";

const ANY_CATEGORY: string = "any";
// Define an object that maps category numbers to names
const categoryNames: { [key: number]: string } = {
    [ANY_CATEGORY]: "Any",
    10: "Books",
    11: "Films",
    12: "Music",
    13: "Musician & Theathres",
    14: "Television",
    15: "Video Games",
    16: "Board Games",
    17: "Sience & Nature",
    18: "Computers",
    19: "Mathematics",
    20: "Myhtodology",
    21: "Sports",
    22: "Georaphy",
    23: "Hystory",
    24: "Politics",
    25: "Art",
    26: "Celebrities",
    27: "Animals",
    28: "Vehicles",
    29: "Comics",
    30: "Gadgets",
};

onmessage = async (e) => {
    const { currentCorrectScore, selectAmount, wrongAnswers, selectedCategory, selectDifficulty } = e.data;

    // Use the categoryNames object to get the category name
    const categoryName = categoryNames[selectedCategory] || "Unknown Category";

    const resultPercentage = Math.round((currentCorrectScore / selectAmount) * 100);
    const text = `You answered ${currentCorrectScore} questions correctly of total ${selectAmount} and ${wrongAnswers} questions incorrectly.
  Your result is ${resultPercentage}%
  You choose category of "${categoryName}" with difficulty "${selectDifficulty}".`;

    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    await zipWriter.add("QuizScore.txt", new TextReader(text));
    const blob = await zipWriter.close();
    postMessage(blob);
};

//----------------------------------
