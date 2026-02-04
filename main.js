// ==================== FIREBASE CONFIGURATION ====================
const firebaseConfig = {
    apiKey: "AIzaSyDGYnq4VKq-YGu4RbfoI_ZHez9fishYjZo",
    authDomain: "insan-cemerlang-afd2f.firebaseapp.com",
    projectId: "insan-cemerlang-afd2f",
    storageBucket: "insan-cemerlang-afd2f.appspot.com",
    messagingSenderId: "686649580589",
    appId: "1:686649580589:web:61374bbbd68adb604eaca4",
    measurementId: "G-LNZTQBCE26"
};

// ==================== UTILITY FUNCTIONS ====================
export function formatRupiah(number) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(number);
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

export function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    // Hapus notifikasi sebelumnya
    const existingNotifications = container.querySelectorAll('.notification');
    existingNotifications.forEach(notif => {
        notif.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => notif.remove(), 300);
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'exclamation-circle' : 
                         'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(notification);
    
    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                container.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== FIREBASE FUNCTIONS ====================
async function initializeFirebase() {
    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js');
        const { 
            getFirestore,
            collection,
            getDocs,
            addDoc,
            updateDoc,
            deleteDoc,
            doc,
            getDoc,
            query,
            orderBy,
            serverTimestamp
        } = await import('https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js');
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        return { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, orderBy, serverTimestamp };
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

// ==================== DATA FUNCTIONS ====================
export async function loadOutcomes() {
    try {
        const { db, collection, getDocs, query, orderBy } = await initializeFirebase();
        
        const outcomesRef = collection(db, 'outcomes');
        const q = query(outcomesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const outcomes = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            outcomes.push({
                id: docSnap.id,
                tanggal: data.tanggal,
                deskripsi: data.deskripsi,
                pax: data.pax,
                harga: data.harga,
                createdAt: data.createdAt?.toDate() || new Date()
            });
        });
        
        return outcomes;
    } catch (error) {
        console.error('Error loading outcomes:', error);
        throw error;
    }
}

export async function loadOutcomeById(id) {
    try {
        const { db, doc, getDoc } = await initializeFirebase();
        
        const docSnap = await getDoc(doc(db, 'outcomes', id));
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                tanggal: data.tanggal,
                deskripsi: data.deskripsi,
                pax: data.pax,
                harga: data.harga
            };
        } else {
            throw new Error('Data tidak ditemukan');
        }
    } catch (error) {
        console.error('Error loading outcome by ID:', error);
        throw error;
    }
}

export async function addOutcome(data) {
    try {
        const { db, collection, addDoc, serverTimestamp } = await initializeFirebase();
        
        const outcomeData = {
            tanggal: data.tanggal,
            deskripsi: data.deskripsi,
            pax: Number(data.pax),
            harga: Number(data.harga),
            createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'outcomes'), outcomeData);
        return { id: docRef.id, ...outcomeData };
    } catch (error) {
        console.error('Error adding outcome:', error);
        throw error;
    }
}

export async function updateOutcome(id, data) {
    try {
        const { db, doc, updateDoc, serverTimestamp } = await initializeFirebase();
        
        await updateDoc(doc(db, 'outcomes', id), {
            tanggal: data.tanggal,
            deskripsi: data.deskripsi,
            pax: Number(data.pax),
            harga: Number(data.harga),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating outcome:', error);
        throw error;
    }
}

export async function deleteOutcome(id) {
    try {
        const { db, doc, deleteDoc } = await initializeFirebase();
        
        await deleteDoc(doc(db, 'outcomes', id));
    } catch (error) {
        console.error('Error deleting outcome:', error);
        throw error;
    }
}

// ==================== FUNGSI UNTUK INDEX.HTML ====================
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    async function loadData() {
        console.log('Memuat data dari Firebase...');
        
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const errorState = document.getElementById('errorState');
        const tableBody = document.getElementById('tableBody');
        
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
        if (tableBody) tableBody.innerHTML = '';
        
        try {
            const outcomes = await loadOutcomes();
            
            if (outcomes.length === 0) {
                if (loadingState) loadingState.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
                updateTotalAmount(0);
                return;
            }
            
            let totalAmount = 0;
            let rowNumber = 1;
            
            outcomes.forEach((outcome) => {
                const qty = Number(outcome.pax) || 0;
                const price = Number(outcome.harga) || 0;
                const amount = qty * price;
                totalAmount += amount;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${formatDate(outcome.tanggal)}</td>
                    <td style="max-width: 200px; word-wrap: break-word;">${escapeHtml(outcome.deskripsi || '')}</td>
                    <td style="text-align: center;">${qty}</td>
                    <td class="currency" style="text-align: right;">${formatRupiah(price)}</td>
                    <td class="currency" style="text-align: right;">${formatRupiah(amount)}</td>
                    <td>
                        <div class="action-buttons">
                            <a href="formubah.html?id=${outcome.id}" class="action-btn action-btn-edit" title="Edit Data">
                                <i class="fas fa-edit"></i>
                                <span>Edit</span>
                            </a>
                            <button onclick="showDeleteConfirmation('${outcome.id}', '${escapeHtml(outcome.deskripsi || 'Data')}')" 
                                    class="action-btn action-btn-delete" title="Hapus Data">
                                <i class="fas fa-trash"></i>
                                <span>Hapus</span>
                            </button>
                        </div>
                    </td>
                `;
                if (tableBody) tableBody.appendChild(row);
                rowNumber++;
            });
            
            if (loadingState) loadingState.style.display = 'none';
            updateTotalAmount(totalAmount);
            
        } catch (error) {
            console.error('Error loading data:', error);
            if (loadingState) loadingState.style.display = 'none';
            if (errorState) {
                errorState.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <strong>Gagal memuat data:</strong><br>
                    <span style="font-size: 0.9rem;">${error.message}</span>
                `;
                errorState.style.display = 'block';
            }
            showNotification('Gagal memuat data dari server', 'error');
        }
    }

    function updateTotalAmount(total) {
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            totalElement.textContent = formatRupiah(total);
        }
    }

    window.showDeleteConfirmation = function(id, description) {
        const modal = document.getElementById('deleteModal');
        const modalMessage = document.getElementById('modalMessage');
        
        modalMessage.innerHTML = `
            <p>Anda akan menghapus data outcome:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #e74c3c;">
                <strong style="color: #1a237e;">${escapeHtml(description)}</strong>
            </div>
            <p style="color: #6c757d; font-size: 0.9rem;">Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus?</p>
        `;
        
        modal.style.display = 'flex';
        
        // Setup event listeners
        document.getElementById('cancelBtn').onclick = () => {
            modal.style.display = 'none';
        };
        
        document.getElementById('confirmDeleteBtn').onclick = async () => {
            modal.style.display = 'none';
            
            try {
                await deleteOutcome(id);
                showNotification('Data berhasil dihapus!', 'success');
                
                // Reload data
                await loadData();
                
            } catch (error) {
                console.error('Error deleting data:', error);
                showNotification('Gagal menghapus data: ' + error.message, 'error');
            }
        };
    };

    // Initialize app untuk index.html
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await loadData();
            console.log('Aplikasi BUMDES Outcome Manager siap digunakan');
        } catch (error) {
            console.error('Error initializing app:', error);
            showNotification('Gagal menginisialisasi aplikasi', 'error');
        }
    });
}

// ==================== FUNGSI UNTUK FORMTAMBAH.HTML ====================
if (window.location.pathname.includes('formtambah.html')) {
    window.appFunctions = {
        async addData() {
            const dateInput = document.getElementById('dateInput');
            const descInput = document.getElementById('descInput');
            const qtyInput = document.getElementById('qtyInput');
            const priceInput = document.getElementById('priceInput');
            const addBtn = document.getElementById('addBtn');
            
            // Validasi
            if (!dateInput.value) {
                showNotification('Harap pilih tanggal!', 'error');
                dateInput.focus();
                return;
            }
            
            if (!descInput.value.trim()) {
                showNotification('Harap isi deskripsi!', 'error');
                descInput.focus();
                return;
            }
            
            const qty = parseInt(qtyInput.value);
            const price = parseInt(priceInput.value);
            
            if (!qty || qty <= 0) {
                showNotification('Jumlah harus lebih dari 0!', 'error');
                qtyInput.focus();
                return;
            }
            
            if (!price || price <= 0) {
                showNotification('Harga harus lebih dari 0!', 'error');
                priceInput.focus();
                return;
            }
            
            // Tampilkan loading
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
            addBtn.disabled = true;
            
            try {
                await addOutcome({
                    tanggal: dateInput.value,
                    deskripsi: descInput.value.trim(),
                    pax: qty,
                    harga: price
                });
                
                // Reset form
                descInput.value = '';
                qtyInput.value = '';
                priceInput.value = '';
                
                // Sembunyikan preview
                const previewCard = document.getElementById('previewCard');
                if (previewCard) previewCard.classList.remove('active');
                
                showNotification('Data berhasil ditambahkan!', 'success');
                
                // Fokus ke input deskripsi untuk entri berikutnya
                setTimeout(() => descInput.focus(), 100);
                
            } catch (error) {
                console.error('Error adding data:', error);
                showNotification('Gagal menambahkan data: ' + error.message, 'error');
            } finally {
                addBtn.innerHTML = originalText;
                addBtn.disabled = false;
            }
        }
    };
}