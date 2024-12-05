// Hàm giả lập sử dụng YAKE (hoặc có thể thay bằng API thật)
async function extractKeywordsWithYake(text) {
  // Giả lập trích xuất từ khóa từ văn bản (bạn cần sử dụng thư viện hoặc API thực tế ở đây)
  const keywords = text.split(' ').filter(word => word.length > 3); // Giả lập chỉ lấy các từ dài hơn 3 ký tự
  return keywords.slice(0, 10); // Lấy tối đa 10 từ khóa
}

// Hàm xử lý hình ảnh được tải lên
async function processImageFromFile(file) {
  const loadingMessage = document.getElementById("loadingMessage");
  const resultElement = document.getElementById("result");
  const extractedTextPrompt = document.getElementById("extractedTextPrompt");
  const downloadButton = document.getElementById("downloadButton");
  const imagePreview = document.getElementById("imagePreview");
  const keywordsPrompt = document.getElementById("keywordsPrompt");
  const keywordsList = document.getElementById("keywordsList");
  const searchOptionsPrompt = document.getElementById("searchOptionsPrompt");

  // Hiển thị thông báo đang xử lý và xóa kết quả cũ
  loadingMessage.style.display = "block";
  resultElement.textContent = "";
  extractedTextPrompt.style.display = "none";
  keywordsPrompt.style.display = "none";
  searchOptionsPrompt.style.display = "none";

  // Hiển thị ảnh preview
  const reader = new FileReader();
  reader.onloadend = function() {
      imagePreview.src = reader.result;
      imagePreview.style.display = "block";
  }
  reader.readAsDataURL(file);

  // Sử dụng Tesseract.js để nhận dạng văn bản từ hình ảnh
  Tesseract.recognize(
      file,
      'eng+vie',  // Nhận diện tiếng Anh và tiếng Việt
      { logger: (info) => console.log(info) }
  ).then(async ({ data: { text } }) => {
      // Hiển thị văn bản đã trích xuất
      resultElement.textContent = text;
      extractedTextPrompt.style.display = "block";
      downloadButton.style.display = "block";
      loadingMessage.style.display = "none";

      // Trích xuất từ khóa sử dụng phương pháp YAKE
      const keywords = await extractKeywordsWithYake(text);
      keywordsList.innerHTML = "";

      keywords.forEach((keyword) => {
          const listItem = document.createElement("li");
          listItem.textContent = keyword;
          keywordsList.appendChild(listItem);
      });

      keywordsPrompt.style.display = "block";
      searchOptionsPrompt.style.display = "block";
  }).catch((error) => {
      // Xử lý lỗi
      resultElement.textContent = "Lỗi xử lý hình ảnh: " + error.message;
      loadingMessage.style.display = "none";
  });
}

// Thêm sự kiện cho nút tìm kiếm
document.getElementById("searchButton").addEventListener("click", () => {
  const selectedEngine = document.getElementById("searchEngine").value;
  const keywords = Array.from(document.getElementById("keywordsList").children)
      .map(li => li.textContent)
      .join(" ");

  let searchUrl;
  if (selectedEngine === "google") {
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keywords)}`;
  } else {
      searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(keywords)}`;
  }

  // Mở tab mới với kết quả tìm kiếm
  window.open(searchUrl, '_blank');
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
document.addEventListener("paste", function(event) {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          processImageFromFile(file);
      }
  }
});