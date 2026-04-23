import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const flatId = urlParams.get('id');

async function loadDetails() {
    if (!flatId) return;

    try {
        const docRef = doc(db, "flats", flatId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const flat = docSnap.data();
            renderUI(flat);
        }
    } catch (err) { console.error(err); }
}

function renderUI(flat) {
    // 1. Image Gallery
    const mainImg = document.getElementById('main-view');
    const thumbBox = document.getElementById('gallery-thumbs');
    
    if (flat.imageUrls && flat.imageUrls.length > 0) {
        mainImg.src = flat.imageUrls[0];
        thumbBox.innerHTML = flat.imageUrls.map((url, i) => `
            <div class="thumb-item ${i === 0 ? 'active' : ''}" onclick="window.updateGallery('${url}', this)">
                <img src="${url}">
            </div>
        `).join("");
    }

    // 2. Info Header
    document.getElementById('flat-price').innerText = `₹${Number(flat.price).toLocaleString()}`;
    document.getElementById('flat-title').innerText = flat.title;
    document.getElementById('flat-location').innerHTML = `
        <i class="fas fa-location-dot" style="color: var(--gold);"></i>
        ${flat.location}
    `;

    // 3. Highlights & Description
    document.getElementById('flat-description').innerText = flat.description || "No description provided.";
    
    const highlights = [
        { icon: 'fas fa-expand-arrows-alt', text: `${flat.size} sq.ft` },
        { icon: 'fas fa-file-contract', text: "7/12 Extract Ready" },
        { icon: 'fas fa-road', text: "Asphalt Road Access" },
        { icon: 'fas fa-bolt', text: "Electricity Ready" }
    ];

    document.getElementById('flat-highlights').innerHTML = highlights.map(h => `
        <div class="highlight-item">
            <i class="${h.icon}"></i>
            ${h.text}
        </div>
    `).join("");

    // 4. Video Logic
    const videoSec = document.getElementById('video-section');
    const videoEmbed = document.getElementById('video-embed');
    
    if (flat.videoLink && flat.videoLink.trim() !== "") {
        const embedUrl = getYoutubeEmbed(flat.videoLink);
        if (embedUrl) {
            videoSec.style.display = 'block';
            videoEmbed.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
        }
    } else if (flat.videoEmbed && flat.videoEmbed.trim() !== "") {
        videoSec.style.display = 'block';
        videoEmbed.innerHTML = flat.videoEmbed;
    }
}

// Global Gallery Switcher
window.updateGallery = (url, el) => {
    document.getElementById('main-view').src = url;
    document.querySelectorAll('.thumb-item').forEach(th => th.classList.remove('active'));
    el.classList.add('active');
};

function getYoutubeEmbed(url) {
    let id = "";
    if (url.includes("youtube.com/watch?v=")) {
        id = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
        id = url.split("youtu.be/")[1].split("?")[0];
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
}

document.addEventListener('DOMContentLoaded', loadDetails);
