// Function to process the image when it's uploaded, pasted, or dropped
function processImageFromFile(file) {
    const loadingMessage = document.getElementById("loadingMessage");
    const resultElement = document.getElementById("result");
    const extractedTextPrompt = document.getElementById("extractedTextPrompt");
    const downloadButton = document.getElementById("downloadButton");
    const imagePreview = document.getElementById("imagePreview");
  
    // Show loading message and clear previous results
    loadingMessage.style.display = "block";
    resultElement.textContent = "";
    extractedTextPrompt.style.display = "none"; // Hide text prompt initially
  
    // Use Tesseract.js to recognize text from the image
    Tesseract.recognize(
      file, // The image file to process
      'eng+vie', // OCR languages (English + Vietnamese)
      {
        logger: (info) => console.log(info) // Optional: log OCR progress
      }
    ).then(({ data: { text } }) => {
      // Display the extracted text and show the text prompt
      resultElement.textContent = text;
      extractedTextPrompt.style.display = "block"; // Show the extracted text section
      downloadButton.style.display = "block"; // Show the download button
      loadingMessage.style.display = "none"; // Hide loading message
    }).catch((error) => {
      // If there's an error, show an error message
      resultElement.textContent = "Error processing image: " + error.message;
      loadingMessage.style.display = "none"; // Hide loading message
    });
  }
  
  // Listen for the "paste" event when the user pastes an image onto the page
  document.addEventListener("paste", (event) => {
    const fileInput = document.getElementById("fileInput");
    const loadingMessage = document.getElementById("loadingMessage");
    const resultElement = document.getElementById("result");
    const extractedTextPrompt = document.getElementById("extractedTextPrompt");
    const downloadButton = document.getElementById("downloadButton");
    const imagePreview = document.getElementById("imagePreview");
  
    // Get the items from the clipboard
    const clipboardItems = event.clipboardData.items;
  
    // Check for image content in the clipboard
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
  
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile(); // Get the image as a file
        const url = URL.createObjectURL(blob); // Create an object URL for the image
  
        // Show the image preview and start processing
        imagePreview.src = url;
        imagePreview.style.display = "block"; // Display the image
        processImageFromFile(blob); // Process the image with OCR
        break; // Exit the loop once an image is found
      }
    }
  });
  
  // Listen for the "drop" event for dragging and dropping an image
  document.getElementById("dropArea").addEventListener("drop", (event) => {
    event.preventDefault(); // Prevent the default behavior of the drop
    const files = event.dataTransfer.files;
  
    // Check if any file is dropped and if it's an image
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      const file = files[0];
      const reader = new FileReader();
  
      reader.onload = (e) => {
        // Show the image preview and start processing
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block"; // Display the image
        processImageFromFile(file); // Process the image with OCR
      };
  
      reader.readAsDataURL(file); // Read the image file as a data URL
    } else {
      alert("Please drop an image file.");
    }
  });
  
  // Allow for dragging over the drop area
  document.getElementById("dropArea").addEventListener("dragover", (event) => {
    event.preventDefault(); // Allow the drop
    event.dataTransfer.dropEffect = "copy"; // Indicate a copy operation
  });
  
  // Function to download the extracted text as a .txt file
  document.getElementById("downloadButton").addEventListener("click", () => {
    const resultText = document.getElementById("result").textContent;
    const blob = new Blob([resultText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "extracted-text.txt"; // Set the filename for the downloaded text file
    link.click(); // Trigger the download
  });
  