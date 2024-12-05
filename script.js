document.getElementById("processButton").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const loadingMessage = document.getElementById("loadingMessage");
    const resultElement = document.getElementById("result");

    if (fileInput.files.length === 0) {
        alert("Please select an image first.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
        loadingMessage.style.display = "block";
        resultElement.textContent = "";

        try {
            const { data: { text } } = await Tesseract.recognize(reader.result, 'eng', {
                logger: info => console.log(info), // Log progress (optional)
            });

            resultElement.textContent = text;
        } catch (error) {
            resultElement.textContent = "Error processing image: " + error.message;
        } finally {
            loadingMessage.style.display = "none";
        }
    };

    reader.readAsDataURL(file);
});