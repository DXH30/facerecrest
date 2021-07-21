const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataUrl(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function ubahkebase64() {
    const file = document.querySelector('#foto');
}
