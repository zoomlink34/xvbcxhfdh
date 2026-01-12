const firebaseConfig = {
    apiKey: "AIzaSy...", // আপনার সঠিক API Key দিন
    databaseURL: "https://the-10-million-pixels-plus-default-rtdb.firebaseio.com/",
    projectId: "the-10-million-pixels-plus"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
const mover = document.getElementById('mover');
const viewport = document.getElementById('viewport');

const blockW = 60, blockH = 40;
const cols = 100, rows = 200; 
cv.width = cols * blockW; cv.height = rows * blockH;

let scale = 0.2; // শুরুতে একটু ছোট দেখাবে
let pX = 0, pY = 0, isDown = false, startX, startY, pixels = {};

function render() {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 1;

    for (let i = 0; i <= cols; i++) {
        ctx.beginPath(); ctx.moveTo(i * blockW, 0); ctx.lineTo(i * blockW, cv.height); ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * blockH); ctx.lineTo(cv.width, j * blockH); ctx.stroke();
    }

    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        if (p.imageUrl) {
            const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
            img.onload = () => { ctx.drawImage(img, p.x, p.y, blockW, blockH); };
        }
    });
}

function updateUI() {
    mover.style.transform = `translate(${pX}px, ${pY}px) scale(${scale})`;
}

// মাউস ও টাচ জুম লজিক
viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    if (e.deltaY < 0) scale = Math.min(scale + zoomSpeed, 2);
    else scale = Math.max(scale - zoomSpeed, 0.1);
    updateUI();
}, { passive: false });

viewport.onmousedown = (e) => { isDown = true; startX = e.clientX - pX; startY = e.clientY - pY; viewport.style.cursor = 'grabbing'; };
window.onmouseup = () => { isDown = false; viewport.style.cursor = 'grab'; };
window.onmousemove = (e) => { if (isDown) { pX = e.clientX - startX; pY = e.clientY - startY; updateUI(); } };

function copyText(val) { navigator.clipboard.writeText(val).then(() => alert("Copied: " + val)); }

db.ref('pixels').on('value', s => {
    pixels = s.val() || {};
    document.getElementById('sold-count').innerText = Object.keys(pixels).length;
    document.getElementById('rem-count').innerText = 20000 - Object.keys(pixels).length;
    render();
});
updateUI();
