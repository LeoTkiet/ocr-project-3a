document.getElementById("processButton").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const language = document.getElementById("language").value; // Lấy ngôn ngữ người dùng chọn
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
        downloadButton.style.display = "none";

        try {
            const { data: { text } } = await Tesseract.recognize(reader.result, language, {
                logger: info => console.log(info),
            });

            resultElement.textContent = text;

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
