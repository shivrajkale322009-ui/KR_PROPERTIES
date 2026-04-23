import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const flatGrid = document.querySelector('.flat-grid');
const adminBar = document.getElementById('admin-bar');
const siteWrapper = document.getElementById('site-wrapper');
const modal = document.getElementById('plot-modal');
const plotForm = document.getElementById('plot-form');
let isAdmin = false;

// 1. AUTH STATE
onAuthStateChanged(auth, (user) => {
    isAdmin = !!user;
    if (isAdmin) { adminBar.style.display = 'flex'; siteWrapper.style.paddingTop = '50px'; }
    else { adminBar.style.display = 'none'; siteWrapper.style.paddingTop = '0'; }
    loadRealtimeFlats();
});

document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

// 2. IMAGE COMPRESSOR
const compressImage = async (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader(); reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image(); img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 800; let w = img.width, h = img.height;
                if (w > MAX) { h *= MAX / w; w = MAX; }
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        };
    });
};

// 3. STORAGE FOR EDITING
let currentImageArray = [];

function loadRealtimeFlats() {
    if (!flatGrid) return; // Grid removed from DOM
    const q = query(collection(db, "flats"));
    onSnapshot(q, (snapshot) => {
        console.log("Firestore Update: " + snapshot.size + " flats found.");
        flatGrid.innerHTML = "";
        snapshot.forEach((document) => {
            console.log("Rendering flat: " + document.id);
            renderFlat(document.data(), document.id);
        });
    }, (err) => {
        console.error("Firestore Error: ", err);
        alert("Firestore Error: " + err.message);
    });
}

function renderFlat(flat, id) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `
        <div class="project-img">
            <img src="${flat.imageUrls && flat.imageUrls[0] ? flat.imageUrls[0] : 'images/hero-main.jpg'}" alt="${flat.title}">
            <div class="project-badge">${flat.location}</div>
            <div class="admin-controls" style="display: ${isAdmin ? 'flex' : 'none'}; position: absolute; top: 1rem; right: 1rem; gap: 0.5rem; z-index: 10;">
                <button class="edit-btn btn" data-id="${id}" style="padding: 0.5rem 1rem; font-size: 0.7rem; background: var(--white); color: var(--navy);">Edit</button>
                <button class="delete-btn btn" data-id="${id}" style="padding: 0.5rem 1rem; font-size: 0.7rem; background: #ef4444; color: white;">Delete</button>
            </div>
        </div>
        <div class="project-info">
            <div class="project-price">₹${Number(flat.price).toLocaleString()}</div>
            <h3 class="premium-font">${flat.title}</h3>
            <div class="project-meta">
                <span><i class="fas fa-expand-arrows-alt"></i> ${flat.size} sq.ft</span>
                <span><i class="fas fa-map-marker-alt"></i> ${flat.location}</span>
            </div>
            <a href="plot-details.html?id=${id}" class="btn btn-gold" style="width: 100%; margin-top: 1.5rem; padding: 0.8rem; font-size: 0.85rem;">View Details</a>
        </div>
    `;
    flatGrid.appendChild(card);
}

// 4. FORM HANDLING
document.getElementById('add-flat-btn').addEventListener('click', () => {
    plotForm.reset(); document.getElementById('edit-id').value = "";
    currentImageArray = []; renderImageManager();
    document.getElementById('modal-title').innerText = "Create Global Flat Listing";
    modal.style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');

// IMAGE MANAGER UI
function renderImageManager() {
    const manager = document.getElementById('image-manager');
    if (!manager) return;
    manager.innerHTML = currentImageArray.map((url, i) => `
        <div style="position:relative; width:60px; height:60px; margin-right:5px;">
            <img src="${url}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">
            <button type="button" onclick="window.removeAdminImg(${i})" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:18px; height:18px; cursor:pointer; font-size:10px;">X</button>
        </div>
    `).join("");
}
window.removeAdminImg = (index) => {
    currentImageArray.splice(index, 1);
    renderImageManager();
};

plotForm.addEventListener('submit', async (e) => {
    e.preventDefault(); const saveBtn = document.getElementById('save-btn');
    saveBtn.innerText = "Processing..."; saveBtn.disabled = true;
    const id = document.getElementById('edit-id').value;

    // Get basic fields
    const flatData = {
        title: document.getElementById('title').value,
        price: Number(document.getElementById('price').value),
        location: document.getElementById('location').value,
        size: document.getElementById('size').value,
        description: document.getElementById('description').value,
        videoLink: document.getElementById('videoLink').value,
        videoEmbed: document.getElementById('videoEmbed').value,
        listingType: document.getElementById('listingType').value
    };

    try {
        // Add images if any
        const imageFiles = document.getElementById('imageFiles').files;
        if (imageFiles.length > 0) {
            for (const f of imageFiles) {
                currentImageArray.push(await compressImage(f));
            }
            flatData.imageUrls = currentImageArray;
        }

        if (id) { await updateDoc(doc(db, "flats", id), flatData); }
        else { flatData.createdAt = serverTimestamp(); await addDoc(collection(db, "flats"), flatData); }
        modal.style.display = 'none';
    } catch (err) { alert("Failed. Check internet/image sizes."); } finally { saveBtn.innerText = "Publish"; saveBtn.disabled = false; }
});

flatGrid.addEventListener('click', async (e) => {
    const id = e.target.dataset.id; if (!id) return;
    if (e.target.classList.contains('delete-btn')) { if (confirm("Delete?")) await deleteDoc(doc(db, "flats", id)); }
    if (e.target.classList.contains('edit-btn')) {
        const snap = await getDoc(doc(db, "flats", id));
        if (snap.exists()) {
            const d = snap.data(); document.getElementById('edit-id').value = id;
            document.getElementById('title').value = d.title; document.getElementById('price').value = d.price;
            document.getElementById('location').value = d.location; document.getElementById('size').value = d.size;
            document.getElementById('description').value = d.description || "";
            document.getElementById('video-link').value = d.videoLink || "";
            document.getElementById('video-embed-field').value = d.videoEmbed || "";
            currentImageArray = d.imageUrls || [];
            renderImageManager();
            modal.style.display = 'flex';
        }
    }
});
