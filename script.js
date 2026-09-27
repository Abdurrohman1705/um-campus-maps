// ======================================================
// UM CAMPUS MAPS
// SCRIPT.JS - V3.1
// ======================================================


// ======================================================
// 1. POSISI AWAL PETA
// ======================================================

const umLocation = [-7.9617, 112.6177];


// ======================================================
// 2. MEMBUAT PETA
// ======================================================

const map = L.map("map").setView(umLocation, 16);


// ======================================================
// 3. LAYER OPENSTREETMAP
// ======================================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ======================================================
// 4. DATA LOKASI UM
// ======================================================

const locations = [

    {
        nama: "Fakultas Ilmu Sosial UM",
        kategori: "Gedung",
        lat: -7.9641526,
        lng: 112.6177915,
        deskripsi:
            "Fakultas Ilmu Sosial Universitas Negeri Malang, Kampus I UM."
    },

    {
        nama: "Fakultas Ilmu Pendidikan UM",
        kategori: "Gedung",
        lat: -7.9625204,
        lng: 112.6151851,
        deskripsi:
            "Fakultas Ilmu Pendidikan Universitas Negeri Malang, Kampus I UM."
    },

    {
        nama: "Masjid Al-Hikmah UM",
        kategori: "Fasilitas",
        lat: -7.961398407299380,
        lng: 112.61702580905700,
        deskripsi:
            "Masjid Al-Hikmah Universitas Negeri Malang yang berada di kompleks Kampus I UM."
    },

    {
        nama: "Graha Cakrawala UM",
        kategori: "Fasilitas",
        lat: -7.959254723351540,
        lng: 112.61833401090200,
        deskripsi:
            "Graha Cakrawala merupakan gedung pertemuan serbaguna Universitas Negeri Malang."
    },

    {
        nama: "Perpustakaan UM",
        kategori: "Fasilitas",
        lat: -7.962081463376340,
        lng: 112.61655927837600,
        deskripsi:
            "Perpustakaan Universitas Negeri Malang yang mendukung kegiatan pembelajaran dan penelitian mahasiswa."
    }

];


// ======================================================
// 5. PENYIMPANAN MARKER
// ======================================================

let markers = [];


// ======================================================
// 6. MENAMPILKAN MARKER LOKASI UM
// ======================================================

function tampilkanLokasi(data) {

    // Hapus marker sebelumnya
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });

    markers = [];


    // Membuat marker
    data.forEach(function(lokasi) {

        const marker = L.marker([
            lokasi.lat,
            lokasi.lng
        ]).addTo(map);


        // Popup informasi
        marker.bindPopup(`
            <div style="min-width:240px">

                <h3 style="
                    margin-top:0;
                    margin-bottom:8px;
                ">
                    ${lokasi.nama}
                </h3>

                <p>
                    <strong>Kategori:</strong>
                    ${lokasi.kategori}
                </p>

                <p>
                    ${lokasi.deskripsi}
                </p>

                <hr>

                <p style="font-size:12px;">
                    📍 Latitude:
                    ${lokasi.lat}
                    <br>

                    📍 Longitude:
                    ${lokasi.lng}
                </p>

            </div>
        `);

        markers.push(marker);

    });

}


// ======================================================
// 7. TAMPILKAN SEMUA LOKASI SAAT WEBSITE DIBUKA
// ======================================================

tampilkanLokasi(locations);


// ======================================================
// 8. FILTER KATEGORI
// ======================================================

function filterCategory(kategori) {

    if (kategori === "Semua") {

        tampilkanLokasi(locations);

        return;
    }


    const hasil = locations.filter(function(lokasi) {

        return lokasi.kategori === kategori;

    });


    tampilkanLokasi(hasil);


    if (hasil.length === 0) {

        alert(
            "Belum ada lokasi untuk kategori " +
            kategori
        );

    }

}


// ======================================================
// 9. FITUR PENCARIAN
// ======================================================

const searchButton =
    document.getElementById("searchButton");

const searchInput =
    document.getElementById("searchInput");


searchButton.addEventListener(
    "click",
    function() {

        const keyword =
            searchInput.value
                .toLowerCase()
                .trim();


        if (keyword === "") {

            tampilkanLokasi(locations);

            return;
        }


        const hasil = locations.filter(
            function(lokasi) {

                return (

                    lokasi.nama
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    lokasi.kategori
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    lokasi.deskripsi
                        .toLowerCase()
                        .includes(keyword)

                );

            }
        );


        tampilkanLokasi(hasil);


        if (hasil.length === 0) {

            alert(
                'Lokasi "' +
                searchInput.value +
                '" tidak ditemukan.'
            );

        }

    }
);


// ======================================================
// 10. PENCARIAN DENGAN ENTER
// ======================================================

searchInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {

            searchButton.click();

        }

    }
);


// ======================================================
// 11. V3.1 - LOKASI SAYA
// ======================================================

const myLocationButton =
    document.getElementById("myLocationButton");

let myLocationMarker = null;


// ======================================================
// 12. TOMBOL LOKASI SAYA
// ======================================================

myLocationButton.addEventListener(
    "click",
    function() {

        // Cek apakah browser mendukung GPS
        if (!navigator.geolocation) {

            alert(
                "Browser kamu tidak mendukung fitur lokasi."
            );

            return;
        }


        // Ubah teks tombol
        myLocationButton.innerHTML =
            "⏳ Mencari lokasi...";


        // Meminta lokasi pengguna
        navigator.geolocation.getCurrentPosition(

            // ==========================================
            // JIKA LOKASI BERHASIL DIDAPATKAN
            // ==========================================

            function(position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                // Hapus marker lokasi sebelumnya
                if (myLocationMarker) {

                    map.removeLayer(
                        myLocationMarker
                    );

                }


                // Buat marker lokasi pengguna
                myLocationMarker =
                    L.marker(
                        [
                            latitude,
                            longitude
                        ]
                    ).addTo(map);


                // Popup lokasi pengguna
                myLocationMarker.bindPopup(`
                    <div style="min-width:200px">

                        <h3>
                            📍 Lokasi Saya
                        </h3>

                        <p>
                            <strong>Latitude:</strong><br>
                            ${latitude.toFixed(6)}
                        </p>

                        <p>
                            <strong>Longitude:</strong><br>
                            ${longitude.toFixed(6)}
                        </p>

                    </div>
                `);


                // Buka popup
                myLocationMarker.openPopup();


                // Pindahkan peta ke lokasi pengguna
                map.setView(
                    [
                        latitude,
                        longitude
                    ],
                    18
                );


                // Kembalikan teks tombol
                myLocationButton.innerHTML =
                    "📍 Lokasi Saya";

            },


            // ==========================================
            // JIKA TERJADI ERROR
            // ==========================================

            function(error) {

                myLocationButton.innerHTML =
                    "📍 Lokasi Saya";


                switch (error.code) {

                    case error.PERMISSION_DENIED:

                        alert(
                            "Akses lokasi ditolak. " +
                            "Silakan izinkan akses lokasi pada browser."
                        );

                        break;


                    case error.POSITION_UNAVAILABLE:

                        alert(
                            "Lokasi tidak tersedia."
                        );

                        break;


                    case error.TIMEOUT:

                        alert(
                            "Waktu pencarian lokasi habis. " +
                            "Silakan coba lagi."
                        );

                        break;


                    default:

                        alert(
                            "Terjadi kesalahan saat mengambil lokasi."
                        );

                }

            },


            // ==========================================
            // PENGATURAN GPS
            // ==========================================

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }

        );

    }
);


// ======================================================
// 13. SELESAI
// ======================================================