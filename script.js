document.addEventListener('DOMContentLoaded', () => {
    // Camera Morse Code Scanner
    const video = document.getElementById('camera');
    const toggleCameraBtn = document.getElementById('toggleCamera');
    const scanMorseCameraBtn = document.getElementById('scanMorseCamera');
    const copyMorseCameraBtn = document.getElementById('copyMorseCamera');
    const outputCamera = document.getElementById('outputCamera');
    const morseSymbolsOutputCamera = document.getElementById('morseSymbolsCamera');
    let currentCamera = 'environment';

    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: currentCamera } })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((error) => {
                console.error('Error accessing camera:', error);
            });
    }

    toggleCameraBtn.addEventListener('click', () => {
        currentCamera = (currentCamera === 'environment') ? 'user' : 'environment';
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        startCamera();
    });

    scanMorseCameraBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        Tesseract.recognize(
            context.getImageData(0, 0, canvas.width, canvas.height),
            'eng',
            { logger: info => console.log(info) }
        ).then(({ data: { text } }) => {
            outputCamera.textContent = `Morse Code Symbols: ${text}`;
            const morseSymbols = extractMorseSymbols(text);
            morseSymbolsOutputCamera.textContent = morseSymbols;
        });
    });

    copyMorseCameraBtn.addEventListener('click', () => {
        const morseSymbols = morseSymbolsOutputCamera.textContent;
        copyToClipboard(morseSymbols);
    });

    startCamera();

    // Morse Code Encoder/Decoder
    function encodeText() {
        const textToEncode = document.getElementById("inputText").value;
        const morseCodeResult = text_to_morse(textToEncode);
        document.getElementById("outputMorse").innerHTML = "Morse Code: " + morseCodeResult;
    }

    function decodeMorse() {
        const morseToDecode = document.getElementById("inputMorse").value;
        const decodedTextResult = morse_to_text(morseToDecode);
        document.getElementById("outputText").innerHTML = "Decoded Text: " + decodedTextResult;
    }

    // Image Morse Code Scanner
    const inputImage = document.getElementById("inputImage");
    const scanImageBtn = document.getElementById('scanImage');
    const copyMorseImageBtn = document.getElementById('copyMorseImage');
    const outputImage = document.getElementById('outputImage');
    const morseSymbolsOutputImage = document.getElementById('morseSymbolsImage');

    scanImageBtn.addEventListener('click', () => {
        const imageFile = inputImage.files[0];

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const image = new Image();
                image.src = e.target.result;

                image.onload = function () {
                    Tesseract.recognize(
                        image,
                        'eng',
                        { logger: info => console.log(info) }
                    ).then(({ data: { text } }) => {
                        outputImage.textContent = `Morse Code Symbols from Image: ${text}`;
                        const morseSymbols = extractMorseSymbols(text);
                        morseSymbolsOutputImage.textContent = morseSymbols;
                    });
                };
            };

            reader.readAsDataURL(imageFile);
        } else {
            alert("Please select an image.");
        }
    });

    copyMorseImageBtn.addEventListener('click', () => {
        const morseSymbols = morseSymbolsOutputImage.textContent;
        copyToClipboard(morseSymbols);
    });

    // Function to extract Morse code symbols
    function extractMorseSymbols(text) {
        const morseMatches = text.match(/[.-]+/g);
        if (morseMatches) {
            return morseMatches.join(' ');
        } else {
            return 'No Morse code symbols found';
        }
    }

    // Function to copy text to clipboard
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Morse Code copied to clipboard!');
    }
});