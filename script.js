document.getElementById("processButton").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const loadingMessage = document.getElementById("loadingMessage");
    const resultElement = document.getElementById("result");
    const downloadButton = document.getElementById("downloadButton");

    if (fileInput.files.length === 0) {
        alert("Please select an image first.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
        loadingMessage.style.display = "block";
        resultElement.textContent = "";
        downloadButton.style.display = "none"; // Ẩn nút download khi bắt đầu xử lý

        try {
            const { data: { text } } = await Tesseract.recognize(reader.result, 'vie', {
                logger: info => console.log(info), // Log progress (optional)
            });

            resultElement.textContent = text;

            // Hiển thị nút download nếu OCR thành công
            if (text.trim() !== "") {
                downloadButton.style.display = "inline-block";
            }
        } catch (error) {
            resultElement.textContent = "Error processing image: " + error.message;
        } finally {
            loadingMessage.style.display = "none";
        }
    };

    reader.readAsDataURL(file);
});

// Sự kiện cho nút Download
document.getElementById("downloadButton").addEventListener("click", () => {
    const resultText = document.getElementById("result").textContent;

    // Kiểm tra nếu không có kết quả OCR
    if (!resultText || resultText.trim() === "") {
        alert("No OCR result to download!");
        return;
    }

    // Tạo file văn bản từ kết quả OCR
    const blob = new Blob([resultText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ocr-result.txt';
    link.click();
});
