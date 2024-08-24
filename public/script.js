
        const imageCanvas = document.getElementById('imageCanvas');
        const maskCanvas = document.getElementById('maskCanvas');
        const imageCtx = imageCanvas.getContext('2d');
        const maskCtx = maskCanvas.getContext('2d');
        const imageUpload = document.getElementById('imageUpload');
        const clearMaskBtn = document.getElementById('clearMask');
        const downloadMaskBtn = document.getElementById('downloadMask');
        const brushSizeInput = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        const brushTool = document.getElementById('brushTool');
        const eraserTool = document.getElementById('eraserTool');

        let isDrawing = false;
        let brushSize = 25;
        let currentTool = 'brush';

        imageUpload.addEventListener('change', loadImage);
        clearMaskBtn.addEventListener('click', clearMask);
        downloadMaskBtn.addEventListener('click', downloadMask);
        brushSizeInput.addEventListener('input', updateBrushSize);
        
        // Mouse events
        maskCanvas.addEventListener('mousedown', startDrawing);
        maskCanvas.addEventListener('mousemove', draw);
        maskCanvas.addEventListener('mouseup', stopDrawing);
        maskCanvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events
        maskCanvas.addEventListener('touchstart', handleTouchStart);
        maskCanvas.addEventListener('touchmove', handleTouchMove);
        maskCanvas.addEventListener('touchend', stopDrawing);
        
        brushTool.addEventListener('change', () => currentTool = 'brush');
        eraserTool.addEventListener('change', () => currentTool = 'eraser');

        function loadImage(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    imageCanvas.width = img.width;
                    imageCanvas.height = img.height;
                    maskCanvas.width = img.width;
                    maskCanvas.height = img.height;
                    imageCtx.drawImage(img, 0, 0);
                    clearMask();
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }

        function clearMask() {
            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        }

        function updateBrushSize() {
            brushSize = brushSizeInput.value;
            brushSizeValue.textContent = brushSize;
        }

        function startDrawing(e) {
            isDrawing = true;
            draw(e);
        }

        function getScaleFactor() {
            const canvasRect = maskCanvas.getBoundingClientRect();
            return {
                x: maskCanvas.width / canvasRect.width,
                y: maskCanvas.height / canvasRect.height
            };
        }

        function getCoordinates(e) {
            const rect = maskCanvas.getBoundingClientRect();
            const scaleFactor = getScaleFactor();
            if (e.type.startsWith('touch')) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleFactor.x,
                    y: (e.touches[0].clientY - rect.top) * scaleFactor.y
                };
            } else {
                return {
                    x: (e.clientX - rect.left) * scaleFactor.x,
                    y: (e.clientY - rect.top) * scaleFactor.y
                };
            }
        }

        function draw(e) {
            if (!isDrawing) return;
            e.preventDefault(); // Prevent scrolling on touch devices

            const { x, y } = getCoordinates(e);

            const scaleFactor = getScaleFactor().x; // x and y are the same.
            
            maskCtx.beginPath();
            maskCtx.arc(x, y, scaleFactor * brushSize / 2, 0, Math.PI * 2);

            if (currentTool === 'brush') {
                maskCtx.fillStyle = 'white';
                maskCtx.fill();
            } else if (currentTool === 'eraser') {
                maskCtx.fillStyle = 'black';
                maskCtx.fill();
            }
        }

        function stopDrawing() {
            isDrawing = false;
        }

        function handleTouchStart(e) {
            startDrawing(e.touches[0]);
        }

        function handleTouchMove(e) {
            draw(e.touches[0]);
        }

        function downloadMask() {
            const link = document.createElement('a');
            link.download = 'mask.png';
            link.href = maskCanvas.toDataURL();
            link.click();
        }
    