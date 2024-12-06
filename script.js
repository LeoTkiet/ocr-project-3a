const stopwords = [
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "for",
  "nor",
  "on",
  "in",
  "at",
  "by",
  "with",
  "about",
  "as",
  "from",
  "to",
  "for",
  "over",
  "under",
  "above",
  "below",
  "between",
  "this",
  "that",
  "these",
  "those",
  "is",
  "am",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "of",
  "with",
  "it",
  "they",
  "you",
  "he",
  "she",
  "we",
  "i",
  "me",
  "my",
  "your",
  "his",
  "her",
  "its",
  "their",
  "our",
  "theirs",
  "ours",

  // Stopwords tiếng Việt
  "bị",
  "bởi",
  "cả",
  "các",
  "cái",
  "cần",
  "càng",
  "chỉ",
  "chiếc",
  "cho",
  "chứ",
  "chưa",
  "chuyện",
  "có",
  "có_thể",
  "cứ",
  "của",
  "cùng",
  "cũng",
  "đã",
  "đang",
  "đây",
  "để",
  "đến_nỗi",
  "đều",
  "điều",
  "do",
  "đó",
  "được",
  "dưới",
  "gì",
  "khi",
  "không",
  "là",
  "lại",
  "lên",
  "lúc",
  "mà",
  "mỗi",
  "một_cách",
  "này",
  "nên",
  "nếu",
  "ngay",
  "nhiều",
  "như",
  "nhưng",
  "những",
  "nơi",
  "nữa",
  "phải",
  "qua",
  "ra",
  "rằng",
  "rất",
  "rồi",
  "sau",
  "sẽ",
  "so",
  "sự",
  "tại",
  "theo",
  "thì",
  "trên",
  "trước",
  "từ",
  "từng",
  "và",
  "vẫn",
  "vào",
  "vậy",
  "vì",
  "việc",
  "với",
  "vừa",
];

// Hàm tính TF-IDF
function calculateTfIdf(text) {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopwords.includes(word));
  const wordCounts = {};
  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  const totalWords = words.length;
  const tf = {};
  for (const word in wordCounts) {
    tf[word] = wordCounts[word] / totalWords;
  }

  const idf = {};
  for (const word in wordCounts) {
    idf[word] = Math.log(totalWords / (1 + wordCounts[word]));
  }

  const tfIdf = {};
  for (const word in tf) {
    tfIdf[word] = tf[word] * idf[word];
  }

  return tfIdf;
}

// Giả lập hàm API YAKE với TF-IDF
async function extractKeywordsWithTfIdf(text) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tfIdf = calculateTfIdf(text);
      const keywordArray = Object.keys(tfIdf).map((word) => ({
        word: word,
        score: tfIdf[word],
      }));

      keywordArray.sort((a, b) => b.score - a.score);
      const numKeywords = Math.min(
        10,
        Math.ceil(Object.keys(tfIdf).length / 2)
      );
      const topKeywords = keywordArray.slice(0, numKeywords);

      resolve(topKeywords);
    }, 1500);
  });
}

// Hàm xử lý hình ảnh được tải lên
async function processImageFromFile(file) {
  const loadingMessage = document.getElementById("loadingMessage");
  const resultElement = document.getElementById("result");
  const extractedTextPrompt = document.getElementById("extractedTextPrompt");
  const downloadButton = document.getElementById("downloadButton");
  const copyButton = document.getElementById("copyButton");
  const imagePreview = document.getElementById("imagePreview");
  const keywordsPrompt = document.getElementById("keywordsPrompt");
  const keywordsList = document.getElementById("keywordsList");
  const searchOptionsPrompt = document.getElementById("searchOptionsPrompt");

  loadingMessage.style.display = "block";
  resultElement.textContent = "";
  extractedTextPrompt.style.display = "none";
  keywordsPrompt.style.display = "none";
  searchOptionsPrompt.style.display = "none";

  const reader = new FileReader();
  reader.onloadend = function () {
    imagePreview.src = reader.result;
    imagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);

  Tesseract.recognize(file, "eng+vie", { logger: (info) => console.log(info) })
    .then(async ({ data: { text } }) => {
      resultElement.textContent = text;
      extractedTextPrompt.style.display = "block";
      downloadButton.style.display = "block";
      copyButton.style.display = "block";
      loadingMessage.style.display = "none";

      const keywords = await extractKeywordsWithTfIdf(text);
      keywordsList.innerHTML = "";

      keywords.forEach((keyword) => {
        const listItem = document.createElement("li");
        listItem.textContent = keyword.word;
        keywordsList.appendChild(listItem);
      });

      keywordsPrompt.style.display = "block";
      searchOptionsPrompt.style.display = "block";
    })
    .catch((error) => {
      resultElement.textContent = "Lỗi xử lý hình ảnh: " + error.message;
      loadingMessage.style.display = "none";
    });
}

// Thêm sự kiện cho nút copy
document.getElementById("copyButton").addEventListener("click", () => {
  const resultText = document.getElementById("result").textContent;
  navigator.clipboard
    .writeText(resultText)
    .then(() => {
      alert("Text copied to clipboard!");
    })
    .catch((err) => {
      alert("Failed to copy text: ", err);
    });
});

// Thêm sự kiện cho nút tìm kiếm
document.getElementById("searchButton").addEventListener("click", () => {
  const selectedEngine = document.getElementById("searchEngine").value;
  const keywords = Array.from(document.getElementById("keywordsList").children)
    .map((li) => li.textContent)
    .join(" ");

  let searchUrl;
  if (selectedEngine === "google") {
    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      keywords
    )}`;
  } else {
    searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(
      keywords
    )}`;
  }

  // Mở tab mới với kết quả tìm kiếm
  window.open(searchUrl, "_blank");
});

// Tải về văn bản đã trích xuất
document.getElementById("downloadButton").addEventListener("click", () => {
  const resultText = document.getElementById("result").textContent;
  const blob = new Blob([resultText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "extracted-text.txt";
  link.click();
});

// Xử lý sự kiện tải file
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    processImageFromFile(file);
  }
});

// Xử lý kéo và thả file
document.getElementById("dropArea").addEventListener("dragover", (event) => {
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("dropArea").addEventListener("drop", (event) => {
  event.preventDefault();
  event.stopPropagation();
  const file = event.dataTransfer.files[0];
  if (file) {
    processImageFromFile(file);
  }
});

// Xử lý sự kiện dán hình ảnh từ clipboard
document.addEventListener("paste", function (event) {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      processImageFromFile(file);
    }
  }
});
