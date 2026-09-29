// ======================================================
// UM CAMPUS MAPS
// FINAL V5.0
// Lokasi Saya + Navigasi Real-Time
// GPS Tracking + Re-routing + Filter Akurasi
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
// 3. OPENSTREETMAP
// ======================================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ======================================================
// 4. DATA LOKASI
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
// 5. VARIABEL MARKER
// ======================================================

let markers = [];


// ======================================================
// 6. VARIABEL NAVIGASI
// ======================================================

let routingControl = null;
let currentUserLocation = null;
let myLocationMarker = null;
let watchId = null;
let navigationDestination = null;
let navigationDestinationName = null;
let lastRerouteLocation = null;

// Menyimpan posisi GPS terbaik yang pernah diterima
let bestUserLocation = null;


// ======================================================
// 7. KONFIGURASI GPS
// ======================================================

// Jarak minimum untuk menghitung ulang rute
const REROUTE_DISTANCE = 30;

// Akurasi GPS yang dianggap cukup baik (meter)
const MAX_ACCEPTABLE_ACCURACY = 30;

// Jarak tujuan dianggap sudah sampai (meter)
const ARRIVAL_DISTANCE = 20;


// ======================================================
// 8. INDIKATOR STATUS GPS DI LAYAR
// ======================================================

const gpsStatusEl = document.getElementById("gps-status");

function tampilkanStatusGPS(teks, warna) {
    if (!gpsStatusEl) return;

    gpsStatusEl.style.display = "block";
    gpsStatusEl.textContent = teks;

    if (warna) {
        gpsStatusEl.style.background = warna;
    }
}

function sembunyikanStatusGPS() {
    if (!gpsStatusEl) return;
    gpsStatusEl.style.display = "none";
}


// ======================================================
// 9. MENAMPILKAN MARKER LOKASI
// ======================================================

function tampilkanLokasi(data) {

    markers.forEach(function (marker) {
        map.removeLayer(marker);
    });

    markers = [];

    data.forEach(function (lokasi) {

        const marker = L.marker([lokasi.lat, lokasi.lng]).addTo(map);

        marker.bindPopup(`
            <div style="min-width:250px">
                <h3 style="margin-top:0;margin-bottom:8px;">
                    ${lokasi.nama}
                </h3>

                <p>
                    <strong>Kategori:</strong>
                    ${lokasi.kategori}
                </p>

                <p>${lokasi.deskripsi}</p>

                <hr>

                <p style="font-size:12px;">
                    📍 Latitude: ${lokasi.lat}
                    <br>
                    📍 Longitude: ${lokasi.lng}
                </p>

                <button
                    onclick="mulaiNavigasi(
                        ${lokasi.lat},
                        ${lokasi.lng},
                        '${lokasi.nama.replace(/'/g, "\\'")}'
                    )"
                    style="
                        width:100%;
                        padding:10px;
                        border:none;
                        border-radius:6px;
                        background:#1976d2;
                        color:white;
                        cursor:pointer;
                        font-size:14px;
                    "
                >
                    🧭 Mulai Navigasi
                </button>
            </div>
        `);

        markers.push(marker);
    });
}


// ======================================================
// 10. TAMPILKAN SEMUA LOKASI
// ======================================================

tampilkanLokasi(locations);


// ======================================================
// 11. FILTER KATEGORI
// ======================================================

function filterCategory(kategori) {

    if (kategori === "Semua") {
        tampilkanLokasi(locations);
        return;
    }

    const hasil = locations.filter(function (lokasi) {
        return lokasi.kategori === kategori;
    });

    tampilkanLokasi(hasil);

    if (hasil.length === 0) {
        alert("Belum ada lokasi untuk kategori " + kategori);
    }
}


// ======================================================
// 12. SEARCH
// ======================================================

const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");

searchButton.addEventListener("click", function () {

    const keyword = searchInput.value.toLowerCase().trim();

    if (keyword === "") {
        tampilkanLokasi(locations);
        return;
    }

    const hasil = locations.filter(function (lokasi) {
        return (
            lokasi.nama.toLowerCase().includes(keyword) ||
            lokasi.kategori.toLowerCase().includes(keyword) ||
            lokasi.deskripsi.toLowerCase().includes(keyword)
        );
    });

    tampilkanLokasi(hasil);

    if (hasil.length === 0) {
        alert('Lokasi "' + searchInput.value + '" tidak ditemukan.');
    }
});


// ======================================================
// 13. ENTER UNTUK SEARCH
// ======================================================

searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchButton.click();
    }
});


// ======================================================
// 14. TOMBOL LOKASI SAYA
// ======================================================

const myLocationButton = document.getElementById("myLocationButton");


// ======================================================
// 15. UPDATE LOKASI PENGGUNA (DENGAN FILTER AKURASI)
// ======================================================

function updateUserLocation(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const timestamp = new Date(position.timestamp);

    // ==================================================
    // DEBUG GPS
    // ==================================================

    console.log("=================================");
    console.log("GPS UPDATE");
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Akurasi:", accuracy, "meter");
    console.log("Waktu:", timestamp.toLocaleTimeString());
    console.log("=================================");

    // ==================================================
    // FILTER AKURASI — TOLAK DATA BURUK
    // ==================================================

    if (accuracy > MAX_ACCEPTABLE_ACCURACY) {

        console.warn(
            "❌ GPS DITOLAK — akurasi terlalu buruk:",
            Math.round(accuracy),
            "meter (batas:",
            MAX_ACCEPTABLE_ACCURACY,
            "meter)"
        );

        tampilkanStatusGPS(
            "⚠️ GPS lemah (±" + Math.round(accuracy) + " m). Mencari sinyal...",
            "rgba(200, 80, 0, 0.85)"
        );

        // Keluar — jangan update marker, posisi, atau rute
        return;
    }

    console.log(
        "✅ GPS DITERIMA — akurasi:",
        Math.round(accuracy),
        "meter"
    );

    // ==================================================
    // SIMPAN POSISI TERBAIK
    // ==================================================

    if (
        !bestUserLocation ||
        accuracy < bestUserLocation.accuracy
    ) {
        bestUserLocation = {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy
        };

        console.log(
            "⭐ Posisi terbaik diperbarui:",
            Math.round(accuracy),
            "meter"
        );
    }

    // ==================================================
    // SIMPAN LOKASI SAAT INI
    // ==================================================

    currentUserLocation = {
        lat: latitude,
        lng: longitude,
        accuracy: accuracy
    };

    // ==================================================
    // BUAT MARKER PENGGUNA
    // ==================================================

    if (!myLocationMarker) {

        myLocationMarker = L.marker([latitude, longitude]).addTo(map);

        myLocationMarker.bindPopup(`
            <div>
                <h3>📍 Lokasi Saya</h3>

                <p>
                    <strong>Latitude:</strong><br>
                    <span id="userLatitude">${latitude.toFixed(6)}</span>
                </p>

                <p>
                    <strong>Longitude:</strong><br>
                    <span id="userLongitude">${longitude.toFixed(6)}</span>
                </p>

                <p>
                    <strong>Akurasi:</strong><br>
                    <span id="userAccuracy">±${Math.round(accuracy)} meter</span>
                </p>
            </div>
        `);
    }

    // ==================================================
    // PINDAHKAN MARKER
    // ==================================================

    myLocationMarker.setLatLng([latitude, longitude]);

    // ==================================================
    // UPDATE DATA POPUP
    // ==================================================

    const latElement = document.getElementById("userLatitude");
    const lngElement = document.getElementById("userLongitude");
    const accuracyElement = document.getElementById("userAccuracy");

    if (latElement) latElement.innerText = latitude.toFixed(6);
    if (lngElement) lngElement.innerText = longitude.toFixed(6);

    if (accuracyElement) {
        accuracyElement.innerText = "±" + Math.round(accuracy) + " meter";
    }

    // ==================================================
    // STATUS GPS DI LAYAR
    // ==================================================

    let warnaStatus = "rgba(0, 150, 0, 0.85)";

    if (accuracy > MAX_ACCEPTABLE_ACCURACY * 0.66) {
        warnaStatus = "rgba(200, 150, 0, 0.85)";
    }

    tampilkanStatusGPS(
        "📍 Akurasi GPS: ±" + Math.round(accuracy) + " m",
        warnaStatus
    );

    // Sembunyikan otomatis setelah 5 detik
    setTimeout(sembunyikanStatusGPS, 5000);

    // ==================================================
    // JIKA SEDANG NAVIGASI
    // ==================================================

    if (navigationDestination && lastRerouteLocation) {

        const distanceMoved = map.distance(
            [lastRerouteLocation.lat, lastRerouteLocation.lng],
            [latitude, longitude]
        );

        console.log(
            "Pergerakan sejak routing terakhir:",
            Math.round(distanceMoved),
            "meter"
        );

        if (distanceMoved >= REROUTE_DISTANCE) {

            console.log("♻️ Menghitung ulang rute...");

            lastRerouteLocation = {
                lat: latitude,
                lng: longitude
            };

            hitungUlangRute();
        }
    }

    // ==================================================
    // IKUTI LOKASI PENGGUNA SAAT NAVIGASI
    // ==================================================

    if (navigationDestination) {
        map.setView([latitude, longitude], 18, { animate: true });
    }
}


// ======================================================
// 16. ERROR GPS
// ======================================================

function handleLocationError(error) {

    console.error("GPS ERROR:", error);

    myLocationButton.innerHTML = "📍 Lokasi Saya";

    switch (error.code) {

        case error.PERMISSION_DENIED:
            alert(
                "Akses lokasi ditolak.\n\n" +
                "Silakan izinkan lokasi pada browser."
            );
            break;

        case error.POSITION_UNAVAILABLE:
            alert(
                "Lokasi tidak tersedia.\n\n" +
                "Periksa GPS, Wi-Fi, atau lokasi perangkat."
            );
            break;

        case error.TIMEOUT:
            alert(
                "Waktu pencarian lokasi habis.\n\n" +
                "Coba tekan tombol Lokasi Saya lagi."
            );
            break;

        default:
            alert("Terjadi kesalahan saat mengambil lokasi.");
    }

    sembunyikanStatusGPS();
}


// ======================================================
// 17. MULAI TRACKING GPS
// ======================================================

function mulaiTrackingLokasi() {

    if (!navigator.geolocation) {
        alert("Browser tidak mendukung fitur lokasi.");
        return;
    }

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    // ==================================================
    // HAPUS MARKER USER LAMA (MENCEGAH DUPLIKAT)
    // ==================================================

    if (myLocationMarker) {
        map.removeLayer(myLocationMarker);
        myLocationMarker = null;
    }

    myLocationButton.innerHTML = "⏳ Mencari lokasi...";

    tampilkanStatusGPS(
        "🔍 Mencari sinyal GPS...",
        "rgba(0, 0, 0, 0.75)"
    );

    // ==================================================
    // AMBIL POSISI AWAL
    // ==================================================

    navigator.geolocation.getCurrentPosition(

        function (position) {

            console.log("POSISI AWAL GPS:", position);

            updateUserLocation(position);

            if (currentUserLocation) {
                map.setView(
                    [currentUserLocation.lat, currentUserLocation.lng],
                    18
                );
            }

            myLocationButton.innerHTML = "📍 Lokasi Saya";
        },

        function (error) {
            handleLocationError(error);
        },

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }
    );

    // ==================================================
    // TRACKING BERKELANJUTAN
    // ==================================================

    watchId = navigator.geolocation.watchPosition(

        function (position) {

            updateUserLocation(position);

            myLocationButton.innerHTML = "📍 Lokasi Saya";
        },

        function (error) {
            handleLocationError(error);
        },

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }
    );
}


// ======================================================
// 18. TOMBOL LOKASI SAYA
// ======================================================

myLocationButton.addEventListener("click", function () {
    mulaiTrackingLokasi();
});


// ======================================================
// 19. HITUNG ULANG RUTE
// ======================================================

function hitungUlangRute() {

    if (!currentUserLocation || !navigationDestination) {
        return;
    }

    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    console.log("🧭 ROUTING:");
    console.log(
        "Dari:",
        currentUserLocation.lat,
        currentUserLocation.lng
    );
    console.log(
        "Ke:",
        navigationDestination.lat,
        navigationDestination.lng
    );

    routingControl = L.Routing.control({

        waypoints: [
            L.latLng(
                currentUserLocation.lat,
                currentUserLocation.lng
            ),
            L.latLng(
                navigationDestination.lat,
                navigationDestination.lng
            )
        ],

        router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1"
        }),

        addWaypoints: false,

        createMarker: function () {
            return null;
        },

        routeWhileDragging: false,
        fitSelectedRoutes: false,
        show: true,

        lineOptions: {
            styles: [
                {
                    color: "#1976d2",
                    opacity: 0.9,
                    weight: 6
                }
            ]
        }

    }).addTo(map);

    routingControl.on("routesfound", function (event) {

        const route = event.routes[0];
        const distance = route.summary.totalDistance;
        const time = route.summary.totalTime;

        console.log("Jarak:", distance, "meter");
        console.log("Estimasi:", time, "detik");

        if (distance <= ARRIVAL_DISTANCE) {

            alert(
                "🎉 Kamu sudah sampai di " +
                navigationDestinationName
            );

            hentikanNavigasi();
            return;
        }

        if (lastRerouteLocation && distance > ARRIVAL_DISTANCE) {
            console.log(
                "Rute aktif:",
                (distance / 1000).toFixed(2),
                "km"
            );
        }
    });

    routingControl.on("routingerror", function () {

        console.error("Routing error");

        alert(
            "Rute tidak dapat ditemukan.\n\n" +
            "Pastikan koneksi internet aktif."
        );
    });
}


// ======================================================
// 20. MULAI NAVIGASI
// ======================================================

function mulaiNavigasi(tujuanLat, tujuanLng, namaTujuan) {

    if (!currentUserLocation) {

        alert(
            "Lokasi kamu belum diketahui.\n\n" +
            "Klik 📍 Lokasi Saya terlebih dahulu,\n" +
            "dan tunggu sampai akurasi GPS bagus (±30 m)."
        );

        return;
    }

    navigationDestination = {
        lat: tujuanLat,
        lng: tujuanLng
    };

    navigationDestinationName = namaTujuan;

    lastRerouteLocation = {
        lat: currentUserLocation.lat,
        lng: currentUserLocation.lng
    };

    hitungUlangRute();

    console.log("🧭 NAVIGASI DIMULAI");
    console.log("Tujuan:", namaTujuan);
}


// ======================================================
// 21. HENTIKAN NAVIGASI
// ======================================================

function hentikanNavigasi() {

    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }

    navigationDestination = null;
    navigationDestinationName = null;
    lastRerouteLocation = null;

    console.log("🛑 Navigasi dihentikan");
}


// ======================================================
// 22. SELESAI
// ======================================================